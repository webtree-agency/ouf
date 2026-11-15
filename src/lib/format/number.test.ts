import assert from "node:assert/strict";
import { test } from "node:test";

import { formatCount } from "./number.ts";
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
