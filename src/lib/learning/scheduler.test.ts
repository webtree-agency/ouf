import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { newState, preview, review, type ScheduleState } from "./scheduler.ts";

const ID = "6f1c2a8e-7b0d-4c1e-9a35-2f8d1e0b4c77";
const now = new Date("2026-11-16T09:00:00Z");
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

describe("eine neue Karte", () => {
  test("Nochmal holt sie nach einer Minute zurück", async () => {
    const next = await review(ID, newState(now), 1, now);
    assert.equal(next.dueAt.getTime() - now.getTime(), MINUTE);
    assert.equal(next.scheduleStatus, "learning");
  });

  test("Gut führt in den zweiten Lernschritt, zehn Minuten", async () => {
    const next = await review(ID, newState(now), 3, now);
    assert.equal(next.dueAt.getTime() - now.getTime(), 10 * MINUTE);
    assert.equal(next.learningStep, 1);
  });

  test("Leicht überspringt die Lernschritte", async () => {
    const next = await review(ID, newState(now), 4, now);
    assert.equal(next.scheduleStatus, "review");
    assert.ok(next.dueAt.getTime() - now.getTime() >= DAY);
  });
});

test("zweimal Gut macht aus der Karte eine Wiederholung in Tagen", async () => {
  const erste = await review(ID, newState(now), 3, now);
  const zweite = await review(ID, erste, 3, erste.dueAt);
  assert.equal(zweite.scheduleStatus, "review");
  assert.ok(zweite.scheduledDays >= 1);
  assert.equal(zweite.reps, 2);
});

test("Nochmal auf einer Wiederholung zählt einen Fehler und lernt neu", async () => {
  let state: ScheduleState = newState(now);
  state = await review(ID, state, 4, now);
  const vergessen = await review(ID, state, 1, state.dueAt);
  assert.equal(vergessen.scheduleStatus, "learning");
  assert.equal(vergessen.state, 3);
  assert.equal(vergessen.dueAt.getTime() - state.dueAt.getTime(), 10 * MINUTE);
  assert.equal(vergessen.lapses, 1);
});

test("die Vorschau sagt dasselbe wie die Bewertung", async () => {
  let state: ScheduleState = newState(now);
  state = await review(ID, state, 4, now);
  const später = state.dueAt;
  const vorschau = await preview(ID, state, später);
  for (const rating of [1, 2, 3, 4] as const) {
    assert.equal(
      vorschau[rating].getTime(),
      (await review(ID, state, rating, später)).dueAt.getTime(),
    );
  }
  assert.ok(
    vorschau[1] < vorschau[2] &&
      vorschau[2] <= vorschau[3] &&
      vorschau[3] <= vorschau[4],
  );
});
