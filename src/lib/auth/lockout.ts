import { eq } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { logger } from "../logger.ts";
import type { Account } from "../queries/accounts.ts";
import { ipBucket } from "./ipHash.ts";
import { consumeRateLimit, resetRateLimit } from "./rateLimit.ts";

const MINUTE = 60 * 1000;
const WINDOW_MS = 15 * MINUTE;

/** Grosszügig: hinter einer Adresse sitzen oft mehrere Leute. */
const ATTEMPTS_PER_IP = 30;
/** Streng: ein Konto, das fünfmal scheitert, wird gerade angegriffen. */
export const ATTEMPTS_PER_ACCOUNT = 5;
const LOCK_DURATION_MS = 15 * MINUTE;

export function isLocked(account: Account, now = new Date()): boolean {
  return account.lockedUntil !== null && account.lockedUntil > now;
}

/** Greift, bevor ein Konto bekannt ist: der Passkey nennt es erst danach. */
export async function allowAttemptFromIp(
  ip: string | null | undefined,
): Promise<boolean> {
  const result = await consumeRateLimit({
    key: `login:ip:${ipBucket(ip)}`,
    limit: ATTEMPTS_PER_IP,
    windowMs: WINDOW_MS,
  });
  return result.allowed;
}

/**
 * Schon das Abholen der Optionen schreibt eine Zeile, unangemeldet. Ein eigener
 * Topf, damit die Anmeldung selbst nicht mitzählt.
 */
export async function allowOptionsFromIp(
  ip: string | null | undefined,
): Promise<boolean> {
  const result = await consumeRateLimit({
    key: `login-options:ip:${ipBucket(ip)}`,
    limit: 2 * ATTEMPTS_PER_IP,
    windowMs: WINDOW_MS,
  });
  return result.allowed;
}

export async function registerFailedAttempt(
  account: Account,
  now = new Date(),
): Promise<{ locked: boolean }> {
  const result = await consumeRateLimit({
    key: accountKey(account.id),
    limit: ATTEMPTS_PER_ACCOUNT,
    windowMs: WINDOW_MS,
    now,
  });

  // Auf den Zähler, nicht auf `allowed`: der fünfte Fehlversuch sperrt.
  if (result.count < ATTEMPTS_PER_ACCOUNT) return { locked: false };

  const lockedUntil = new Date(now.getTime() + LOCK_DURATION_MS);
  await getDb()
    .update(schema.users)
    .set({ lockedUntil })
    .where(eq(schema.users.id, account.id));

  logger.warn("Konto gesperrt", { userId: account.id, lockedUntil });
  return { locked: true };
}

export async function clearFailedAttempts(account: Account): Promise<void> {
  await resetRateLimit(accountKey(account.id));
  if (account.lockedUntil) {
    await getDb()
      .update(schema.users)
      .set({ lockedUntil: null })
      .where(eq(schema.users.id, account.id));
  }
}

function accountKey(accountId: string): string {
  return `login:account:${accountId}`;
}
