import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../../db/index.ts";
import { DomainError } from "../domainError.ts";
import {
  countField,
  emojiField,
  requiredTextField,
} from "../validation/fields.ts";

export const deckInput = z.object({
  name: requiredTextField(60),
  emoji: emojiField(),
  newPerDay: countField("Neue Karten je Tag", 0, 999),
});

// Ohne Emoji ist ein Deck vollständig; Import und Tests legen es so an.
export type DeckInput = Omit<z.infer<typeof deckInput>, "emoji"> & {
  emoji?: string | null;
};

const VERGEBEN = "Ein Deck mit diesem Namen gibt es in dieser Sprache schon.";

export async function createDeck(
  userId: string,
  languageId: string,
  input: DeckInput,
): Promise<string> {
  const [language] = await getDb()
    .select({ id: schema.languages.id })
    .from(schema.languages)
    .where(
      and(
        eq(schema.languages.id, languageId),
        eq(schema.languages.userId, userId),
      ),
    );
  if (!language) throw new DomainError("Diese Sprache gibt es nicht.");

  try {
    const [deck] = await getDb()
      .insert(schema.decks)
      .values({
        userId,
        languageId,
        name: input.name,
        emoji: input.emoji ?? null,
        newPerDay: input.newPerDay,
      })
      .returning({ id: schema.decks.id });
    return deck.id;
  } catch (error) {
    throw uniqueName(error);
  }
}

export async function updateDeck(
  userId: string,
  deckId: string,
  input: DeckInput,
): Promise<void> {
  try {
    const updated = await getDb()
      .update(schema.decks)
      .set({
        name: input.name,
        emoji: input.emoji ?? null,
        newPerDay: input.newPerDay,
      })
      .where(and(eq(schema.decks.id, deckId), eq(schema.decks.userId, userId)))
      .returning({ id: schema.decks.id });
    if (updated.length === 0)
      throw new DomainError("Dieses Deck gibt es nicht.");
  } catch (error) {
    throw uniqueName(error);
  }
}

/** Mit allen Karten. Das Protokoll bleibt, es hängt nicht am Deck (§8). */
export async function deleteDeck(
  userId: string,
  deckId: string,
): Promise<void> {
  const removed = await getDb()
    .delete(schema.decks)
    .where(and(eq(schema.decks.id, deckId), eq(schema.decks.userId, userId)))
    .returning({ id: schema.decks.id });
  if (removed.length === 0) throw new DomainError("Dieses Deck gibt es nicht.");
}

function uniqueName(error: unknown): unknown {
  const code =
    (error as { cause?: { code?: string }; code?: string }).cause?.code ??
    (error as { code?: string }).code;
  return code === "23505" ? new DomainError(VERGEBEN, "name") : error;
}
