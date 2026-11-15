import assert from "node:assert/strict";
import { test } from "node:test";

import { directionOf, formatChange, percentChange } from "./change.ts";

test("die Veränderung ist gerundet und vorzeichenbehaftet", () => {
  assert.equal(percentChange(50, 12), 317);
  assert.equal(percentChange(12, 50), -76);
  assert.equal(percentChange(50, 50), 0);
});

test("ohne Vorher gibt es keine Veränderung, auch keine von null", () => {
  // 100 % wäre eine Auskunft, die niemand hat: von 0 auf 12 ist kein Wachstum
  // um hundert Prozent, und von 0 auf 0 ist keine Verbesserung.
  assert.equal(percentChange(12, 0), null);
  assert.equal(percentChange(0, 0), null);
});

test("bei der Position ist die kleinere Zahl die gute", () => {
  // Platz 11 → Platz 4 ist ein Fortschritt und muss grün aussehen, sonst steht
  // ein rotes Minus neben der besten Nachricht des Monats.
  assert.equal(directionOf(-64, true), "hoch");
  assert.equal(directionOf(64, true), "runter");

  assert.equal(directionOf(64), "hoch");
  assert.equal(directionOf(-64), "runter");
});

test("keine Veränderung ist keine Richtung", () => {
  assert.equal(directionOf(0), "gleich");
  assert.equal(directionOf(null), "gleich");
  assert.equal(directionOf(null, true), "gleich");
});

test("der Pfeil trägt das Vorzeichen, nicht die Zahl", () => {
  assert.equal(formatChange(317), "▲ 317 %");
  assert.equal(formatChange(-76), "▼ 76 %");
  assert.equal(formatChange(0), "→ 0 %");
  assert.equal(formatChange(null), "—");
});
