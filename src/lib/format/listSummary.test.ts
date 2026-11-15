import assert from "node:assert/strict";
import { test } from "node:test";

import { listSummary } from "./listSummary.ts";

const KUNDEN = { one: "Kunde", many: "Kunden" };

test("nennt die Gesamtzahl der Auswahl", () => {
  assert.equal(listSummary(47, 1, 1, KUNDEN), "47 Kunden");
});

test("bei genau einem steht die Einzahl", () => {
  assert.equal(listSummary(1, 1, 1, KUNDEN), "1 Kunde");
});

test("bei keinem steht die Mehrzahl", () => {
  assert.equal(listSummary(0, 1, 1, KUNDEN), "0 Kunden");
});

test("die Seite steht nur dabei, wenn es mehr als eine gibt", () => {
  assert.equal(listSummary(47, 2, 2, KUNDEN), "47 Kunden · Seite 2 von 2");
  assert.equal(listSummary(20, 1, 1, KUNDEN), "20 Kunden");
});
