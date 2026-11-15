import assert from "node:assert/strict";
import { after, before, beforeEach, describe, test } from "node:test";

import { eq, sql } from "drizzle-orm";

import { closeDb, getDb, schema } from "../../db/index.ts";
import { seedUser, setupTestDb, truncateAll } from "../../db/testing.ts";
import { deleteAccount } from "../account/credentials.ts";
import { createCard } from "../cards/cards.ts";
import { createDeck } from "../decks/decks.ts";
import { DomainError } from "../domainError.ts";
import { addLanguage } from "../languages/languages.ts";
import { listDecks } from "../queries/decks.ts";
import { rateCard, studyState, undoLastReview } from "./session.ts";

before(setupTestDb);
beforeEach(truncateAll);
after(closeDb);

const now = new Date("2026-11-16T09:00:00Z");
const later = (minutes: number) => new Date(now.getTime() + minutes * 60_000);

async function setup(newPerDay = 20, cards = 3) {
  const userId = await seedUser();
  const languageId = await addLanguage(userId, "fr");
  const deckId = await createDeck(userId, languageId, {
    name: "Grundwortschatz",
    newPerDay,
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
  const scope = { userId, languageId, languageCode: "fr" };
  return { userId, languageId, deckId, scope };
}

async function rate(
  scope: { userId: string; languageId: string; languageCode: string },
  rating: 1 | 2 | 3 | 4,
  at = now,
) {
  const state = await studyState(scope, at);
  assert.ok(state.card);
  await rateCard({
    userId: scope.userId,
    scheduleId: state.card.scheduleId,
    rating,
    reps: state.card.reps,
    durationMs: 4000,
    now: at,
  });
  return state.card;
}

describe("Lernen", () => {
  test("zeigt die erste neue Karte mit den Intervallen der vier Knöpfe", async () => {
    const { scope } = await setup();
    const state = await studyState(scope, now);
    assert.equal(state.card?.front, "mot 0");
    assert.deepEqual(state.card?.intervals, {
      1: "1 Min",
      2: "6 Min",
      3: "10 Min",
      4: state.card?.intervals[4],
    });
    assert.deepEqual(state.counts, { neu: 3, lernen: 0, faellig: 0 });
    assert.equal(state.speech, "fr-FR");
  });

  test("eine Bewertung schreibt Stand und Protokoll", async () => {
    const { scope } = await setup();
    const card = await rate(scope, 3);
    const [schedule] = await getDb()
      .select({
        status: schema.cardSchedules.scheduleStatus,
        reps: schema.cardSchedules.reps,
      })
      .from(schema.cardSchedules)
      .where(eq(schema.cardSchedules.id, card.scheduleId));
    assert.deepEqual(schedule, { status: "learning", reps: 1 });

    const [entry] = await getDb().select().from(schema.reviews);
    assert.equal(entry.rating, 3);
    assert.equal(entry.statusBefore, "new");
    assert.equal(entry.durationMs, 4000);
  });

  test("ein zweiter Klick auf denselben Stand zählt nicht", async () => {
    const { scope } = await setup();
    const state = await studyState(scope, now);
    const input = {
      userId: scope.userId,
      scheduleId: state.card!.scheduleId,
      rating: 3 as const,
      reps: 0,
      durationMs: 1,
      now,
    };
    await rateCard(input);
    await rateCard(input);
    assert.equal((await getDb().select().from(schema.reviews)).length, 1);
  });

  test("das Tageslimit zählt, was heute neu dazukam", async () => {
    const { scope } = await setup(2, 4);
    await rate(scope, 4);
    await rate(scope, 4);
    const state = await studyState(scope, later(1));
    assert.equal(state.card, null);
    assert.deepEqual(state.counts, { neu: 0, lernen: 0, faellig: 0 });
    assert.equal(
      (await listDecks(scope.userId, scope.languageId, later(1)))[0].newToday,
      0,
    );
  });

  test("ein Lernschritt kommt nach zehn Minuten wieder, vorher die nächste neue", async () => {
    const { scope } = await setup(20, 2);
    const erste = await rate(scope, 3);
    assert.equal((await studyState(scope, later(1))).card?.front, "mot 1");
    await rate(scope, 4, later(1));
    // Nur noch der Lernschritt, in 9 Minuten fällig: er kommt vorgezogen.
    assert.equal(
      (await studyState(scope, later(2))).card?.scheduleId,
      erste.scheduleId,
    );
  });
});

describe("Rückgängig", () => {
  test("stellt den Stand davor wieder her und hängt die Rücknahme an", async () => {
    const { scope } = await setup();
    const card = await rate(scope, 1);
    const back = await undoLastReview(scope.userId, scope.languageId, later(1));
    assert.equal(back, card.scheduleId);

    const [schedule] = await getDb()
      .select({
        status: schema.cardSchedules.scheduleStatus,
        reps: schema.cardSchedules.reps,
      })
      .from(schema.cardSchedules)
      .where(eq(schema.cardSchedules.id, card.scheduleId));
    assert.deepEqual(schedule, { status: "new", reps: 0 });
    assert.equal((await getDb().select().from(schema.reviews)).length, 1);
    assert.equal((await getDb().select().from(schema.reviewUndos)).length, 1);
    // Eine zurückgenommene neue Karte zählt nicht gegen das Limit.
    assert.equal((await studyState(scope, later(1))).counts.neu, 3);
  });

  test("nimmt nacheinander zurück und hört dann auf", async () => {
    const { scope } = await setup();
    await rate(scope, 4);
    await rate(scope, 4);
    await undoLastReview(scope.userId, scope.languageId, later(1));
    await undoLastReview(scope.userId, scope.languageId, later(1));
    await assert.rejects(
      undoLastReview(scope.userId, scope.languageId, later(1)),
      DomainError,
    );
  });
});

describe("Das Protokoll wird nur angefügt", () => {
  test("weist Ändern und Löschen ab", async () => {
    const { scope } = await setup();
    await rate(scope, 3);
    // Drizzle hüllt den Fehler der Datenbank ein; die Meldung steht in `cause`.
    const geschuetzt = (error: unknown) =>
      /nur angefügt/.test(String((error as { cause?: Error }).cause?.message));
    await assert.rejects(
      getDb().execute(sql`update reviews set rating = 4`),
      geschuetzt,
    );
    await assert.rejects(getDb().execute(sql`delete from reviews`), geschuetzt);
  });

  test("eine gelöschte Karte lässt ihre Geschichte stehen", async () => {
    const { scope, deckId } = await setup();
    await rate(scope, 3);
    await getDb().delete(schema.decks).where(eq(schema.decks.id, deckId));
    assert.equal((await getDb().select().from(schema.reviews)).length, 1);
  });

  test("Konto löschen nimmt das Protokoll mit", async () => {
    const { scope } = await setup();
    await rate(scope, 3);
    await undoLastReview(scope.userId, scope.languageId, later(1));
    await deleteAccount(scope.userId);
    assert.equal((await getDb().select().from(schema.reviews)).length, 0);
    assert.equal((await getDb().select().from(schema.reviewUndos)).length, 0);
  });
});

test("niemand bewertet eine fremde Karte oder nimmt fremde Bewertungen zurück", async () => {
  const jann = await setup();
  const noahId = await seedUser({ email: "noah@ouf.local" });
  const noahFr = await addLanguage(noahId, "fr");
  const noahCard = await rate(jann.scope, 3);

  await assert.rejects(
    rateCard({
      userId: noahId,
      scheduleId: noahCard.scheduleId,
      rating: 1,
      reps: 1,
      durationMs: 1,
      now,
    }),
    DomainError,
  );
  await assert.rejects(undoLastReview(noahId, noahFr, later(1)), DomainError);
  assert.equal(
    (
      await studyState(
        { userId: noahId, languageId: jann.languageId, languageCode: "fr" },
        now,
      )
    ).card,
    null,
  );
});
