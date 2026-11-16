import assert from "node:assert/strict";
import { test } from "node:test";

import { mayRegister } from "./signupAllowlist.ts";

test("lässt nur Adressen aus der Liste zu, ohne Rücksicht auf Gross und Klein", () => {
  const list = " jann@ouf.local , Freund@Beispiel.ch";
  assert.equal(mayRegister("Jann@ouf.local", list), true);
  assert.equal(mayRegister("freund@beispiel.ch", list), true);
  assert.equal(mayRegister("fremd@beispiel.ch", list), false);
});

test("ist ohne Liste zu, auch für eine leere Adresse", () => {
  assert.equal(mayRegister("jann@ouf.local", ""), false);
  assert.equal(mayRegister("", ","), false);
});
