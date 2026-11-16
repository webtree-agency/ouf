import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import { closeDb, getDb, schema } from "../../db/index.ts";
import { seedUser, setupTestDb, truncateAll } from "../../db/testing.ts";
import { monthUsage } from "./usage.ts";

before(setupTestDb);
beforeEach(truncateAll);
after(closeDb);

const now = new Date("2026-11-16T09:00:00Z");

test("zählt nur den laufenden Monat und nur das eigene Konto", async () => {
  const jann = await seedUser();
  const noah = await seedUser({ email: "noah@ouf.local" });
  await getDb()
    .insert(schema.aiUsage)
    .values([
      { userId: jann, task: "card", inputTokens: 1_000_000, outputTokens: 0 },
      { userId: jann, task: "card", outputTokens: 1_000_000 },
      { userId: jann, task: "transcribe", audioMs: 60_000 },
      // Am 31. Oktober um 23:30 Zürcher Zeit, also noch im Vormonat.
      {
        userId: jann,
        task: "example",
        outputTokens: 1_000_000,
        createdAt: new Date("2026-10-31T22:30:00Z"),
      },
      { userId: noah, task: "card", outputTokens: 9_000_000 },
    ]);

  const usage = await monthUsage(jann, now);
  assert.deepEqual(
    usage.tasks.map((task) => [task.task, task.calls]),
    [
      ["transcribe", 1],
      ["card", 2],
    ],
  );
  assert.equal(usage.total.toFixed(4), "0.6005");
});
