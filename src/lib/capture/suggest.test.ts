import assert from "node:assert/strict";
import { test } from "node:test";

import { languageProfile } from "../languages/catalog.ts";
import { cardInstructions } from "./suggest.ts";

test("nach dem Genus fragt nur eine Sprache, die eines hat", () => {
  assert.match(cardInstructions(languageProfile("fr")), /"m" oder "f"/);
  assert.match(cardInstructions(languageProfile("en")), /gender: immer ""/);
  assert.match(cardInstructions(languageProfile("en")), /Englisch/);
});
