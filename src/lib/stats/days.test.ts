import assert from "node:assert/strict";
import { test } from "node:test";

import { dayLabel, fillDays, share } from "./days.ts";

test("füllt Tage ohne Eintrag mit null", () => {
  const rows = [{ day: "2026-11-17", count: 4 }];
  const filled = fillDays(rows, new Date("2026-11-16T09:00:00Z"), 3, (day) => ({
    day,
    count: 0,
  }));
  assert.deepEqual(filled, [
    { day: "2026-11-16", count: 0 },
    { day: "2026-11-17", count: 4 },
    { day: "2026-11-18", count: 0 },
  ]);
});

test("schreibt den Tag kurz mit Wochentag", () => {
  assert.equal(dayLabel("2026-11-16"), "Mo 16.");
  assert.equal(dayLabel("2026-11-22"), "So 22.");
});

test("rechnet einen Anteil nur mit Grundmenge", () => {
  assert.equal(share(9, 10), 90);
  assert.equal(share(0, 0), null);
});
