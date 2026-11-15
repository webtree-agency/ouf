import { and, asc, eq, gte, isNull, lt, sql } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { ACTIVE_SCHEDULE } from "../queries/decks.ts";
import { endOfDay, startOfDay } from "../time/day.ts";
import { remainingNew, withinNewLimits, type Queue } from "./queue.ts";

export type QueueScope = {
  userId: string;
  languageId: string;
  deckId?: string;
};

/** Bewertungen von heute, die nicht zurückgenommen wurden. */
export function countedReviews(userId: string, since: Date) {
  return and(
    eq(schema.reviews.userId, userId),
    gte(schema.reviews.reviewedAt, since),
    isNull(schema.reviewUndos.reviewId),
  );
}

/** Wie viele neue Karten jedes Deck heute schon eingeführt hat. */
async function introducedToday(
  scope: QueueScope,
  now: Date,
): Promise<Map<string, number>> {
  const rows = await getDb()
    .select({
      deckId: schema.reviews.deckId,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.reviews)
    .leftJoin(
      schema.reviewUndos,
      eq(schema.reviewUndos.reviewId, schema.reviews.id),
    )
    .where(
      and(
        countedReviews(scope.userId, startOfDay(now)),
        eq(schema.reviews.languageId, scope.languageId),
        eq(schema.reviews.statusBefore, "new"),
      ),
    )
    .groupBy(schema.reviews.deckId);
  return new Map(rows.map((row) => [row.deckId, row.count]));
}

/**
 * Alle Lernstände, die heute drankommen können, in drei Töpfen. Gelesen wird
 * nur, was zum Konto gehört: die Decks hängen am Konto, und alles hängt an
 * den Decks.
 */
export async function loadQueue(
  scope: QueueScope,
  now = new Date(),
): Promise<Queue> {
  const rows = await getDb()
    .select({
      scheduleId: schema.cardSchedules.id,
      deckId: schema.decks.id,
      dueAt: schema.cardSchedules.dueAt,
      status: schema.cardSchedules.scheduleStatus,
      newPerDay: schema.decks.newPerDay,
    })
    .from(schema.cardSchedules)
    .innerJoin(schema.cards, eq(schema.cards.id, schema.cardSchedules.cardId))
    .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
    .where(
      and(
        eq(schema.decks.userId, scope.userId),
        eq(schema.decks.languageId, scope.languageId),
        scope.deckId ? eq(schema.decks.id, scope.deckId) : undefined,
        ACTIVE_SCHEDULE,
        sql`(${schema.cardSchedules.scheduleStatus} = 'new' or ${lt(schema.cardSchedules.dueAt, endOfDay(now))})`,
      ),
    )
    // Neue Karten in der Reihenfolge, in der sie erfasst wurden, vorwärts vor rückwärts.
    .orderBy(
      asc(schema.cards.createdAt),
      asc(schema.cards.id),
      asc(schema.cardSchedules.direction),
    );

  const introduced = await introducedToday(scope, now);
  const remaining = new Map<string, number>();
  for (const row of rows) {
    remaining.set(
      row.deckId,
      remainingNew(row.newPerDay, introduced.get(row.deckId) ?? 0),
    );
  }

  const item = (row: (typeof rows)[number]) => ({
    scheduleId: row.scheduleId,
    deckId: row.deckId,
    dueAt: row.dueAt,
  });
  return {
    learning: rows.filter((row) => row.status === "learning").map(item),
    reviews: rows.filter((row) => row.status === "review").map(item),
    fresh: withinNewLimits(
      rows.filter((row) => row.status === "new").map(item),
      remaining,
    ),
  };
}
