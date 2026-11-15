import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import { closeDb } from "../../db/index.ts";
import { setupTestDb, truncateAll } from "../../db/testing.ts";
import { consumeRateLimit, resetRateLimit } from "./rateLimit.ts";

before(setupTestDb);
beforeEach(truncateAll);
after(closeDb);

const MINUTE = 60_000;
const start = new Date("2026-11-15T10:00:00Z");

test("lässt bis zur Grenze durch und weist danach ab", async () => {
  const versuch = () =>
    consumeRateLimit({ key: "k", limit: 2, windowMs: MINUTE, now: start });

  assert.equal((await versuch()).allowed, true);
  assert.equal((await versuch()).allowed, true);
  const dritter = await versuch();
  assert.equal(dritter.allowed, false);
  assert.equal(dritter.count, 3);
});

test("beginnt nach dem Fenster neu", async () => {
  await consumeRateLimit({ key: "k", limit: 1, windowMs: MINUTE, now: start });
  const spaeter = new Date(start.getTime() + 2 * MINUTE);
  const result = await consumeRateLimit({
    key: "k",
    limit: 1,
    windowMs: MINUTE,
    now: spaeter,
  });
  assert.equal(result.allowed, true);
  assert.equal(result.count, 1);
});

test("zählt je Schlüssel getrennt und lässt sich zurücksetzen", async () => {
  await consumeRateLimit({ key: "a", limit: 1, windowMs: MINUTE, now: start });
  assert.equal(
    (
      await consumeRateLimit({
        key: "b",
        limit: 1,
        windowMs: MINUTE,
        now: start,
      })
    ).allowed,
    true,
  );
  await resetRateLimit("a");
  assert.equal(
    (
      await consumeRateLimit({
        key: "a",
        limit: 1,
        windowMs: MINUTE,
        now: start,
      })
    ).count,
    1,
  );
});
