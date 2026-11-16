import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth.ts";

/** Was eine Sprache kann (Genus, Sprechsprache), steht im Code: `lib/languages/catalog.ts`. */
export const languages = pgTable(
  "languages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("languages_user_code_idx").on(table.userId, table.code),
  ],
);

export const decks = pgTable(
  "decks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Ein Emoji als Icon, frei gewählt (Jann, 16.11.2026). */
    emoji: text("emoji"),
    // Die einzige Einstellung in ouf. (CLAUDE.md, „Weniger ist mehr").
    newPerDay: integer("new_per_day").notNull().default(20),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("decks_language_name_idx").on(
      table.languageId,
      sql`lower(${table.name})`,
    ),
    index("decks_user_idx").on(table.userId),
  ],
);

export const gender = pgEnum("gender", ["m", "f"]);

export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deckId: uuid("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    // Der Artikel gehört zum Wort: „la maison", „l'eau".
    front: text("front").notNull(),
    back: text("back").notNull(),
    example: text("example"),
    note: text("note"),
    gender: gender("gender"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    reverse: boolean("reverse").notNull().default(false),
    // Die normierte Vorderseite, für die Dublettenprüfung (`lib/cards/frontKey.ts`).
    frontKey: text("front_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("cards_deck_idx").on(table.deckId),
    index("cards_front_key_idx").on(table.frontKey),
    index("cards_tags_idx").using("gin", table.tags),
  ],
);

export const direction = pgEnum("direction", ["forward", "reverse"]);

/**
 * Der FSRS-Stand je Richtung. Die Vorgaben der Spalten sind eine neue Karte;
 * gerechnet wird nur in `lib/learning/scheduler.ts`.
 */
export const cardSchedules = pgTable(
  "card_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    direction: direction("direction").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull().defaultNow(),
    lastReviewAt: timestamp("last_review_at", { withTimezone: true }),
    stability: doublePrecision("stability").notNull().default(0),
    difficulty: doublePrecision("difficulty").notNull().default(0),
    state: smallint("state").notNull().default(0),
    scheduleStatus: text("schedule_status").notNull().default("new"),
    scheduledDays: doublePrecision("scheduled_days").notNull().default(0),
    learningStep: integer("learning_step").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("card_schedules_card_direction_idx").on(
      table.cardId,
      table.direction,
    ),
    index("card_schedules_due_idx").on(table.dueAt),
  ],
);

/**
 * **Jede Bewertung, nur angefügt** (§8). Ein Auslöser weist `UPDATE` und
 * `DELETE` ab; einzig Konto löschen darf es (`lib/account/credentials.ts`).
 * Karte, Deck und Sprache stehen ohne Fremdschlüssel: Wer eine Karte löscht,
 * behält ihre Geschichte in der Statistik.
 */
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    languageId: uuid("language_id").notNull(),
    deckId: uuid("deck_id").notNull(),
    cardId: uuid("card_id").notNull(),
    scheduleId: uuid("schedule_id").notNull(),
    rating: smallint("rating").notNull(),
    statusBefore: text("status_before").notNull(),
    scheduledDays: doublePrecision("scheduled_days").notNull(),
    dueAfter: timestamp("due_after", { withTimezone: true }).notNull(),
    durationMs: integer("duration_ms").notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Der ganze Stand davor: daraus stellt Rückgängig ihn wieder her.
    before: jsonb("before").notNull(),
  },
  (table) => [
    index("reviews_user_time_idx").on(table.userId, table.reviewedAt),
    index("reviews_schedule_idx").on(table.scheduleId),
  ],
);

/** Welche Bewertung zurückgenommen wurde. Ebenfalls nur angefügt. */
export const reviewUndos = pgTable("review_undos", {
  reviewId: uuid("review_id")
    .primaryKey()
    .references(() => reviews.id, { onDelete: "cascade" }),
  undoneAt: timestamp("undone_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
