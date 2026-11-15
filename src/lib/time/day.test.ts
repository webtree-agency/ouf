import assert from "node:assert/strict";
import { test } from "node:test";

import { addDays, dayKey, endOfDay, startOfDay } from "./day.ts";

test("ein Tag beginnt um Mitternacht in Zürich, im Winter UTC+1", () => {
  const abends = new Date("2026-11-15T22:30:00Z");
  assert.equal(dayKey(abends), "2026-11-15");
  assert.equal(startOfDay(abends).toISOString(), "2026-11-14T23:00:00.000Z");
  assert.equal(endOfDay(abends).toISOString(), "2026-11-15T23:00:00.000Z");
});

test("nach Mitternacht in Zürich ist schon der nächste Tag", () => {
  const nachts = new Date("2026-11-15T23:30:00Z");
  assert.equal(dayKey(nachts), "2026-11-16");
  assert.equal(startOfDay(nachts).toISOString(), "2026-11-15T23:00:00.000Z");
});

test("im Sommer gilt UTC+2", () => {
  assert.equal(
    startOfDay(new Date("2026-07-01T12:00:00Z")).toISOString(),
    "2026-06-30T22:00:00.000Z",
  );
});

test("der Tag der Zeitumstellung hat 23 Stunden", () => {
  const umstellung = new Date("2026-03-29T12:00:00Z");
  const dauer =
    endOfDay(umstellung).getTime() - startOfDay(umstellung).getTime();
  assert.equal(dauer, 23 * 60 * 60 * 1000);
});

test("zählt Tage über die Zeitumstellung hinweg", () => {
  assert.equal(
    dayKey(addDays(new Date("2026-03-28T10:00:00Z"), 1)),
    "2026-03-29",
  );
  assert.equal(
    dayKey(addDays(new Date("2026-03-28T10:00:00Z"), 2)),
    "2026-03-30",
  );
  assert.equal(
    dayKey(addDays(new Date("2026-11-15T10:00:00Z"), -1)),
    "2026-11-14",
  );
});
