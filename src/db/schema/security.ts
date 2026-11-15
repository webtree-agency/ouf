import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// In der Datenbank statt im Speicher: mehrere Prozesse teilen sich sonst kein Limit.
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStartedAt: timestamp("window_started_at", {
    withTimezone: true,
  }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
