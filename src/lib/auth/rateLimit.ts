import { sql } from "drizzle-orm";

import { getDb } from "../../db/index.ts";

export type RateLimitResult = {
  allowed: boolean;
  count: number;
  retryAfterMs: number;
};

/** Zählt einen Versuch in einem festen Fenster; ein Aufruf, eine Zeile. */
export async function consumeRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
  now?: Date;
}): Promise<RateLimitResult> {
  const now = input.now ?? new Date();
  // Als Zeichenkette mit Typumwandlung: rohes SQL reicht ein Date ungewandelt
  // an den Treiber weiter, und der wirft (Brain, drizzle-sql-template-mit-date).
  const at = now.toISOString();
  const windowStart = new Date(now.getTime() - input.windowMs).toISOString();
  const expiresAt = new Date(now.getTime() + input.windowMs).toISOString();

  const rows = await getDb().execute<{
    count: number;
    window_started_at: Date;
  }>(sql`
    insert into rate_limits (key, count, window_started_at, expires_at)
    values (${input.key}, 1, ${at}::timestamptz, ${expiresAt}::timestamptz)
    on conflict (key) do update set
      count = case
        when rate_limits.window_started_at < ${windowStart}::timestamptz then 1
        else rate_limits.count + 1
      end,
      window_started_at = case
        when rate_limits.window_started_at < ${windowStart}::timestamptz then ${at}::timestamptz
        else rate_limits.window_started_at
      end,
      expires_at = case
        when rate_limits.window_started_at < ${windowStart}::timestamptz then ${expiresAt}::timestamptz
        else rate_limits.expires_at
      end
    returning count, window_started_at
  `);

  const row = rows[0];
  const startedAt = new Date(row.window_started_at);
  return {
    allowed: row.count <= input.limit,
    count: row.count,
    retryAfterMs: Math.max(
      0,
      startedAt.getTime() + input.windowMs - now.getTime(),
    ),
  };
}

export async function resetRateLimit(key: string): Promise<void> {
  await getDb().execute(sql`delete from rate_limits where key = ${key}`);
}
