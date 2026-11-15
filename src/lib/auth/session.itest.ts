import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import { closeDb, getDb, schema } from "../../db/index.ts";
import { seedUser, setupTestDb, truncateAll } from "../../db/testing.ts";
import {
  ABSOLUTE_LIFETIME_MS,
  createSession,
  getSessionByToken,
  IDLE_LIFETIME_MS,
  revokeOtherSessions,
} from "./session.ts";

before(setupTestDb);
beforeEach(truncateAll);
after(closeDb);

const DAY = 24 * 60 * 60 * 1000;
const start = new Date("2026-11-15T10:00:00Z");

test("gleitet mit jeder Nutzung weiter", async () => {
  const userId = await seedUser();
  const { token } = await createSession({ userId, now: start });

  const later = new Date(start.getTime() + 80 * DAY);
  const session = await getSessionByToken(token, later);
  assert.equal(
    session?.expiresAt.getTime(),
    later.getTime() + IDLE_LIFETIME_MS,
  );
});

test("endet nach der Ruhefrist", async () => {
  const userId = await seedUser();
  const { token } = await createSession({ userId, now: start });
  const zuSpaet = new Date(start.getTime() + IDLE_LIFETIME_MS + 1000);
  assert.equal(await getSessionByToken(token, zuSpaet), null);
});

test("gleitet nie über die harte Grenze hinaus", async () => {
  const userId = await seedUser();
  const { token } = await createSession({ userId, now: start });
  let now = start;
  while (now.getTime() < start.getTime() + ABSOLUTE_LIFETIME_MS - 60 * DAY) {
    now = new Date(now.getTime() + 60 * DAY);
    assert.ok(await getSessionByToken(token, now));
  }
  const danach = new Date(start.getTime() + ABSOLUTE_LIFETIME_MS + 1000);
  assert.equal(await getSessionByToken(token, danach), null);
});

test("meldet die anderen Geräte ab und behält das eigene", async () => {
  const userId = await seedUser();
  const eigenes = await createSession({ userId });
  const anderes = await createSession({ userId });
  const eigeneSitzung = (await getSessionByToken(eigenes.token))!;

  await revokeOtherSessions(userId, eigeneSitzung.sessionId);

  assert.ok(await getSessionByToken(eigenes.token));
  assert.equal(await getSessionByToken(anderes.token), null);
  assert.equal((await getDb().select().from(schema.sessions)).length, 1);
});
