import assert from "node:assert/strict";
import { test } from "node:test";

import { costOf } from "./pricing.ts";

test("rechnet Tokens je Million und Ton je Minute", () => {
  assert.equal(
    costOf({ inputTokens: 1_000_000, outputTokens: 0, audioMs: 0 }),
    0.1,
  );
  assert.equal(
    costOf({ inputTokens: 0, outputTokens: 2_000_000, audioMs: 0 }),
    1,
  );
  assert.equal(
    costOf({ inputTokens: 0, outputTokens: 0, audioMs: 120_000 }),
    0.001,
  );
});

test("ohne Verbrauch kostet es nichts", () => {
  assert.equal(costOf({ inputTokens: 0, outputTokens: 0, audioMs: 0 }), 0);
});
