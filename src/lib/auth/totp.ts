import { createHmac, randomBytes } from "node:crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const DIGITS = 6;
const PERIOD_SECONDS = 30;
// Ein Schritt Toleranz nach beiden Seiten — Uhren gehen auseinander, Menschen tippen langsam.
const TOLERANCE_STEPS = 1;

export function createTotpSecret(): string {
  return toBase32(randomBytes(20));
}

// Die Zeile, aus der der QR-Code entsteht; eine Code-App nimmt sie auch direkt.
export function otpauthUri(secret: string, email: string): string {
  const label = encodeURIComponent(`ouf.:${email}`);
  const params = new URLSearchParams({
    secret,
    issuer: "ouf.",
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(PERIOD_SECONDS),
  });
  return `otpauth://totp/${label}?${params}`;
}

export function totpCode(secret: string, at: Date): string {
  return hotp(
    fromBase32(secret),
    Math.floor(at.getTime() / 1000 / PERIOD_SECONDS),
  );
}

export function verifyTotpCode(
  secret: string,
  code: string,
  at: Date,
): boolean {
  return matchingTotpStep(secret, code, at) !== null;
}

/** Der Zeitschritt, zu dem der Code passt, damit er sich nur einmal verwenden lässt. */
export function matchingTotpStep(
  secret: string,
  code: string,
  at: Date,
): number | null {
  const given = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(given)) return null;

  const key = fromBase32(secret);
  const step = Math.floor(at.getTime() / 1000 / PERIOD_SECONDS);

  for (let offset = -TOLERANCE_STEPS; offset <= TOLERANCE_STEPS; offset += 1) {
    if (constantTimeEquals(hotp(key, step + offset), given))
      return step + offset;
  }
  return null;
}

/** So lange nimmt `verifyTotpCode` einen Schritt an. */
export const TOTP_ACCEPT_MS = (2 * TOLERANCE_STEPS + 1) * PERIOD_SECONDS * 1000;

// RFC 4226: HMAC-SHA1 über den Zähler, daraus vier Bytes ab dynamischem Versatz.
function hotp(key: Buffer, counter: number): string {
  const block = Buffer.alloc(8);
  block.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", key).update(block).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const value =
    ((digest[offset] & 0x7f) << 24) |
    (digest[offset + 1] << 16) |
    (digest[offset + 2] << 8) |
    digest[offset + 3];

  return String(value % 10 ** DIGITS).padStart(DIGITS, "0");
}

function toBase32(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32[(value << (5 - bits)) & 31];
  return output;
}

function fromBase32(secret: string): Buffer {
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const character of secret.replace(/=+$/, "").toUpperCase()) {
    const index = BASE32.indexOf(character);
    if (index === -1) throw new Error("Kein gültiges Base32-Geheimnis");

    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}
