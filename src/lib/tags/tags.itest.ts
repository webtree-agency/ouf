import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import { eq } from "drizzle-orm";

import { closeDb, getDb, schema } from "../../db/index.ts";
import { seedUser, setupTestDb, truncateAll } from "../../db/testing.ts";
import { createCard } from "../cards/cards.ts";
import { createDeck } from "../decks/decks.ts";
import { DomainError } from "../domainError.ts";
import { addLanguage } from "../languages/languages.ts";
import { listTags } from "../queries/tags.ts";
import { createTag, deleteTag, tagInput, updateTag } from "./tags.ts";

before(setupTestDb);
beforeEach(truncateAll);
after(closeDb);

async function setup(email?: string) {
  const userId = await seedUser(email ? { email } : {});
  const fr = await addLanguage(userId, "fr");
  const deckId = await createDeck(userId, fr, {
    name: "Wörter",
    newPerDay: 20,
  });
  const cardId = await createCard(userId, {
    deckId,
    front: "le pain",
    back: "das Brot",
    example: null,
    note: null,
    gender: "m",
    tags: ["essen", "alltag"],
    reverse: false,
  });
  return { userId, fr, cardId };
}

async function tagsOf(cardId: string) {
  const [card] = await getDb()
    .select({ tags: schema.cards.tags })
    .from(schema.cards)
    .where(eq(schema.cards.id, cardId));
  return card.tags;
}

test("was eine Karte trägt, wird ein Tag in Grau, mit Zahl der Karten", async () => {
  const { userId, fr } = await setup();
  const tags = await listTags(userId, fr);
  assert.deepEqual(
    tags.map((tag) => [tag.name, tag.color, tag.cardCount]),
    [
      ["alltag", "gray", 1],
      ["essen", "gray", 1],
    ],
  );
});

test("umbenennen ändert die Karten mit, löschen nimmt den Tag von ihnen", async () => {
  const { userId, fr, cardId } = await setup();
  const essen = (await listTags(userId, fr)).find(
    (tag) => tag.name === "essen",
  );
  assert.ok(essen);
  await updateTag(
    userId,
    essen.id,
    tagInput.parse({ name: "Küche", emoji: "🍽️", color: "amber" }),
  );
  assert.deepEqual(await tagsOf(cardId), ["küche", "alltag"]);
  const kueche = (await listTags(userId, fr)).find(
    (tag) => tag.name === "küche",
  );
  assert.deepEqual([kueche?.emoji, kueche?.color], ["🍽️", "amber"]);

  await deleteTag(userId, essen.id);
  assert.deepEqual(await tagsOf(cardId), ["alltag"]);
});

test("ein Name gibt es je Sprache einmal, und ein Wort ist ein Wort", async () => {
  const { userId, fr } = await setup();
  await assert.rejects(
    createTag(
      userId,
      fr,
      tagInput.parse({ name: "essen", emoji: "", color: "red" }),
    ),
    DomainError,
  );
  assert.equal(
    tagInput.safeParse({ name: "zwei wörter", emoji: "", color: "red" })
      .success,
    false,
  );
});

test("fremde Tags lassen sich weder ändern noch löschen", async () => {
  const jann = await setup();
  const noah = await setup("noah@ouf.local");
  const [fremd] = await listTags(noah.userId, noah.fr);
  await assert.rejects(
    updateTag(
      jann.userId,
      fremd.id,
      tagInput.parse({ name: "x", emoji: "", color: "red" }),
    ),
    DomainError,
  );
  await assert.rejects(deleteTag(jann.userId, fremd.id), DomainError);
  assert.deepEqual(await tagsOf(noah.cardId), ["essen", "alltag"]);
  await assert.rejects(
    createTag(
      jann.userId,
      noah.fr,
      tagInput.parse({ name: "x", emoji: "", color: "red" }),
    ),
    DomainError,
  );
});
