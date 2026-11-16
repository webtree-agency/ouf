import { and, asc, eq, sql } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { remainingNew } from "../learning/queue.ts";
import { endOfDay, startOfDay } from "../time/day.ts";

/** Ein Lernstand zählt, wenn er vorwärts ist oder die Karte die Rückwärtskarte trägt. */
export const ACTIVE_SCHEDULE = sql`(${schema.cardSchedules.direction} = 'forward' or ${schema.cards.reverse})`;

export type DeckRow = {
  id: string;
  name: string;
  emoji: string | null;
  newPerDay: number;
  cardCount: number;
  newCount: number;
  /** Was heute noch neu drankommt: das Limit abzüglich der heute eingeführten. */
  newToday: number;
  dueCount: number;
};

export async function listDecks(
  userId: string,
  languageId: string,
  now = new Date(),
): Promise<DeckRow[]> {
  const ende = endOfDay(now).toISOString();
  const beginn = startOfDay(now).toISOString();
  const rows = await getDb()
    .select({
      id: schema.decks.id,
      name: schema.decks.name,
      emoji: schema.decks.emoji,
      newPerDay: schema.decks.newPerDay,
      cardCount: sql<number>`count(distinct ${schema.cards.id})::int`,
      newCount: sql<number>`count(${schema.cardSchedules.id}) filter (where ${schema.cardSchedules.scheduleStatus} = 'new' and ${ACTIVE_SCHEDULE})::int`,
      dueCount: sql<number>`count(${schema.cardSchedules.id}) filter (where ${schema.cardSchedules.scheduleStatus} <> 'new' and ${schema.cardSchedules.dueAt} < ${ende}::timestamptz and ${ACTIVE_SCHEDULE})::int`,
      introduced: sql<number>`(
        select count(*)::int from ${schema.reviews}
        where ${schema.reviews.deckId} = ${schema.decks.id}
          and ${schema.reviews.statusBefore} = 'new'
          and ${schema.reviews.reviewedAt} >= ${beginn}::timestamptz
          and not exists (select 1 from ${schema.reviewUndos} where ${schema.reviewUndos.reviewId} = ${schema.reviews.id})
      )`,
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

  return rows.map(({ introduced, ...row }) => ({
    ...row,
    newToday: Math.min(row.newCount, remainingNew(row.newPerDay, introduced)),
  }));
}

export async function findDeck(userId: string, deckId: string) {
  const [deck] = await getDb()
    .select({
      id: schema.decks.id,
      name: schema.decks.name,
      emoji: schema.decks.emoji,
      languageId: schema.decks.languageId,
      newPerDay: schema.decks.newPerDay,
    })
    .from(schema.decks)
    .where(and(eq(schema.decks.id, deckId), eq(schema.decks.userId, userId)));
  return deck ?? null;
}
