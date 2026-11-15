import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createTotpSecret,
  otpauthUri,
  totpCode,
  verifyTotpCode,
} from "./totp.ts";

// RFC 6238, Anhang B: Geheimnis "12345678901234567890" als Base32, SHA-1, 6 Stellen.
const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

test("erzeugt die Beispielcodes aus RFC 6238", () => {
  assert.equal(totpCode(RFC_SECRET, new Date(59 * 1000)), "287082");
  assert.equal(totpCode(RFC_SECRET, new Date(1111111109 * 1000)), "081804");
  assert.equal(totpCode(RFC_SECRET, new Date(1234567890 * 1000)), "005924");
});

test("nimmt den Code des aktuellen Zeitfensters an", () => {
  const now = new Date(1234567890 * 1000);

  assert.equal(
    verifyTotpCode(RFC_SECRET, totpCode(RFC_SECRET, now), now),
    true,
  );
});

test("verzeiht ein Fenster nach vorn und hinten", () => {
  const now = new Date(1234567890 * 1000);
  const davor = new Date(now.getTime() - 30_000);
  const danach = new Date(now.getTime() + 30_000);

  assert.equal(
    verifyTotpCode(RFC_SECRET, totpCode(RFC_SECRET, davor), now),
    true,
  );
  assert.equal(
    verifyTotpCode(RFC_SECRET, totpCode(RFC_SECRET, danach), now),
    true,
  );
});

test("weist ein Fenster weiter entfernte Codes ab", () => {
  const now = new Date(1234567890 * 1000);
  const zuAlt = new Date(now.getTime() - 90_000);

  assert.equal(
    verifyTotpCode(RFC_SECRET, totpCode(RFC_SECRET, zuAlt), now),
    false,
  );
});

test("weist alles ab, was keine sechs Ziffern ist", () => {
  const now = new Date(1234567890 * 1000);

  assert.equal(verifyTotpCode(RFC_SECRET, "", now), false);
  assert.equal(verifyTotpCode(RFC_SECRET, "12345", now), false);
  assert.equal(verifyTotpCode(RFC_SECRET, "abcdef", now), false);
});

test("übersieht Leerzeichen, wie die App sie anzeigt", () => {
  const now = new Date(1234567890 * 1000);

  assert.equal(verifyTotpCode(RFC_SECRET, "005 924", now), true);
});

test("erzeugt ein Base32-Geheimnis, das sich wieder verwenden lässt", () => {
  const secret = createTotpSecret();
  const now = new Date(1234567890 * 1000);

  assert.match(secret, /^[A-Z2-7]{32}$/);
  assert.equal(verifyTotpCode(secret, totpCode(secret, now), now), true);
});

test("baut eine otpauth-Zeile, die Bitwarden einlesen kann", () => {
  const uri = otpauthUri(RFC_SECRET, "jann@webtree.ch");

  assert.ok(uri.startsWith("otpauth://totp/ouf.%3Ajann%40webtree.ch?"));
  assert.match(uri, /secret=GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ/);
  assert.match(uri, /issuer=ouf\./);
  assert.match(uri, /digits=6/);
  assert.match(uri, /period=30/);
});
