import { and, desc, eq, gte, isNull } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { DomainError } from "../domainError.ts";
import { languageProfile, type Gender } from "../languages/catalog.ts";
import { startOfDay } from "../time/day.ts";
import { formatInterval } from "./intervals.ts";
import { countQueue, pickNext, type QueueCounts } from "./queue.ts";
import { loadQueue, type QueueScope } from "./queueQuery.ts";
import {
  preview,
  review,
  RATINGS,
  type Rating,
  type ScheduleState,
} from "./scheduler.ts";

export type StudyCard = {
  scheduleId: string;
  /** Der Stand beim Zeigen; eine zweite Bewertung desselben Stands zählt nicht. */
  reps: number;
  direction: "forward" | "reverse";
  front: string;
  back: string;
  example: string | null;
  note: string | null;
  gender: Gender | null;
  deckName: string;
  isNew: boolean;
  intervals: Record<Rating, string>;
};

export type StudyState = {
  card: StudyCard | null;
  counts: QueueCounts;
  /** Ob es eine Bewertung von heute gibt, die sich zurücknehmen lässt. */
  canUndo: boolean;
  speech: string;
};

const SCHEDULE_COLUMNS = {
  dueAt: schema.cardSchedules.dueAt,
  lastReviewAt: schema.cardSchedules.lastReviewAt,
  stability: schema.cardSchedules.stability,
  difficulty: schema.cardSchedules.difficulty,
  state: schema.cardSchedules.state,
  scheduleStatus: schema.cardSchedules.scheduleStatus,
  scheduledDays: schema.cardSchedules.scheduledDays,
  learningStep: schema.cardSchedules.learningStep,
  reps: schema.cardSchedules.reps,
  lapses: schema.cardSchedules.lapses,
};

function stateOf(
  row: Record<keyof typeof SCHEDULE_COLUMNS, unknown>,
): ScheduleState {
  return row as ScheduleState;
}

async function loadCard(scheduleId: string, now: Date): Promise<StudyCard> {
  const [row] = await getDb()
    .select({
      ...SCHEDULE_COLUMNS,
      direction: schema.cardSchedules.direction,
      front: schema.cards.front,
      back: schema.cards.back,
      example: schema.cards.example,
      note: schema.cards.note,
      gender: schema.cards.gender,
      deckName: schema.decks.name,
    })
    .from(schema.cardSchedules)
    .innerJoin(schema.cards, eq(schema.cards.id, schema.cardSchedules.cardId))
    .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
    .where(eq(schema.cardSchedules.id, scheduleId));

  const dates = await preview(scheduleId, stateOf(row), now);
  const intervals = Object.fromEntries(
    RATINGS.map((rating) => [rating, formatInterval(now, dates[rating])]),
  ) as Record<Rating, string>;

  return {
    scheduleId,
    reps: row.reps,
    direction: row.direction,
    front: row.front,
    back: row.back,
    example: row.example,
    note: row.note,
    gender: row.gender,
    deckName: row.deckName,
    isNew: row.scheduleStatus === "new",
    intervals,
  };
}

async function lastUndoable(userId: string, languageId: string, now: Date) {
  const [last] = await getDb()
    .select({
      id: schema.reviews.id,
      scheduleId: schema.reviews.scheduleId,
      before: schema.reviews.before,
    })
    .from(schema.reviews)
    .leftJoin(
      schema.reviewUndos,
      eq(schema.reviewUndos.reviewId, schema.reviews.id),
    )
    .where(
      and(
        eq(schema.reviews.userId, userId),
        eq(schema.reviews.languageId, languageId),
        gte(schema.reviews.reviewedAt, startOfDay(now)),
        isNull(schema.reviewUndos.reviewId),
      ),
    )
    .orderBy(desc(schema.reviews.reviewedAt), desc(schema.reviews.id))
    .limit(1);
  return last ?? null;
}

export async function studyState(
  scope: QueueScope & { languageCode: string },
  now = new Date(),
  show?: string,
): Promise<StudyState> {
  const queue = await loadQueue(scope, now);
  const random = scope.filter?.random ? Math.random : undefined;
  const next = show ?? pickNext(queue, now, random)?.scheduleId;
  return {
    card: next ? await loadCard(next, now) : null,
    counts: countQueue(queue),
    canUndo: (await lastUndoable(scope.userId, scope.languageId, now)) !== null,
    speech: languageProfile(scope.languageCode).speech,
  };
}

/** Eine Bewertung: neuer Stand und Protokolleintrag in einer Transaktion. */
export async function rateCard(input: {
  userId: string;
  scheduleId: string;
  rating: Rating;
  reps: number;
  durationMs: number;
  now?: Date;
}): Promise<void> {
  const now = input.now ?? new Date();
  await getDb().transaction(async (tx) => {
    const [row] = await tx
      .select({
        ...SCHEDULE_COLUMNS,
        cardId: schema.cards.id,
        deckId: schema.decks.id,
        languageId: schema.decks.languageId,
      })
      .from(schema.cardSchedules)
      .innerJoin(schema.cards, eq(schema.cards.id, schema.cardSchedules.cardId))
      .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
      .where(
        and(
          eq(schema.cardSchedules.id, input.scheduleId),
          eq(schema.decks.userId, input.userId),
        ),
      )
      .for("update", { of: schema.cardSchedules });
    if (!row) throw new DomainError("Diese Karte gibt es nicht mehr.");
    // Ein Doppelklick bewertet nicht zweimal.
    if (row.reps !== input.reps) return;

    const before = stateOf(row);
    const after = await review(input.scheduleId, before, input.rating, now);
    await tx
      .update(schema.cardSchedules)
      .set(after)
      .where(eq(schema.cardSchedules.id, input.scheduleId));
    await tx.insert(schema.reviews).values({
      userId: input.userId,
      languageId: row.languageId,
      deckId: row.deckId,
      cardId: row.cardId,
      scheduleId: input.scheduleId,
      rating: input.rating,
      statusBefore: before.scheduleStatus,
      scheduledDays: after.scheduledDays,
      dueAfter: after.dueAt,
      durationMs: Math.round(Math.min(Math.max(input.durationMs, 0), 60_000)),
      reviewedAt: now,
      before,
    });
  });
}

/**
 * Nimmt die letzte Bewertung von heute zurück: der Stand davor kommt wieder,
 * die Rücknahme wird angefügt. Gibt den Lernstand zurück, der wieder dran ist.
 */
export async function undoLastReview(
  userId: string,
  languageId: string,
  now = new Date(),
): Promise<string> {
  const last = await lastUndoable(userId, languageId, now);
  if (!last) throw new DomainError("Heute gibt es nichts zurückzunehmen.");

  await getDb().transaction(async (tx) => {
    const before = last.before as Record<string, unknown>;
    const restored = await tx
      .update(schema.cardSchedules)
      .set({
        ...stateOf(before as Record<keyof typeof SCHEDULE_COLUMNS, unknown>),
        dueAt: new Date(before.dueAt as string),
        lastReviewAt: before.lastReviewAt
          ? new Date(before.lastReviewAt as string)
          : null,
      })
      .where(eq(schema.cardSchedules.id, last.scheduleId))
      .returning({ id: schema.cardSchedules.id });
    if (restored.length === 0)
      throw new DomainError("Die Karte gibt es nicht mehr.");
    await tx.insert(schema.reviewUndos).values({ reviewId: last.id });
  });
  return last.scheduleId;
}
