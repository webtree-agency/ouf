import assert from "node:assert/strict";
import { test } from "node:test";

import { DEFAULT_PER_PAGE, paginate, perPageFrom } from "./paginate.ts";

test("teilt den Bestand in Seiten", () => {
  assert.deepEqual(paginate(47, 25, 1), { page: 1, pageCount: 2, offset: 0 });
  assert.deepEqual(paginate(47, 25, 2), { page: 2, pageCount: 2, offset: 25 });
});

test("ohne Wunsch beginnt es bei der ersten Seite", () => {
  assert.deepEqual(paginate(47, 25, undefined), {
    page: 1,
    pageCount: 2,
    offset: 0,
  });
});

test("eine Seite jenseits des Bestands wird auf die letzte gezogen", () => {
  assert.deepEqual(paginate(47, 25, 99), { page: 2, pageCount: 2, offset: 25 });
});

test("Seite null oder negativ gibt es nicht", () => {
  assert.equal(paginate(47, 25, 0).page, 1);
  assert.equal(paginate(47, 25, -5).page, 1);
});

test("ohne einen einzigen Eintrag bleibt es eine Seite", () => {
  assert.deepEqual(paginate(0, 25, 1), { page: 1, pageCount: 1, offset: 0 });
});

test("eine volle Seite ist keine zweite", () => {
  assert.equal(paginate(25, 25, 1).pageCount, 1);
  assert.equal(paginate(26, 25, 1).pageCount, 2);
});

test("nimmt nur Grössen aus der erlaubten Liste", () => {
  assert.equal(perPageFrom("50"), 50);
  assert.equal(perPageFrom(undefined), DEFAULT_PER_PAGE);
  assert.equal(perPageFrom("999999"), DEFAULT_PER_PAGE);
  assert.equal(perPageFrom("alle"), DEFAULT_PER_PAGE);
  assert.equal(perPageFrom("-10"), DEFAULT_PER_PAGE);
});

test("eine Liste darf eine eigene Vorgabe haben", () => {
  assert.equal(perPageFrom(undefined, 10), 10);
  assert.equal(perPageFrom("100", 10), 100);
});
