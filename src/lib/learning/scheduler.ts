import {
  DefaultScheduler,
  type DefaultSchedulerCardInput,
  type Grade,
} from "ts-fsrs";

/**
 * **Die einzige Datei, die ts-fsrs kennt.** FSRS-6 mit Lernschritten 1 und
 * 10 Minuten, Wiederlernen 10 Minuten, Zielbehalt 90 %, Streuung an. Die
 * Streuung hängt an der Kennung des Lernstands, deshalb stimmen Vorschau und
 * Bewertung überein (ENTSCHEIDE.md, Block 0; Brain: ts-fsrs 6).
 */
export type Rating = 1 | 2 | 3 | 4;
export const RATINGS: readonly Rating[] = [1, 2, 3, 4];

// Wiederlernen ist in ts-fsrs 6 `learning` mit `state` 3, kein eigener Status.
export type ScheduleStatus = "new" | "learning" | "review";

/** Was in `card_schedules` steht. */
export type ScheduleState = {
  dueAt: Date;
  lastReviewAt: Date | null;
  stability: number;
  difficulty: number;
  state: number;
  scheduleStatus: ScheduleStatus;
  scheduledDays: number;
  learningStep: number;
  reps: number;
  lapses: number;
};

type Scheduler = Awaited<ReturnType<typeof createScheduler>>;
type SchedulerCard = DefaultSchedulerCardInput<"FSRS-6">;

function createScheduler() {
  return DefaultScheduler({
    version: "FSRS-6",
    desiredRetention: 0.9,
    learningSteps: ["1m", "10m"],
    relearningSteps: ["10m"],
    enableFuzz: true,
  });
}

let scheduler: Promise<Scheduler> | null = null;

// Einmal je Prozess: der Aufbau ist asynchron, das Ergebnis unveränderlich.
function getScheduler(): Promise<Scheduler> {
  scheduler ??= createScheduler();
  return scheduler;
}

function toCard(id: string, state: ScheduleState): SchedulerCard {
  return { ...state, cardId: id } as SchedulerCard;
}

function fromCard(card: Record<string, unknown>): ScheduleState {
  return {
    dueAt: new Date(card.dueAt as Date),
    lastReviewAt: card.lastReviewAt
      ? new Date(card.lastReviewAt as Date)
      : null,
    stability: Number(card.stability),
    difficulty: Number(card.difficulty),
    state: Number(card.state),
    scheduleStatus: card.scheduleStatus as ScheduleStatus,
    scheduledDays: Number(card.scheduledDays),
    learningStep: Number(card.learningStep ?? 0),
    reps: Number(card.reps),
    lapses: Number(card.lapses),
  };
}

/** Der Stand nach einer Bewertung. */
export async function review(
  id: string,
  state: ScheduleState,
  rating: Rating,
  now: Date,
): Promise<ScheduleState> {
  const result = (await getScheduler()).review({
    card: toCard(id, state),
    now,
    grade: rating as Grade,
  });
  return fromCard(result.card as Record<string, unknown>);
}

/** Wann die Karte je nach Bewertung wieder kommt: für die Zahlen neben den Knöpfen. */
export async function preview(
  id: string,
  state: ScheduleState,
  now: Date,
): Promise<Record<Rating, Date>> {
  const entries = await Promise.all(
    RATINGS.map(
      async (rating) =>
        [rating, (await review(id, state, rating, now)).dueAt] as const,
    ),
  );
  return Object.fromEntries(entries) as Record<Rating, Date>;
}

/** Eine neue Karte, wie sie die Spalten-Vorgaben in `card_schedules` anlegen. */
export function newState(now: Date): ScheduleState {
  return {
    dueAt: now,
    lastReviewAt: null,
    stability: 0,
    difficulty: 0,
    state: 0,
    scheduleStatus: "new",
    scheduledDays: 0,
    learningStep: 0,
    reps: 0,
    lapses: 0,
  };
}
