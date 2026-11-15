import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import { closeDb, getDb, schema } from "../../db/index.ts";
import { seedUser, setupTestDb, truncateAll } from "../../db/testing.ts";
import { DomainError } from "../domainError.ts";
import { createSession, revokeOtherSessions } from "../auth/session.ts";
import { listPasskeys, listSessions } from "../queries/credentials.ts";
import { deleteAccount, removePasskey } from "./credentials.ts";

before(setupTestDb);
beforeEach(truncateAll);
after(closeDb);

async function passkeyFor(userId: string, label: string) {
  const [row] = await getDb()
    .insert(schema.passkeys)
    .values({
      userId,
      credentialId: `${label}-${userId}`,
      publicKey: "x",
      label,
    })
    .returning({ id: schema.passkeys.id });
  return row.id;
}

test("niemand entfernt einen fremden Passkey", async () => {
  const jann = await seedUser({ email: "jann@ouf.local" });
  const noah = await seedUser({ email: "noah@ouf.local" });
  await passkeyFor(jann, "a");
  await passkeyFor(jann, "b");
  const fremd = await passkeyFor(noah, "c");
  await passkeyFor(noah, "d");

  await assert.rejects(removePasskey(jann, fremd), DomainError);
  assert.equal((await listPasskeys(noah)).length, 2);
});

test("der letzte Passkey bleibt", async () => {
  const jann = await seedUser();
  const einziger = await passkeyFor(jann, "a");
  await assert.rejects(removePasskey(jann, einziger), /letzte Passkey/);
});

test("Geräte und Passkeys zeigen nur die eigenen", async () => {
  const jann = await seedUser({ email: "jann@ouf.local" });
  const noah = await seedUser({ email: "noah@ouf.local" });
  await passkeyFor(noah, "n");
  await createSession({ userId: noah });

  assert.deepEqual(await listPasskeys(jann), []);
  assert.deepEqual(await listSessions(jann), []);
});

test("fremde Geräte abmelden trifft nur das eigene Konto", async () => {
  const jann = await seedUser({ email: "jann@ouf.local" });
  const noah = await seedUser({ email: "noah@ouf.local" });
  await createSession({ userId: noah });

  await revokeOtherSessions(jann, "00000000-0000-0000-0000-000000000000");
  assert.equal((await listSessions(noah)).length, 1);
});

test("Konto löschen nimmt alles mit, nur vom eigenen Konto", async () => {
  const jann = await seedUser({ email: "jann@ouf.local" });
  const noah = await seedUser({ email: "noah@ouf.local" });
  await passkeyFor(jann, "a");
  await createSession({ userId: jann });
  await passkeyFor(noah, "n");

  await deleteAccount(jann);

  const users = await getDb()
    .select({ id: schema.users.id })
    .from(schema.users);
  assert.deepEqual(
    users.map((u) => u.id),
    [noah],
  );
  assert.equal((await listPasskeys(noah)).length, 1);
  assert.equal((await getDb().select().from(schema.sessions)).length, 0);
});
