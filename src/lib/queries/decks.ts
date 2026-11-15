import { and, asc, eq, sql } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { endOfDay } from "../time/day.ts";

/** Ein Lernstand zählt, wenn er vorwärts ist oder die Karte die Rückwärtskarte trägt. */
export const ACTIVE_SCHEDULE = sql`(${schema.cardSchedules.direction} = 'forward' or ${schema.cards.reverse})`;

export type DeckRow = {
  id: string;
  name: string;
  newPerDay: number;
  cardCount: number;
  newCount: number;
  dueCount: number;
};

export async function listDecks(
  userId: string,
  languageId: string,
  now = new Date(),
): Promise<DeckRow[]> {
  const ende = endOfDay(now).toISOString();
  return getDb()
    .select({
      id: schema.decks.id,
      name: schema.decks.name,
      newPerDay: schema.decks.newPerDay,
      cardCount: sql<number>`count(distinct ${schema.cards.id})::int`,
      newCount: sql<number>`count(${schema.cardSchedules.id}) filter (where ${schema.cardSchedules.scheduleStatus} = 'new' and ${ACTIVE_SCHEDULE})::int`,
      dueCount: sql<number>`count(${schema.cardSchedules.id}) filter (where ${schema.cardSchedules.scheduleStatus} <> 'new' and ${schema.cardSchedules.dueAt} < ${ende}::timestamptz and ${ACTIVE_SCHEDULE})::int`,
    })
    .from(schema.decks)
    .leftJoin(schema.cards, eq(schema.cards.deckId, schema.decks.id))
    .leftJoin(
      schema.cardSchedules,
      eq(schema.cardSchedules.cardId, schema.cards.id),
    )
    .where(
      and(
        eq(schema.decks.userId, userId),
        eq(schema.decks.languageId, languageId),
      ),
    )
    .groupBy(schema.decks.id)
    .orderBy(asc(sql`lower(${schema.decks.name})`), asc(schema.decks.id));
}

export async function findDeck(userId: string, deckId: string) {
  const [deck] = await getDb()
    .select({
      id: schema.decks.id,
      name: schema.decks.name,
      languageId: schema.decks.languageId,
      newPerDay: schema.decks.newPerDay,
    })
    .from(schema.decks)
    .where(and(eq(schema.decks.id, deckId), eq(schema.decks.userId, userId)));
  return deck ?? null;
}
