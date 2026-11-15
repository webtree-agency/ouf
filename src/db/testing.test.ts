import assert from "node:assert/strict";
import { test } from "node:test";

import { assertTestDatabase, testDbNameFor } from "./testing.ts";

test("leert nur Testdatenbanken", () => {
  assert.doesNotThrow(() => assertTestDatabase("ouf_test"));
  assert.doesNotThrow(() => assertTestDatabase("t_session_itest_ts_1a2b3c4d"));
  assert.throws(() => assertTestDatabase("ouf"));
});

test("gibt jeder Testdatei einen eigenen, gültigen Namen", () => {
  const a = testDbNameFor("/repo/src/lib/a/session.itest.ts");
  const b = testDbNameFor("/repo/src/lib/b/session.itest.ts");
  assert.notEqual(a, b);
  assert.match(a, /^t_[a-z0-9_]{1,61}$/);
});
