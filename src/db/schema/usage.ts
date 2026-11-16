import {
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth.ts";

/** Wofür ein fremder Dienst gerufen wurde (`ENTSCHEIDE.md`, Diktat und KI). */
export const aiTask = pgEnum("ai_task", [
  "transcribe",
  "card",
  "example",
  "translate",
]);

/**
 * Ein Eintrag je Aufruf, damit das Konto die Kosten zeigen kann. Gerechnet
 * wird beim Lesen (`lib/capture/pricing.ts`), gespeichert nur, was gemessen ist.
 */
export const aiUsage = pgTable(
  "ai_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    task: aiTask("task").notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    audioMs: integer("audio_ms").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("ai_usage_user_time_idx").on(table.userId, table.createdAt),
  ],
);
