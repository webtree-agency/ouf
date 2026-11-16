import assert from "node:assert/strict";
import { test } from "node:test";

import { clientIp } from "./clientIp.ts";

test("nimmt die erste Adresse aus x-forwarded-for", () => {
  const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
  assert.equal(clientIp(headers), "203.0.113.7");
});

test("glaubt hinter Cloudflare der Adresse von Cloudflare", () => {
  const headers = new Headers({
    "cf-connecting-ip": "198.51.100.4",
    "x-forwarded-for": "203.0.113.7, 198.51.100.4",
  });
  assert.equal(clientIp(headers), "198.51.100.4");
});

test("gibt ohne Kopfzeile null", () => {
  assert.equal(clientIp(new Headers()), null);
});
