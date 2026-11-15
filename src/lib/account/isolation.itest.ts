import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import { closeDb } from "../../db/index.ts";
import { seedUser, setupTestDb, truncateAll } from "../../db/testing.ts";
import { createCard, deleteCard, updateCard } from "../cards/cards.ts";
import { frontKey } from "../cards/frontKey.ts";
import { createDeck, deleteDeck, updateDeck } from "../decks/decks.ts";
import { DomainError } from "../domainError.ts";
import {
  addLanguage,
  removeLanguage,
  setActiveLanguage,
} from "../languages/languages.ts";
import {
  findCard,
  findDuplicates,
  listCards,
  listTags,
  recentCards,
} from "../queries/cards.ts";
import { findDeck, listDecks } from "../queries/decks.ts";
import { activeLanguage, listLanguages } from "../queries/languages.ts";

/**
 * **Niemand sieht die Daten eines anderen.** Jede Abfrage und jede Änderung
 * bekommt hier die Kennungen des anderen Kontos, so wie sie ein Angreifer in
 * eine Adresse oder ein Formular schreiben würde.
 */
before(setupTestDb);
beforeEach(truncateAll);
after(closeDb);

async function zweiKonten() {
  const jann = await seedUser({ email: "jann@ouf.local" });
  const noah = await seedUser({ email: "noah@ouf.local", name: "Noah" });
  const noahFr = await addLanguage(noah, "fr");
  const noahDeck = await createDeck(noah, noahFr, {
    name: "Geheim",
    newPerDay: 20,
  });
  const noahCard = await createCard(noah, {
    deckId: noahDeck,
    front: "le secret",
    back: "das Geheimnis",
    example: null,
    note: null,
    gender: "m",
    tags: ["privat"],
    reverse: false,
  });
  return { jann, noah, noahFr, noahDeck, noahCard };
}

const nichts = (error: unknown) => error instanceof DomainError;

test("lesen: keine fremde Sprache, kein fremdes Deck, keine fremde Karte", async () => {
  const { jann, noahFr, noahDeck, noahCard } = await zweiKonten();

  assert.deepEqual(await listLanguages(jann), []);
  assert.equal((await activeLanguage(jann)).active, null);
  assert.deepEqual(await listDecks(jann, noahFr), []);
  assert.equal(await findDeck(jann, noahDeck), null);
  assert.equal((await listCards(jann, noahFr, { perPage: 100 })).total, 0);
  assert.equal(
    (await listCards(jann, noahFr, { perPage: 100, deckId: noahDeck })).total,
    0,
  );
  assert.equal(await findCard(jann, noahCard), null);
  assert.deepEqual(await listTags(jann, noahFr), []);
  assert.deepEqual(await recentCards(jann, noahDeck), []);
  assert.deepEqual(
    await findDuplicates(jann, noahFr, frontKey("le secret")),
    [],
  );
});

test("schreiben: keine Karte in ein fremdes Deck, kein Ändern, kein Löschen", async () => {
  const { jann, noah, noahFr, noahDeck, noahCard } = await zweiKonten();
  const eingabe = {
    deckId: noahDeck,
    front: "x",
    back: "y",
    example: null,
    note: null,
    gender: null,
    tags: [],
    reverse: false,
  };

  await assert.rejects(createCard(jann, eingabe), nichts);
  await assert.rejects(updateCard(jann, noahCard, eingabe), nichts);
  await assert.rejects(deleteCard(jann, noahCard), nichts);
  await assert.rejects(
    createDeck(jann, noahFr, { name: "x", newPerDay: 1 }),
    nichts,
  );
  await assert.rejects(
    updateDeck(jann, noahDeck, { name: "x", newPerDay: 1 }),
    nichts,
  );
  await assert.rejects(deleteDeck(jann, noahDeck), nichts);
  await assert.rejects(setActiveLanguage(jann, noahFr), nichts);
  await assert.rejects(removeLanguage(jann, noahFr), nichts);

  // Alles von Noah steht noch, unverändert.
  assert.equal((await findCard(noah, noahCard))?.front, "le secret");
  assert.equal((await findDeck(noah, noahDeck))?.name, "Geheim");
});

test("eine eigene Karte lässt sich nicht in ein fremdes Deck verschieben", async () => {
  const { jann, noahDeck } = await zweiKonten();
  const fr = await addLanguage(jann, "fr");
  const deck = await createDeck(jann, fr, { name: "Mein Deck", newPerDay: 20 });
  const card = await createCard(jann, {
    deckId: deck,
    front: "le chat",
    back: "die Katze",
    example: null,
    note: null,
    gender: "m",
    tags: [],
    reverse: false,
  });

  await assert.rejects(
    updateCard(jann, card, {
      deckId: noahDeck,
      front: "le chat",
      back: "die Katze",
      example: null,
      note: null,
      gender: "m",
      tags: [],
      reverse: false,
    }),
    nichts,
  );
});
