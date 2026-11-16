import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  countQueue,
  pickNext,
  remainingNew,
  withinNewLimits,
  type QueueItem,
} from "./queue.ts";

const now = new Date("2026-11-16T09:00:00Z");
const min = (m: number) => new Date(now.getTime() + m * 60_000);
const item = (id: string, dueAt: Date, deckId = "d1"): QueueItem => ({
  scheduleId: id,
  deckId,
  dueAt,
});

describe("pickNext", () => {
  test("ein fälliger Lernschritt geht allem vor", () => {
    const next = pickNext(
      {
        learning: [item("l", min(-1))],
        reviews: [item("r", min(-600))],
        fresh: [item("n", now)],
      },
      now,
    );
    assert.equal(next?.scheduleId, "l");
  });

  test("dann die am längsten fällige Wiederholung", () => {
    const next = pickNext(
      {
        learning: [item("l", min(5))],
        reviews: [item("r1", min(-60)), item("r2", min(-600))],
        fresh: [item("n", now)],
      },
      now,
    );
    assert.equal(next?.scheduleId, "r2");
  });

  test("dann eine neue Karte", () => {
    const next = pickNext(
      { learning: [item("l", min(5))], reviews: [], fresh: [item("n", now)] },
      now,
    );
    assert.equal(next?.scheduleId, "n");
  });

  test("am Ende ein Lernschritt der nächsten 20 Minuten, später keiner", () => {
    assert.equal(
      pickNext({ learning: [item("l", min(15))], reviews: [], fresh: [] }, now)
        ?.scheduleId,
      "l",
    );
    assert.equal(
      pickNext({ learning: [item("l", min(25))], reviews: [], fresh: [] }, now),
      null,
    );
  });
});

test("neue Karten halten das Tageslimit je Deck ein", () => {
  const kandidaten = [
    item("a1", now, "a"),
    item("a2", now, "a"),
    item("b1", now, "b"),
    item("a3", now, "a"),
  ];
  const erlaubt = withinNewLimits(
    kandidaten,
    new Map([
      ["a", 2],
      ["b", 0],
    ]),
  );
  assert.deepEqual(
    erlaubt.map((i) => i.scheduleId),
    ["a1", "a2"],
  );
});

test("was heute schon neu gelernt wurde, zählt gegen das Limit", () => {
  assert.equal(remainingNew(20, 5), 15);
  assert.equal(remainingNew(20, 25), 0);
  assert.equal(remainingNew(0, 0), 0);
});

test("zählt neu, im Lernschritt und fällig", () => {
  assert.deepEqual(
    countQueue({
      learning: [item("l", now)],
      reviews: [item("r", now), item("s", now)],
      fresh: [],
    }),
    { neu: 0, lernen: 1, faellig: 2 },
  );
});

test("zufällig: Lernschritte bleiben vorn, Fällige und Neue werden gemischt", () => {
  const queue = {
    learning: [item("l", min(5))],
    reviews: [item("r1", min(-600)), item("r2", min(-10))],
    fresh: [item("n", now)],
  };
  assert.equal(pickNext(queue, now, () => 0.99)?.scheduleId, "n");
  assert.equal(pickNext(queue, now, () => 0.5)?.scheduleId, "r2");
  const dran = { ...queue, learning: [item("l", min(-1))] };
  assert.equal(pickNext(dran, now, () => 0.99)?.scheduleId, "l");
});
