import { randomInt } from "node:crypto";

import { hashToken } from "./tokens.ts";

export const RECOVERY_CODE_COUNT = 10;

// Ohne 0/O/1/I/L: die Codes werden abgetippt, wenn nichts anderes mehr geht.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const GROUPS = 3;
const GROUP_LENGTH = 4;

export function createRecoveryCodes(): string[] {
  return Array.from({ length: RECOVERY_CODE_COUNT }, createRecoveryCode);
}

export function hashRecoveryCode(code: string): string {
  return hashToken(normaliseRecoveryCode(code));
}

// Kleinschreibung und fehlende Bindestriche sind Tippfehler, kein falscher Code.
export function normaliseRecoveryCode(code: string): string {
  const bare = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return (bare.match(/.{1,4}/g) ?? []).join("-");
}

function createRecoveryCode(): string {
  return Array.from({ length: GROUPS }, () =>
    Array.from(
      { length: GROUP_LENGTH },
      () => ALPHABET[randomInt(ALPHABET.length)],
    ).join(""),
  ).join("-");
}
