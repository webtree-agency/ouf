import { and, eq, inArray, sql, type SQL } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import type { LearnFilter } from "./filter.ts";

type Scope = { userId: string; languageId: string; filter: LearnFilter };

/** Die Karten der Auswahl (Deck, Tag, Genus), unabhängig von Stufe und Richtung. */
function cardsOf(scope: Scope): SQL | undefined {
  const { filter } = scope;
  return and(
    eq(schema.decks.userId, scope.userId),
    eq(schema.decks.languageId, scope.languageId),
    filter.deckId ? eq(schema.decks.id, filter.deckId) : undefined,
    filter.tag
      ? sql`${schema.cards.tags} @> array[${filter.tag}]::text[]`
      : undefined,
    filter.gender ? eq(schema.cards.gender, filter.gender) : undefined,
  );
}

/** Wie viele Karten der Auswahl noch nicht umgekehrt abgefragt werden. */
export async function countWithoutReverse(scope: Scope): Promise<number> {
  const [row] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.cards)
    .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
    .where(and(cardsOf(scope), eq(schema.cards.reverse, false)));
  return row.count;
}

/**
 * Schaltet „auch umgekehrt abfragen" für alle Karten der Auswahl ein. Ein
 * Lernstand, der von früher noch liegt, macht dort weiter, wo er war.
 */
export async function enableReverse(scope: Scope): Promise<number> {
  return getDb().transaction(async (tx) => {
    const rows = await tx
      .select({ id: schema.cards.id })
      .from(schema.cards)
      .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
      .where(and(cardsOf(scope), eq(schema.cards.reverse, false)));
    const ids = rows.map((row) => row.id);
    if (ids.length === 0) return 0;
    await tx
      .update(schema.cards)
      .set({ reverse: true, updatedAt: new Date() })
      .where(inArray(schema.cards.id, ids));
    await tx
      .insert(schema.cardSchedules)
      .values(ids.map((cardId) => ({ cardId, direction: "reverse" as const })))
      .onConflictDoNothing();
    return ids.length;
  });
}
