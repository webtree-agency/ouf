import assert from "node:assert/strict";
import { test } from "node:test";

import { languageProfile } from "../languages/catalog.ts";
import { instructions } from "./suggest.ts";

test("nach dem Genus fragt nur eine Sprache, die eines hat", () => {
  assert.match(instructions(languageProfile("fr")), /"m" oder "f"/);
  assert.match(instructions(languageProfile("en")), /gender: immer ""/);
  assert.match(instructions(languageProfile("en")), /Englisch/);
});
