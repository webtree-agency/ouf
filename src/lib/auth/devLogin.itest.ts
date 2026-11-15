import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, test } from "node:test";

import { closeDb } from "../../db/index.ts";
import { seedUser, setupTestDb, truncateAll } from "../../db/testing.ts";
import { devLogin } from "./devLogin.ts";
import { getSessionByToken } from "./session.ts";

const env = process.env as Record<string, string | undefined>;
const CONTEXT = { ip: null, userAgent: "node:test" };

before(setupTestDb);
beforeEach(truncateAll);
afterEach(() => {
  delete env.DEV_LOGIN_EMAIL;
  env.NODE_ENV = "test";
});
after(closeDb);

test("legt lokal eine Sitzung für das Konto aus der Variable an", async () => {
  await seedUser({ email: "jann@ouf.local" });
  env.DEV_LOGIN_EMAIL = "jann@ouf.local";

  const result = await devLogin("localhost:3400", CONTEXT);
  assert.ok(result);
  assert.equal(
    (await getSessionByToken(result.token))?.email,
    "jann@ouf.local",
  );
});

test("gegen einen fremden Namen legt er nichts an", async () => {
  await seedUser({ email: "jann@ouf.local" });
  env.DEV_LOGIN_EMAIL = "jann@ouf.local";
  assert.equal(await devLogin("ouf.example", CONTEXT), null);
});

test("ohne Variable legt er nichts an", async () => {
  await seedUser({ email: "jann@ouf.local" });
  assert.equal(await devLogin("localhost:3400", CONTEXT), null);
});

test("im Produktivmodus legt er nichts an", async () => {
  await seedUser({ email: "jann@ouf.local" });
  env.DEV_LOGIN_EMAIL = "jann@ouf.local";
  env.NODE_ENV = "production";
  assert.equal(await devLogin("localhost:3400", CONTEXT), null);
});

test("ohne Konto legt er nichts an", async () => {
  env.DEV_LOGIN_EMAIL = "niemand@ouf.local";
  assert.equal(await devLogin("localhost:3400", CONTEXT), null);
});
