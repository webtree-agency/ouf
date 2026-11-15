import assert from "node:assert/strict";
import { test } from "node:test";

import { createToken, hashToken, matchesHash } from "./tokens.ts";

test("erzeugt jedes Mal ein anderes Merkmal mit 32 Byte Zufall", () => {
  const first = createToken();

  assert.match(first, /^[0-9a-f]{64}$/);
  assert.notEqual(first, createToken());
});

test("hasht wiederholbar und ohne Klartext", () => {
  const hash = hashToken("geheim");

  assert.equal(hash, hashToken("geheim"));
  assert.notEqual(hash, hashToken("geheim2"));
  assert.match(hash, /^[0-9a-f]{64}$/);
});

test("vergleicht Hashes und weist ungleiche Längen ab", () => {
  const hash = hashToken("geheim");

  assert.equal(matchesHash(hash, hashToken("geheim")), true);
  assert.equal(matchesHash(hash, hashToken("anderes")), false);
  assert.equal(matchesHash(hash, "ab"), false);
});
