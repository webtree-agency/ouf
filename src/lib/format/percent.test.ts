import assert from "node:assert/strict";
import { test } from "node:test";

import { percentOf } from "./percent.ts";

test("rundet auf ganze Prozent", () => {
  assert.equal(percentOf(22, 47), "47 %");
  assert.equal(percentOf(1, 3), "33 %");
  assert.equal(percentOf(47, 47), "100 %");
  assert.equal(percentOf(0, 47), "0 %");
});

test("ohne Ganzes gibt es keinen Anteil, aber auch keinen Absturz", () => {
  assert.equal(percentOf(0, 0), "0 %");
  assert.equal(percentOf(5, 0), "0 %");
});
