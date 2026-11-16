import { and, eq, gte, sql } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { costOf } from "../capture/pricing.ts";
import { startOfMonth } from "../time/day.ts";

export type TaskUsage = {
  task: (typeof schema.aiTask.enumValues)[number];
  calls: number;
  cost: number;
};

/** Was Diktat und Vorschläge im laufenden Monat (Zürich) gekostet haben, je Aufgabe. */
export async function monthUsage(
  userId: string,
  now: Date,
): Promise<{ tasks: TaskUsage[]; total: number }> {
  const rows = await getDb()
    .select({
      task: schema.aiUsage.task,
      calls: sql<number>`count(*)::int`,
      inputTokens: sql<number>`coalesce(sum(${schema.aiUsage.inputTokens}), 0)::int`,
      outputTokens: sql<number>`coalesce(sum(${schema.aiUsage.outputTokens}), 0)::int`,
      audioMs: sql<number>`coalesce(sum(${schema.aiUsage.audioMs}), 0)::int`,
    })
    .from(schema.aiUsage)
    .where(
      and(
        eq(schema.aiUsage.userId, userId),
        gte(schema.aiUsage.createdAt, startOfMonth(now)),
      ),
    )
    .groupBy(schema.aiUsage.task)
    .orderBy(schema.aiUsage.task);
  const tasks = rows.map((row) => ({
    task: row.task,
    calls: row.calls,
    cost: costOf(row),
  }));
  return { tasks, total: tasks.reduce((sum, task) => sum + task.cost, 0) };
}
