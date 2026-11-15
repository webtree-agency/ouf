import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import { closeDb } from "../../db/index.ts";
import { seedUser, setupTestDb, truncateAll } from "../../db/testing.ts";
import { findAccountById } from "../queries/accounts.ts";
import { loginWithRecoveryCode, loginWithTotp } from "./emergencyLogin.ts";
import {
  confirmTotpSetup,
  issueRecoveryCodes,
  startTotpSetup,
} from "./factors.ts";
import { ATTEMPTS_PER_ACCOUNT } from "./lockout.ts";
import { totpCode } from "./totp.ts";

const CONTEXT = { ip: "203.0.113.7", userAgent: "node:test" };

before(setupTestDb);
beforeEach(truncateAll);
after(closeDb);

async function accountWithTotp() {
  const account = (await findAccountById(await seedUser()))!;
  const { secret } = await startTotpSetup(account);
  assert.ok(await confirmTotpSetup(account, totpCode(secret, new Date())));
  return { account, secret };
}

test("meldet mit dem Code aus der App an, aber nur einmal je Code", async () => {
  const { secret } = await accountWithTotp();
  const code = totpCode(secret, new Date());
  const input = { email: "jann@ouf.local", code, context: CONTEXT };

  assert.equal((await loginWithTotp(input)).ok, true);
  assert.deepEqual(await loginWithTotp(input), {
    ok: false,
    reason: "invalid",
  });
});

test("ein unbestätigtes Einrichten zählt nicht", async () => {
  const account = (await findAccountById(await seedUser()))!;
  const { secret } = await startTotpSetup(account);
  const result = await loginWithTotp({
    email: "jann@ouf.local",
    code: totpCode(secret, new Date()),
    context: CONTEXT,
  });
  assert.deepEqual(result, { ok: false, reason: "invalid" });
});

test("ein Ersatzcode gilt einmal, auch klein und ohne Striche getippt", async () => {
  const account = (await findAccountById(await seedUser()))!;
  const [code] = await issueRecoveryCodes(account);
  const getippt = code.replace(/-/g, "").toLowerCase();
  const input = { email: "jann@ouf.local", code: getippt, context: CONTEXT };

  assert.equal((await loginWithRecoveryCode(input)).ok, true);
  assert.deepEqual(await loginWithRecoveryCode(input), {
    ok: false,
    reason: "invalid",
  });
});

test("unbekannte Adresse und falscher Code antworten gleich", async () => {
  await accountWithTotp();
  const unbekannt = await loginWithTotp({
    email: "niemand@ouf.local",
    code: "123456",
    context: CONTEXT,
  });
  const falsch = await loginWithTotp({
    email: "jann@ouf.local",
    code: "000000",
    context: CONTEXT,
  });
  assert.deepEqual(unbekannt, falsch);
});

test(`sperrt nach ${ATTEMPTS_PER_ACCOUNT} Fehlversuchen, auch für den richtigen Code`, async () => {
  const { secret } = await accountWithTotp();
  const results = [];
  for (let i = 0; i < ATTEMPTS_PER_ACCOUNT; i += 1) {
    results.push(
      await loginWithTotp({
        email: "jann@ouf.local",
        code: "000000",
        context: CONTEXT,
      }),
    );
  }
  assert.deepEqual(results.at(-1), { ok: false, reason: "locked" });

  const richtig = await loginWithTotp({
    email: "jann@ouf.local",
    code: totpCode(secret, new Date()),
    context: CONTEXT,
  });
  assert.deepEqual(richtig, { ok: false, reason: "locked" });
});
