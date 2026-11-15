import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DRAFT_MAX_AGE_MS,
  draftStorageKey,
  parseDraft,
  sameValues,
  serializeDraft,
} from "./draft.ts";

const NOW = 1_757_000_000_000;

test("liest zurück, was geschrieben wurde", () => {
  const raw = serializeDraft({ subject: "Rate 1" }, NOW);
  assert.deepEqual(parseDraft<{ subject: string }>(raw, NOW), {
    savedAt: NOW,
    values: { subject: "Rate 1" },
  });
});

test("nimmt einen Stand bis zur Altersgrenze und danach keinen mehr", () => {
  const raw = serializeDraft({ subject: "Rate 1" }, NOW);
  assert.ok(parseDraft(raw, NOW + DRAFT_MAX_AGE_MS));
  assert.equal(parseDraft(raw, NOW + DRAFT_MAX_AGE_MS + 1), null);
});

test("verwirft, was nicht die erwartete Form hat", () => {
  assert.equal(parseDraft(null, NOW), null);
  assert.equal(parseDraft("kein json", NOW), null);
  assert.equal(parseDraft("[]", NOW), null);
  assert.equal(parseDraft(JSON.stringify({ values: {} }), NOW), null);
  assert.equal(
    parseDraft(JSON.stringify({ savedAt: "gestern", values: {} }), NOW),
    null,
  );
  assert.equal(parseDraft(JSON.stringify({ savedAt: NOW }), NOW), null);
});

test("erkennt den Stand des Servers wieder", () => {
  assert.ok(
    sameValues({ a: 1, lines: [{ n: "" }] }, { a: 1, lines: [{ n: "" }] }),
  );
  assert.ok(!sameValues({ a: 1 }, { a: 2 }));
});

test("hält die Entwürfe unter einem Präfix beisammen", () => {
  assert.equal(draftStorageKey("rechnung:neu"), "entwurf:rechnung:neu");
});
