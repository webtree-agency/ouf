import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import { closeDb } from "../../db/index.ts";
import { seedUser, setupTestDb, truncateAll } from "../../db/testing.ts";
import { createCard } from "../cards/cards.ts";
import { createDeck } from "../decks/decks.ts";
import { addLanguage } from "../languages/languages.ts";
import type { LearnFilter } from "./filter.ts";
import { countWithoutReverse, enableReverse } from "./reverse.ts";
import { rateCard, studyState } from "./session.ts";

before(setupTestDb);
beforeEach(truncateAll);
after(closeDb);

const now = new Date("2026-11-16T09:00:00Z");
const NONE: LearnFilter = { random: false, all: false };

async function setup() {
  const userId = await seedUser();
  const languageId = await addLanguage(userId, "fr");
  const deckId = await createDeck(userId, languageId, {
    name: "Wörter",
    newPerDay: 1,
  });
  const card = (front: string, gender: "m" | "f" | null, tags: string[]) =>
    createCard(userId, {
      deckId,
      front,
      back: front.toUpperCase(),
      example: null,
      note: null,
      gender,
      tags,
      reverse: false,
    });
  await card("le pain", "m", ["essen"]);
  await card("la pomme", "f", ["essen"]);
  await card("la maison", "f", ["wohnen"]);
  const scope = (filter: Partial<LearnFilter>) => ({
    userId,
    languageId,
    languageCode: "fr",
    filter: { ...NONE, ...filter },
  });
  return { userId, languageId, scope };
}

async function fronts(scope: Parameters<typeof studyState>[0]) {
  const seen: string[] = [];
  for (let i = 0; i < 5; i += 1) {
    const state = await studyState(scope, now);
    if (!state.card) break;
    seen.push(state.card.front);
    await rateCard({
      userId: scope.userId,
      scheduleId: state.card.scheduleId,
      rating: 4,
      reps: state.card.reps,
      durationMs: 1000,
      now,
    });
  }
  return seen;
}

test("ohne Auswahl gilt das Tageslimit des Decks", async () => {
  const { scope } = await setup();
  assert.deepEqual(await fronts(scope({})), ["le pain"]);
});

test("Alles üben nimmt jede Karte der Auswahl, einmal am Tag", async () => {
  const { scope } = await setup();
  assert.deepEqual(await fronts(scope({ all: true })), [
    "le pain",
    "la pomme",
    "la maison",
  ]);
});

test("nach Tag und Genus", async () => {
  const { scope } = await setup();
  assert.deepEqual(
    await fronts(scope({ all: true, tag: "essen", gender: "f" })),
    ["la pomme"],
  );
});

test("nach Stufe: was neu ist, ist nach dem Lernen nicht mehr neu", async () => {
  const { scope } = await setup();
  await fronts(scope({ all: true, tag: "wohnen" }));
  const neu = await studyState(scope({ all: true, level: "neu" }), now);
  assert.equal(neu.counts.neu, 2);
});

test("Deutsch → Französisch erst nach dem Einschalten, dann für die Auswahl", async () => {
  const { scope } = await setup();
  const zurueck = scope({ direction: "zurueck", tag: "essen", all: true });
  assert.equal((await studyState(zurueck, now)).card, null);
  assert.equal(await countWithoutReverse(zurueck), 2);
  assert.equal(await enableReverse(zurueck), 2);
  assert.equal(await countWithoutReverse(zurueck), 0);
  const state = await studyState(zurueck, now);
  assert.equal(state.card?.direction, "reverse");
  assert.equal(state.counts.neu, 2);
  // Die Karte ohne den Tag bleibt, wie sie war.
  assert.equal(await countWithoutReverse(scope({ tag: "wohnen" })), 1);
});
