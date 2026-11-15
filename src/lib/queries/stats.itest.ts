import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import { closeDb } from "../../db/index.ts";
import { seedUser, setupTestDb, truncateAll } from "../../db/testing.ts";
import { createCard } from "../cards/cards.ts";
import { createDeck } from "../decks/decks.ts";
import { addLanguage } from "../languages/languages.ts";
import { rateCard, studyState, undoLastReview } from "../learning/session.ts";
import { forecast, history, tiles } from "./stats.ts";

before(setupTestDb);
beforeEach(truncateAll);
after(closeDb);

const DAY = 24 * 60 * 60 * 1000;
const yesterday = new Date("2026-11-15T09:00:00Z");
const today = new Date("2026-11-16T09:00:00Z");

async function setup(cards: number) {
  const userId = await seedUser();
  const languageId = await addLanguage(userId, "fr");
  const deckId = await createDeck(userId, languageId, {
    name: "Grundwortschatz",
    newPerDay: 3,
  });
  for (let i = 0; i < cards; i += 1) {
    await createCard(userId, {
      deckId,
      front: `mot ${i}`,
      back: `Wort ${i}`,
      example: null,
      note: null,
      gender: null,
      tags: [],
      reverse: false,
    });
  }
  return { userId, languageId, languageCode: "fr" };
}

async function rateNext(
  scope: Awaited<ReturnType<typeof setup>>,
  rating: 1 | 2 | 3 | 4,
  at: Date,
) {
  const state = await studyState(scope, at);
  assert.ok(state.card, "es sollte eine Karte geben");
  await rateCard({
    userId: scope.userId,
    scheduleId: state.card.scheduleId,
    rating,
    reps: state.card.reps,
    durationMs: 1000,
    now: at,
  });
}

test("Kacheln: neu nach Tageslimit, gelernt heute gegen gestern", async () => {
  const scope = await setup(5);
  await rateNext(scope, 4, yesterday);
  await rateNext(scope, 4, today);
  await rateNext(scope, 4, today);
  await rateNext(scope, 1, today);
  await undoLastReview(scope.userId, scope.languageId, today);

  const t = await tiles(scope, today);
  assert.equal(t.learnedToday, 2);
  assert.equal(t.learnedYesterday, 1);
  assert.equal(t.newToday, 1);
  assert.equal(t.newTotal, 2);
  assert.equal(t.accuracy, null);
});

test("Trefferquote zählt nur Wiederholungen, und Nochmal als Fehler", async () => {
  const scope = await setup(2);
  await rateNext(scope, 4, new Date(today.getTime() - 20 * DAY));
  await rateNext(scope, 4, new Date(today.getTime() - 20 * DAY));
  // Beide sind jetzt längst fällig.
  await rateNext(scope, 3, today);
  await rateNext(scope, 1, today);
  assert.equal((await tiles(scope, today)).accuracy, 50);
});

test("Prognose und Verlauf haben einen Wert je Tag", async () => {
  const scope = await setup(2);
  await rateNext(scope, 4, yesterday);
  await rateNext(scope, 1, today);

  const days = await forecast(scope, today, 14);
  assert.equal(days.length, 14);
  assert.equal(days[0].day, "2026-11-16");
  // Die Karte mit „Nochmal" steht heute im Lernschritt.
  assert.equal(days[0].count, 1);
  assert.equal(
    days.reduce((sum, d) => sum + d.count, 0),
    2,
  );

  const past = await history(scope, today, 30);
  assert.equal(past.length, 30);
  assert.deepEqual(past.at(-1), { day: "2026-11-16", remembered: 0, again: 1 });
  assert.deepEqual(past.at(-2), { day: "2026-11-15", remembered: 1, again: 0 });
});

test("die Statistik zeigt nur die eigene Sprache und das eigene Konto", async () => {
  const scope = await setup(1);
  await rateNext(scope, 4, today);
  const noah = await seedUser({ email: "noah@ouf.local" });
  const fremd = { userId: noah, languageId: scope.languageId };
  assert.equal((await tiles(fremd, today)).learnedToday, 0);
  assert.equal(
    (await history(fremd, today, 7)).reduce((sum, d) => sum + d.remembered, 0),
    0,
  );
  assert.equal(
    (await forecast(fremd, today, 14)).reduce((sum, d) => sum + d.count, 0),
    0,
  );
});
