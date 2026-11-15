import { eq } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { logger } from "../logger.ts";
import type { Account } from "../queries/accounts.ts";
import { clearFailedAttempts } from "./lockout.ts";
import { createSession } from "./session.ts";

export type LoginContext = {
  ip?: string | null;
  userAgent?: string | null;
};

export type LoginMethod = "passkey" | "totp" | "recovery-code" | "lokal";

export async function completeLogin(
  account: Account,
  method: LoginMethod,
  context: LoginContext,
): Promise<{ token: string; expiresAt: Date }> {
  await clearFailedAttempts(account);
  await getDb()
    .update(schema.users)
    .set({ lastLoginAt: new Date() })
    .where(eq(schema.users.id, account.id));

  const session = await createSession({
    userId: account.id,
    userAgent: context.userAgent,
  });
  logger.info("Anmeldung", { userId: account.id, method });
  return session;
}

/** Kein Name und keine Adresse im Protokoll, nur die Kennung, wenn es eine gibt. */
export function recordFailedLogin(
  account: Account | null,
  method: LoginMethod,
  detail: string,
): void {
  logger.warn("Fehlversuch", { userId: account?.id ?? null, method, detail });
}
