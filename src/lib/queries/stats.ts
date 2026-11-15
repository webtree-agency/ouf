import { and, eq, gte, isNull, lt, sql } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { TIME_ZONE } from "../format/dateTime.ts";
import { fillDays, share, type DayCount } from "../stats/days.ts";
import { addDays, startOfDay } from "../time/day.ts";
import { ACTIVE_SCHEDULE, listDecks } from "./decks.ts";

type Scope = { userId: string; languageId: string };

function zurichDay(column: unknown) {
  return sql<string>`to_char((${column} at time zone ${TIME_ZONE})::date, 'YYYY-MM-DD')`;
}

/** Bewertungen der Sprache seit `since`, ohne zurückgenommene. */
function countedReviews(scope: Scope, since: Date, until?: Date) {
  return and(
    eq(schema.reviews.userId, scope.userId),
    eq(schema.reviews.languageId, scope.languageId),
    gte(schema.reviews.reviewedAt, since),
    until ? lt(schema.reviews.reviewedAt, until) : undefined,
    isNull(schema.reviewUndos.reviewId),
  );
}

async function reviewCounts(scope: Scope, since: Date, until?: Date) {
  const [row] = await getDb()
    .select({
      total: sql<number>`count(*)::int`,
      recalls: sql<number>`count(*) filter (where ${schema.reviews.statusBefore} = 'review')::int`,
      remembered: sql<number>`count(*) filter (where ${schema.reviews.statusBefore} = 'review' and ${schema.reviews.rating} > 1)::int`,
    })
    .from(schema.reviews)
    .leftJoin(
      schema.reviewUndos,
      eq(schema.reviewUndos.reviewId, schema.reviews.id),
    )
    .where(countedReviews(scope, since, until));
  return row;
}

/** Fällige Lernstände, die nicht neu sind, nach Tag; Überfälliges zählt zu heute. */
export async function forecast(
  scope: Scope,
  now: Date,
  days: number,
): Promise<DayCount[]> {
  const today = startOfDay(now).toISOString();
  const rows = await getDb()
    .select({
      day: zurichDay(
        sql`greatest(${schema.cardSchedules.dueAt}, ${today}::timestamptz)`,
      ),
      count: sql<number>`count(*)::int`,
    })
    .from(schema.cardSchedules)
    .innerJoin(schema.cards, eq(schema.cards.id, schema.cardSchedules.cardId))
    .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
    .where(
      and(
        eq(schema.decks.userId, scope.userId),
        eq(schema.decks.languageId, scope.languageId),
        sql`${schema.cardSchedules.scheduleStatus} <> 'new'`,
        ACTIVE_SCHEDULE,
        lt(schema.cardSchedules.dueAt, addDays(now, days)),
      ),
    )
    .groupBy(sql`1`);
  return fillDays(rows, now, days, (day) => ({ day, count: 0 }));
}

export type HistoryDay = { day: string; remembered: number; again: number };

export async function history(
  scope: Scope,
  now: Date,
  days: number,
): Promise<HistoryDay[]> {
  const from = addDays(now, -(days - 1));
  const rows = await getDb()
    .select({
      day: zurichDay(schema.reviews.reviewedAt),
      remembered: sql<number>`count(*) filter (where ${schema.reviews.rating} > 1)::int`,
      again: sql<number>`count(*) filter (where ${schema.reviews.rating} = 1)::int`,
    })
    .from(schema.reviews)
    .leftJoin(
      schema.reviewUndos,
      eq(schema.reviewUndos.reviewId, schema.reviews.id),
    )
    .where(countedReviews(scope, startOfDay(from)))
    .groupBy(sql`1`);
  return fillDays(rows, from, days, (day) => ({
    day,
    remembered: 0,
    again: 0,
  }));
}

export type Tiles = {
  dueToday: number;
  dueTomorrow: number;
  newToday: number;
  newTotal: number;
  learnedToday: number;
  learnedYesterday: number;
  /** Wiederholungen ohne „Nochmal", in Prozent der letzten 30 Tage; `null` ohne Wiederholung. */
  accuracy: number | null;
  accuracyBefore: number | null;
};

const MONTH = 30;

export async function tiles(scope: Scope, now = new Date()): Promise<Tiles> {
  const heute = startOfDay(now);
  const [decks, days, today, yesterday, month, monthBefore] = await Promise.all(
    [
      listDecks(scope.userId, scope.languageId, now),
      forecast(scope, now, 2),
      reviewCounts(scope, heute),
      reviewCounts(scope, addDays(now, -1), heute),
      reviewCounts(scope, addDays(now, -(MONTH - 1))),
      reviewCounts(
        scope,
        addDays(now, -(2 * MONTH - 1)),
        addDays(now, -(MONTH - 1)),
      ),
    ],
  );

  return {
    dueToday: days[0]?.count ?? 0,
    dueTomorrow: days[1]?.count ?? 0,
    newToday: decks.reduce((sum, deck) => sum + deck.newToday, 0),
    newTotal: decks.reduce((sum, deck) => sum + deck.newCount, 0),
    learnedToday: today.total,
    learnedYesterday: yesterday.total,
    accuracy: share(month.remembered, month.recalls),
    accuracyBefore: share(monthBefore.remembered, monthBefore.recalls),
  };
}
