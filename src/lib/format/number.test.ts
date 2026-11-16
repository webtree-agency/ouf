import assert from "node:assert/strict";
import { test } from "node:test";

import { formatCount, formatDollars } from "./number.ts";
import { counted } from "./plural.ts";

test("Tausender werden mit geradem Apostroph gruppiert", () => {
  assert.equal(formatCount(34706), "34'706");
  assert.equal(formatCount(1000000), "1'000'000");
});

test("bis drei Stellen bleibt die Zahl, wie sie ist", () => {
  assert.equal(formatCount(0), "0");
  assert.equal(formatCount(999), "999");
});

/** Der Grund für die Auslagerung: bei 47 Kunden fiel es nicht auf, bei 34'706 Leads schon. */
test("auch die Zeile unter einer Liste gruppiert", () => {
  assert.equal(counted(34706, { one: "Lead", many: "Leads" }), "34'706 Leads");
  assert.equal(counted(1, { one: "Lead", many: "Leads" }), "1 Lead");
});

test("Dollar mit zwei Stellen, unter einem Cent mit vier", () => {
  assert.equal(formatDollars(0), "0.0000 $");
  assert.equal(formatDollars(0.00042), "0.0004 $");
  assert.equal(formatDollars(0.00001), "unter 0.0001 $");
  assert.equal(formatDollars(1234.5), "1'234.50 $");
});
