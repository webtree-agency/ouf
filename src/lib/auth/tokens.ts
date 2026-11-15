import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function createToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Die Laufzeit verrät nicht, ab welchem Zeichen sich die Hashes unterscheiden.
export function matchesHash(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}
