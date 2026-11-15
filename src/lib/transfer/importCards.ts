import { and, eq, sql } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { cardValues } from "../cards/cards.ts";
import { frontKey } from "../cards/frontKey.ts";
import { cardInput } from "../cards/input.ts";
import { DomainError } from "../domainError.ts";
import type { ImportCard } from "./cardRows.ts";

export const MAX_IMPORT_ROWS = 5000;

export type ImportResult = {
  imported: number;
  duplicates: number;
  /** Zeilen, die nicht taugten, mit Grund; die ersten paar genügen. */
  rejected: { line: number; message: string }[];
};

/**
 * Legt die Karten in einer Transaktion an. Steht in der Datei eine Spalte
 * „deck", kommt jede Karte in das Deck dieses Namens, sonst in `fallbackDeckId`.
 * Was es in der Sprache schon gibt, wird übersprungen, auch innerhalb der Datei.
 */
export async function importCards(input: {
  userId: string;
  languageId: string;
  fallbackDeckId: string;
  cards: readonly ImportCard[];
}): Promise<ImportResult> {
  if (input.cards.length > MAX_IMPORT_ROWS) {
    throw new DomainError(`Höchstens ${MAX_IMPORT_ROWS} Zeilen auf einmal.`);
  }

  return getDb().transaction(async (tx) => {
    const [language] = await tx
      .select({ code: schema.languages.code })
      .from(schema.languages)
      .where(
        and(
          eq(schema.languages.id, input.languageId),
          eq(schema.languages.userId, input.userId),
        ),
      );
    if (!language) throw new DomainError("Diese Sprache gibt es nicht.");

    const decks = await tx
      .select({ id: schema.decks.id, name: schema.decks.name })
      .from(schema.decks)
      .where(
        and(
          eq(schema.decks.userId, input.userId),
          eq(schema.decks.languageId, input.languageId),
        ),
      );
    if (!decks.some((deck) => deck.id === input.fallbackDeckId))
      throw new DomainError("Dieses Deck gibt es nicht.");
    const byName = new Map(
      decks.map((deck) => [deck.name.toLowerCase(), deck.id]),
    );

    const known = new Set(
      (
        await tx
          .select({ key: schema.cards.frontKey })
          .from(schema.cards)
          .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
          .where(
            and(
              eq(schema.decks.userId, input.userId),
              eq(schema.decks.languageId, input.languageId),
            ),
          )
      ).map((row) => row.key),
    );

    const result: ImportResult = { imported: 0, duplicates: 0, rejected: [] };
    for (const card of input.cards) {
      let deckId = input.fallbackDeckId;
      if (card.deck) {
        const name = card.deck.slice(0, 60);
        deckId =
          byName.get(name.toLowerCase()) ??
          (
            await tx
              .insert(schema.decks)
              .values({
                userId: input.userId,
                languageId: input.languageId,
                name,
              })
              .returning({ id: schema.decks.id })
          )[0].id;
        byName.set(name.toLowerCase(), deckId);
      }

      const parsed = cardInput.safeParse({ ...card, deckId });
      if (!parsed.success) {
        result.rejected.push({
          line: card.line,
          message: parsed.error.issues[0].message,
        });
        continue;
      }
      const key = frontKey(parsed.data.front);
      if (known.has(key)) {
        result.duplicates += 1;
        continue;
      }
      known.add(key);

      const [created] = await tx
        .insert(schema.cards)
        .values(cardValues(parsed.data, language.code))
        .returning({ id: schema.cards.id });
      await tx.insert(schema.cardSchedules).values(
        parsed.data.reverse
          ? [
              { cardId: created.id, direction: "forward" as const },
              { cardId: created.id, direction: "reverse" as const },
            ]
          : [{ cardId: created.id, direction: "forward" as const }],
      );
      result.imported += 1;
    }
    return result;
  });
}

/** Alle Karten einer Sprache, wahlweise eines Decks, für den Export. */
export async function cardsForExport(
  userId: string,
  languageId: string,
  deckId?: string,
) {
  return getDb()
    .select({
      front: schema.cards.front,
      back: schema.cards.back,
      example: schema.cards.example,
      note: schema.cards.note,
      gender: schema.cards.gender,
      tags: schema.cards.tags,
      reverse: schema.cards.reverse,
      deck: schema.decks.name,
    })
    .from(schema.cards)
    .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
    .where(
      and(
        eq(schema.decks.userId, userId),
        eq(schema.decks.languageId, languageId),
        deckId ? eq(schema.decks.id, deckId) : undefined,
      ),
    )
    .orderBy(
      sql`lower(${schema.decks.name})`,
      schema.cards.createdAt,
      schema.cards.id,
    );
}
