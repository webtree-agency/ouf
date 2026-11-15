import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import { closeDb } from "../../db/index.ts";
import { seedUser, setupTestDb, truncateAll } from "../../db/testing.ts";
import { createDeck } from "../decks/decks.ts";
import { DomainError } from "../domainError.ts";
import { addLanguage } from "../languages/languages.ts";
import { listDecks } from "../queries/decks.ts";
import { readCards, writeCards } from "./cardRows.ts";
import { parseDelimited, serializeDelimited } from "./delimited.ts";
import { cardsForExport, importCards } from "./importCards.ts";

before(setupTestDb);
beforeEach(truncateAll);
after(closeDb);

async function setup() {
  const userId = await seedUser();
  const languageId = await addLanguage(userId, "fr");
  const deckId = await createDeck(userId, languageId, {
    name: "Import",
    newPerDay: 20,
  });
  return { userId, languageId, deckId };
}

test("importiert, überspringt Dubletten und nennt untaugliche Zeilen", async () => {
  const { userId, languageId, deckId } = await setup();
  const cards = readCards(
    parseDelimited(
      "le chat\tdie Katze\nLe Chat\tder Kater\n\tohne Vorderseite\nl'eau\tdas Wasser\n",
      "\t",
    ),
  );
  const result = await importCards({
    userId,
    languageId,
    fallbackDeckId: deckId,
    cards,
  });
  assert.equal(result.imported, 2);
  assert.equal(result.duplicates, 1);
  assert.deepEqual(result.rejected, [{ line: 3, message: "Bitte ausfüllen." }]);

  const again = await importCards({
    userId,
    languageId,
    fallbackDeckId: deckId,
    cards,
  });
  assert.equal(again.imported, 0);
  assert.equal(again.duplicates, 3);
});

test("legt Decks aus der Spalte deck an, und ein Export liest sich wieder ein", async () => {
  const { userId, languageId, deckId } = await setup();
  const text =
    "vorderseite;rueckseite;genus;deck\nla maison;das Haus;f;Wohnen\nmanger;essen;;Verben\n";
  await importCards({
    userId,
    languageId,
    fallbackDeckId: deckId,
    cards: readCards(parseDelimited(text, ";")),
  });
  assert.deepEqual(
    (await listDecks(userId, languageId)).map((deck) => deck.name),
    ["Import", "Verben", "Wohnen"],
  );

  const exported = serializeDelimited(
    writeCards(await cardsForExport(userId, languageId)),
    ",",
  );
  const other = await seedUser({ email: "noah@ouf.local" });
  const otherFr = await addLanguage(other, "fr");
  const otherDeck = await createDeck(other, otherFr, {
    name: "Ziel",
    newPerDay: 20,
  });
  const result = await importCards({
    userId: other,
    languageId: otherFr,
    fallbackDeckId: otherDeck,
    cards: readCards(parseDelimited(exported, ",")),
  });
  assert.equal(result.imported, 2);
  const back = await cardsForExport(other, otherFr);
  assert.deepEqual(
    back.map((card) => [card.front, card.gender, card.deck]),
    [
      ["manger", null, "Verben"],
      ["la maison", "f", "Wohnen"],
    ],
  );
});

test("niemand importiert in ein fremdes Deck oder exportiert fremde Karten", async () => {
  const jann = await setup();
  const noah = await seedUser({ email: "noah@ouf.local" });
  await assert.rejects(
    importCards({
      userId: noah,
      languageId: jann.languageId,
      fallbackDeckId: jann.deckId,
      cards: [],
    }),
    DomainError,
  );
  await importCards({
    userId: jann.userId,
    languageId: jann.languageId,
    fallbackDeckId: jann.deckId,
    cards: readCards([["le chat", "die Katze"]]),
  });
  assert.deepEqual(await cardsForExport(noah, jann.languageId), []);
});
