import { and, eq, sql } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { DomainError } from "../domainError.ts";
import { logger } from "../logger.ts";

/**
 * Entfernt einen Passkey des eigenen Kontos. Der letzte bleibt: sonst käme man
 * nur noch über den Notfallweg herein, und der ist vielleicht nie eingerichtet.
 */
export async function removePasskey(
  userId: string,
  passkeyId: string,
): Promise<void> {
  await getDb().transaction(async (tx) => {
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.passkeys)
      .where(eq(schema.passkeys.userId, userId));

    if (count <= 1) {
      throw new DomainError(
        "Der letzte Passkey bleibt, sonst kommst du nicht mehr hinein.",
      );
    }

    const removed = await tx
      .delete(schema.passkeys)
      // Ohne die Kontozeile liesse sich ein fremder Passkey entfernen.
      .where(
        and(
          eq(schema.passkeys.id, passkeyId),
          eq(schema.passkeys.userId, userId),
        ),
      )
      .returning({ id: schema.passkeys.id });

    if (removed.length === 0)
      throw new DomainError("Diesen Passkey gibt es nicht.");
  });
  logger.info("Passkey entfernt", { userId });
}

/** Das Konto samt allem, was daran hängt. Nur mit frischem Faktor (§10). */
export async function deleteAccount(userId: string): Promise<void> {
  await getDb().transaction(async (tx) => {
    // Das Lernprotokoll weist jedes DELETE ab, ausser in dieser Transaktion (§8).
    await tx.execute(sql`set local ouf.konto_loeschen = 'an'`);
    await tx.delete(schema.users).where(eq(schema.users.id, userId));
  });
  logger.info("Konto gelöscht", { userId });
}
