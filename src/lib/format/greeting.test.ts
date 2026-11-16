import assert from "node:assert/strict";
import { test } from "node:test";

import { frenchDay, greeting } from "./greeting.ts";

test("grüsst bis sechs Uhr abends in Zürich mit Bonjour, danach mit Bonsoir", () => {
  assert.equal(greeting(new Date("2026-11-16T16:59:00Z")), "Bonjour");
  assert.equal(greeting(new Date("2026-11-16T17:00:00Z")), "Bonsoir");
  assert.equal(greeting(new Date("2026-11-16T05:00:00Z")), "Bonjour");
});

test("schreibt den Tag französisch und klein", () => {
  assert.equal(
    frenchDay(new Date("2026-11-16T09:00:00Z")),
    "lundi 16 novembre",
  );
});
