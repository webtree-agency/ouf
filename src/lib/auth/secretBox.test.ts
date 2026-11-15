import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import { decryptSecret, encryptSecret } from "./secretBox.ts";

const KEY = "ein-hinreichend-langer-testschluessel";

beforeEach(() => {
  process.env.TOTP_ENCRYPTION_KEY = KEY;
});

afterEach(() => {
  delete process.env.TOTP_ENCRYPTION_KEY;
});

test("liest zurück, was verschlüsselt wurde", () => {
  const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

  assert.equal(decryptSecret(encryptSecret(secret)), secret);
});

test("erzeugt bei gleichem Klartext zwei verschiedene Kryptogramme", () => {
  assert.notEqual(encryptSecret("geheim"), encryptSecret("geheim"));
});

test("merkt, wenn am Kryptogramm gedreht wurde", () => {
  const [iv, tag] = encryptSecret("geheim").split(".");
  const verdreht = [iv, tag, Buffer.from("anders").toString("base64url")].join(
    ".",
  );

  assert.throws(() => decryptSecret(verdreht));
});

test("verweigert die Arbeit ohne hinreichend langen Schlüssel", () => {
  process.env.TOTP_ENCRYPTION_KEY = "zu-kurz";

  assert.throws(() => encryptSecret("geheim"), /TOTP_ENCRYPTION_KEY/);
});

test("weist ein unvollständiges Kryptogramm ab", () => {
  assert.throws(() => decryptSecret("nur-ein-teil"), /unvollständig/);
});
