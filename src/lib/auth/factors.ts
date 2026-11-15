import { eq } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { logger } from "../logger.ts";
import type { Account } from "../queries/accounts.ts";
import { createRecoveryCodes, hashRecoveryCode } from "./recoveryCodes.ts";
import { decryptSecret, encryptSecret } from "./secretBox.ts";
import { createTotpSecret, otpauthUri, verifyTotpCode } from "./totp.ts";

export type TotpSetup = { secret: string; uri: string };

// Unbestätigt: erst ein gültiger Code macht es gültig, sonst sperrt sich aus, wer sich vertippt.
export async function startTotpSetup(account: Account): Promise<TotpSetup> {
  const secret = createTotpSecret();

  await getDb()
    .insert(schema.totpSecrets)
    .values({ userId: account.id, secretEncrypted: encryptSecret(secret) })
    .onConflictDoUpdate({
      target: schema.totpSecrets.userId,
      set: { secretEncrypted: encryptSecret(secret), confirmedAt: null },
    });

  return { secret, uri: otpauthUri(secret, account.email) };
}

export async function confirmTotpSetup(
  account: Account,
  code: string,
): Promise<boolean> {
  const secret = await loadTotpSecret(account.id);
  if (!secret || !verifyTotpCode(secret.value, code, new Date())) return false;

  await getDb()
    .update(schema.totpSecrets)
    .set({ confirmedAt: new Date() })
    .where(eq(schema.totpSecrets.userId, account.id));
  return true;
}

export async function hasConfirmedTotp(userId: string): Promise<boolean> {
  const secret = await loadTotpSecret(userId);
  return Boolean(secret?.confirmedAt);
}

export async function removeTotp(userId: string): Promise<void> {
  await getDb()
    .delete(schema.totpSecrets)
    .where(eq(schema.totpSecrets.userId, userId));
}

/**
 * Ein unlesbares Geheimnis ist kein Absturz, sondern ein fehlendes: Passt
 * `TOTP_ENCRYPTION_KEY` nicht mehr, scheitert die Anmeldung wie mit einem
 * falschen Code, statt mit einer Fehlerseite.
 */
export async function loadTotpSecret(
  userId: string,
): Promise<{ value: string; confirmedAt: Date | null } | null> {
  const [row] = await getDb()
    .select({
      secretEncrypted: schema.totpSecrets.secretEncrypted,
      confirmedAt: schema.totpSecrets.confirmedAt,
    })
    .from(schema.totpSecrets)
    .where(eq(schema.totpSecrets.userId, userId))
    .limit(1);

  if (!row) return null;
  try {
    return {
      value: decryptSecret(row.secretEncrypted),
      confirmedAt: row.confirmedAt,
    };
  } catch (error) {
    logger.error("TOTP-Geheimnis nicht entschlüsselbar", { userId, error });
    return null;
  }
}

// Die Rückgabe ist das einzige Mal, dass die Codes lesbar sind.
export async function issueRecoveryCodes(account: Account): Promise<string[]> {
  const codes = createRecoveryCodes();

  await getDb().transaction(async (tx) => {
    await tx
      .delete(schema.recoveryCodes)
      .where(eq(schema.recoveryCodes.userId, account.id));
    await tx.insert(schema.recoveryCodes).values(
      codes.map((code) => ({
        userId: account.id,
        codeHash: hashRecoveryCode(code),
      })),
    );
  });

  return codes;
}
