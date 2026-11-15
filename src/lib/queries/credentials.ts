import { and, desc, eq, isNull } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import type { StoredPasskey } from "../auth/passkey.ts";
import type { Account } from "./accounts.ts";

/** Womit sich jemand ausweist und von wo: Passkeys, Geräte, Notfallweg. */
export type PasskeyEntry = StoredPasskey & {
  id: string;
  label: string | null;
  createdAt: Date;
  lastUsedAt: Date | null;
};

export async function listPasskeys(userId: string): Promise<PasskeyEntry[]> {
  return getDb()
    .select({
      id: schema.passkeys.id,
      credentialId: schema.passkeys.credentialId,
      publicKey: schema.passkeys.publicKey,
      counter: schema.passkeys.counter,
      transports: schema.passkeys.transports,
      label: schema.passkeys.label,
      createdAt: schema.passkeys.createdAt,
      lastUsedAt: schema.passkeys.lastUsedAt,
    })
    .from(schema.passkeys)
    .where(eq(schema.passkeys.userId, userId))
    .orderBy(desc(schema.passkeys.createdAt), desc(schema.passkeys.id));
}

/** Beim auffindbaren Passkey nennt erst die Antwort das Konto. */
export async function findPasskeyWithAccount(credentialId: string): Promise<{
  passkey: StoredPasskey & { id: string };
  account: Account;
} | null> {
  const [row] = await getDb()
    .select({
      passkeyId: schema.passkeys.id,
      credentialId: schema.passkeys.credentialId,
      publicKey: schema.passkeys.publicKey,
      counter: schema.passkeys.counter,
      transports: schema.passkeys.transports,
      accountId: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      lockedUntil: schema.users.lockedUntil,
    })
    .from(schema.passkeys)
    .innerJoin(schema.users, eq(schema.passkeys.userId, schema.users.id))
    .where(eq(schema.passkeys.credentialId, credentialId))
    .limit(1);

  if (!row) return null;
  return {
    passkey: {
      id: row.passkeyId,
      credentialId: row.credentialId,
      publicKey: row.publicKey,
      counter: row.counter,
      transports: row.transports,
    },
    account: {
      id: row.accountId,
      email: row.email,
      name: row.name,
      lockedUntil: row.lockedUntil,
    },
  };
}

export type DeviceEntry = {
  id: string;
  userAgent: string | null;
  createdAt: Date;
  lastSeenAt: Date;
};

export async function listSessions(userId: string): Promise<DeviceEntry[]> {
  return getDb()
    .select({
      id: schema.sessions.id,
      userAgent: schema.sessions.userAgent,
      createdAt: schema.sessions.createdAt,
      lastSeenAt: schema.sessions.lastSeenAt,
    })
    .from(schema.sessions)
    .where(eq(schema.sessions.userId, userId))
    .orderBy(desc(schema.sessions.lastSeenAt), desc(schema.sessions.id));
}

export async function countUnusedRecoveryCodes(
  userId: string,
): Promise<number> {
  const rows = await getDb()
    .select({ id: schema.recoveryCodes.id })
    .from(schema.recoveryCodes)
    .where(
      and(
        eq(schema.recoveryCodes.userId, userId),
        isNull(schema.recoveryCodes.usedAt),
      ),
    );
  return rows.length;
}
