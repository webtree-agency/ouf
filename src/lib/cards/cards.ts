import { and, eq } from "drizzle-orm";

import { getDb, schema, type Executor } from "../../db/index.ts";
import { DomainError } from "../domainError.ts";
import { languageProfile } from "../languages/catalog.ts";
import { frontKey } from "./frontKey.ts";
import type { CardInput } from "./input.ts";

async function ownedDeck(tx: Executor, userId: string, deckId: string) {
  const [deck] = await tx
    .select({
      id: schema.decks.id,
      languageId: schema.decks.languageId,
      code: schema.languages.code,
    })
    .from(schema.decks)
    .innerJoin(
      schema.languages,
      eq(schema.languages.id, schema.decks.languageId),
    )
    .where(and(eq(schema.decks.id, deckId), eq(schema.decks.userId, userId)));
  if (!deck) throw new DomainError("Dieses Deck gibt es nicht.", "deckId");
  return deck;
}

export function cardValues(input: CardInput, code: string) {
  return {
    deckId: input.deckId,
    front: input.front,
    back: input.back,
    example: input.example,
    note: input.note,
    // Genus nur, wo die Sprache eines kennt.
    gender: languageProfile(code).genders ? input.gender : null,
    tags: input.tags,
    reverse: input.reverse,
    frontKey: frontKey(input.front),
  };
}

/** Legt die Karte und ihren Lernstand an, mit Rückwärtskarte zwei. */
export async function createCard(
  userId: string,
  input: CardInput,
): Promise<string> {
  return getDb().transaction(async (tx) => {
    const deck = await ownedDeck(tx, userId, input.deckId);
    const [card] = await tx
      .insert(schema.cards)
      .values(cardValues(input, deck.code))
      .returning({ id: schema.cards.id });

    await tx.insert(schema.cardSchedules).values(
      input.reverse
        ? [
            { cardId: card.id, direction: "forward" as const },
            { cardId: card.id, direction: "reverse" as const },
          ]
        : [{ cardId: card.id, direction: "forward" as const }],
    );
    return card.id;
  });
}

/**
 * Eine Karte darf in ein anderes Deck derselben Sprache. Wird die Rückwärtskarte
 * abgewählt, bleibt ihr Lernstand liegen und kommt nur nicht mehr dran; wer sie
 * wieder anwählt, macht dort weiter.
 */
export async function updateCard(
  userId: string,
  cardId: string,
  input: CardInput,
): Promise<void> {
  await getDb().transaction(async (tx) => {
    const [current] = await tx
      .select({ languageId: schema.decks.languageId })
      .from(schema.cards)
      .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
      .where(and(eq(schema.cards.id, cardId), eq(schema.decks.userId, userId)));
    if (!current) throw new DomainError("Diese Karte gibt es nicht.");

    const deck = await ownedDeck(tx, userId, input.deckId);
    if (deck.languageId !== current.languageId) {
      throw new DomainError("Eine Karte bleibt in ihrer Sprache.", "deckId");
    }

    await tx
      .update(schema.cards)
      .set({ ...cardValues(input, deck.code), updatedAt: new Date() })
      .where(eq(schema.cards.id, cardId));

    if (input.reverse) {
      await tx
        .insert(schema.cardSchedules)
        .values({ cardId, direction: "reverse" })
        .onConflictDoNothing();
    }
  });
}

export async function deleteCard(
  userId: string,
  cardId: string,
): Promise<void> {
  const [card] = await getDb()
    .select({ id: schema.cards.id })
    .from(schema.cards)
    .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
    .where(and(eq(schema.cards.id, cardId), eq(schema.decks.userId, userId)));
  if (!card) throw new DomainError("Diese Karte gibt es nicht.");

  await getDb().delete(schema.cards).where(eq(schema.cards.id, card.id));
}
