import assert from "node:assert/strict";
import { test } from "node:test";

import { formatInterval } from "./intervals.ts";

const from = new Date("2026-11-16T09:00:00Z");
const after = (ms: number) => new Date(from.getTime() + ms);
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

// de-CH schreibt den Dezimalpunkt, wie bei Franken.
test("schreibt Minuten, Stunden, Tage, Monate und Jahre", () => {
  assert.equal(formatInterval(from, after(MINUTE)), "1 Min");
  assert.equal(formatInterval(from, after(10 * MINUTE)), "10 Min");
  assert.equal(formatInterval(from, after(5 * 60 * MINUTE)), "5 Std");
  assert.equal(formatInterval(from, after(DAY)), "1 Tag");
  assert.equal(formatInterval(from, after(12 * DAY)), "12 Tage");
  assert.equal(formatInterval(from, after(45 * DAY)), "1.5 Monate");
  assert.equal(formatInterval(from, after(30 * DAY)), "1 Monat");
  assert.equal(formatInterval(from, after(730 * DAY)), "2 Jahre");
});

test("zeigt nie weniger als eine Minute", () => {
  assert.equal(formatInterval(from, from), "1 Min");
  assert.equal(formatInterval(from, after(-5 * MINUTE)), "1 Min");
});
