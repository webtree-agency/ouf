import assert from "node:assert/strict";
import { test } from "node:test";

import { frontKey } from "./frontKey.ts";

test("übersieht Gross- und Kleinschreibung und Leerraum", () => {
  assert.equal(frontKey("  La   Maison "), "la maison");
});

test("macht aus dem typografischen Apostroph einen geraden", () => {
  assert.equal(frontKey("l’eau"), frontKey("l'eau"));
});

test("lässt Akzente stehen", () => {
  assert.notEqual(frontKey("la pêche"), frontKey("le péché"));
  assert.notEqual(frontKey("ou"), frontKey("où"));
});

test("setzt zerlegte Akzente zusammen", () => {
  assert.equal(frontKey("café"), frontKey("café"));
});
