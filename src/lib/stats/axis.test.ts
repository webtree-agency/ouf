import assert from "node:assert/strict";
import { test } from "node:test";

import { thinLabels } from "./axis.ts";

test("beschriftet bei 30 Tagen jeden siebten, den letzten immer", () => {
  const labels = Array.from({ length: 30 }, (_, i) => String(i));
  const thin = thinLabels(labels);
  assert.equal(thin[29], "29");
  assert.equal(thin[22], "22");
  assert.equal(thin[28], "");
  assert.equal(thin.filter(Boolean).length, 5);
});

test("lässt kurze Reihen ganz", () => {
  assert.deepEqual(thinLabels(["a", "b", "c"]), ["a", "b", "c"]);
});
