import assert from "node:assert/strict";
import { test } from "node:test";

import { sectionRoot } from "./sectionRoot.ts";

test("führt zum Anfang des Bereichs", () => {
  assert.equal(sectionRoot("/karten/123"), "/karten");
  assert.equal(sectionRoot("/karten?deck=1&seite=2"), "/karten");
  assert.equal(sectionRoot("/"), "/");
});

test("nimmt keine fremde Adresse an", () => {
  assert.equal(sectionRoot("//boese.example/x"), "/");
  assert.equal(sectionRoot("https://boese.example"), "/");
});
