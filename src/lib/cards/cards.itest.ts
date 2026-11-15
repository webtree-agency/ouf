import assert from "node:assert/strict";
import { after, before, beforeEach, describe, test } from "node:test";

import { eq } from "drizzle-orm";

import { closeDb, getDb, schema } from "../../db/index.ts";
import { seedUser, setupTestDb, truncateAll } from "../../db/testing.ts";
import { createDeck } from "../decks/decks.ts";
import { DomainError } from "../domainError.ts";
import { addLanguage } from "../languages/languages.ts";
import { findDuplicates, listCards, listTags } from "../queries/cards.ts";
import { listDecks } from "../queries/decks.ts";
import { createCard, deleteCard, updateCard } from "./cards.ts";
import { frontKey } from "./frontKey.ts";
import type { CardInput } from "./input.ts";

before(setupTestDb);
beforeEach(truncateAll);
after(closeDb);

async function setup() {
  const userId = await seedUser();
  const fr = await addLanguage(userId, "fr");
  const deckId = await createDeck(userId, fr, {
    name: "Grundwortschatz",
    newPerDay: 20,
  });
  return { userId, fr, deckId };
}

function karte(deckId: string, extra: Partial<CardInput> = {}): CardInput {
  return {
    deckId,
    front: "la maison",
    back: "das Haus",
    example: null,
    note: null,
    gender: "f",
    tags: ["wohnen"],
    reverse: false,
    ...extra,
  };
}

describe("Karten", () => {
  test("eine Karte mit Rückwärtskarte hat zwei Lernstände", async () => {
    const { userId, deckId } = await setup();
    const cardId = await createCard(userId, karte(deckId, { reverse: true }));
    const schedules = await getDb()
      .select({ direction: schema.cardSchedules.direction })
      .from(schema.cardSchedules)
      .where(eq(schema.cardSchedules.cardId, cardId));
    assert.deepEqual(schedules.map((s) => s.direction).sort(), [
      "forward",
      "reverse",
    ]);
  });

  test("die Rückwärtskarte zählt erst, wenn sie gewählt ist", async () => {
    const { userId, fr, deckId } = await setup();
    const cardId = await createCard(userId, karte(deckId));
    assert.equal((await listDecks(userId, fr))[0].newCount, 1);

    await updateCard(userId, cardId, karte(deckId, { reverse: true }));
    assert.equal((await listDecks(userId, fr))[0].newCount, 2);

    await updateCard(userId, cardId, karte(deckId, { reverse: false }));
    assert.equal((await listDecks(userId, fr))[0].newCount, 1);
  });

  test("eine Karte bleibt in ihrer Sprache", async () => {
    const { userId, deckId } = await setup();
    const en = await addLanguage(userId, "en");
    const englisch = await createDeck(userId, en, {
      name: "Basics",
      newPerDay: 10,
    });
    const cardId = await createCard(userId, karte(deckId));

    await assert.rejects(
      updateCard(userId, cardId, karte(englisch)),
      /in ihrer Sprache/,
    );
  });

  test("Genus gibt es nur, wo die Sprache eines kennt", async () => {
    const userId = await seedUser();
    const en = await addLanguage(userId, "en");
    const deckId = await createDeck(userId, en, {
      name: "Basics",
      newPerDay: 10,
    });
    await createCard(
      userId,
      karte(deckId, { front: "the house", gender: "f" }),
    );
    const { rows } = await listCards(userId, en, { perPage: 10 });
    assert.equal(rows[0].gender, null);
  });

  test("findet die Dublette über Gross- und Kleinschreibung und Apostroph hinweg", async () => {
    const { userId, fr, deckId } = await setup();
    await createCard(
      userId,
      karte(deckId, { front: "l'eau", back: "das Wasser", gender: "f" }),
    );
    const treffer = await findDuplicates(userId, fr, frontKey("L’eau"));
    assert.deepEqual(
      treffer.map((t) => t.back),
      ["das Wasser"],
    );
  });

  test("filtert nach Suche, Deck, Tag und Genus und blättert", async () => {
    const { userId, fr, deckId } = await setup();
    const verben = await createDeck(userId, fr, {
      name: "Verben im Alltag",
      newPerDay: 10,
    });
    await createCard(userId, karte(deckId));
    await createCard(
      userId,
      karte(deckId, {
        front: "le chat",
        back: "die Katze",
        gender: "m",
        tags: ["tiere"],
      }),
    );
    await createCard(
      userId,
      karte(verben, {
        front: "manger",
        back: "essen",
        gender: null,
        tags: ["verb"],
      }),
    );

    assert.equal(
      (await listCards(userId, fr, { perPage: 10, query: "katz" })).total,
      1,
    );
    assert.equal(
      (await listCards(userId, fr, { perPage: 10, deckId: verben })).total,
      1,
    );
    assert.equal(
      (await listCards(userId, fr, { perPage: 10, tag: "tiere" })).total,
      1,
    );
    assert.equal(
      (await listCards(userId, fr, { perPage: 10, gender: "f" })).total,
      1,
    );
    assert.equal(
      (await listCards(userId, fr, { perPage: 10, query: "100%" })).total,
      0,
    );

    const zweite = await listCards(userId, fr, { perPage: 2, page: 2 });
    assert.equal(zweite.rows.length, 1);
    assert.equal(zweite.pageCount, 2);
    assert.deepEqual(await listTags(userId, fr), ["tiere", "verb", "wohnen"]);
  });

  test("ein Deckname kommt je Sprache einmal vor, ohne Rücksicht auf Grossschreibung", async () => {
    const { userId, fr } = await setup();
    await assert.rejects(
      createDeck(userId, fr, { name: "grundwortschatz", newPerDay: 5 }),
      (error: unknown) =>
        error instanceof DomainError && error.field === "name",
    );
  });

  test("löscht eine Karte samt Lernstand", async () => {
    const { userId, deckId } = await setup();
    const cardId = await createCard(userId, karte(deckId));
    await deleteCard(userId, cardId);
    assert.equal((await getDb().select().from(schema.cardSchedules)).length, 0);
  });
});
