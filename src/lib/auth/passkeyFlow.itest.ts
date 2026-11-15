import assert from "node:assert/strict";
import { after, before, beforeEach, describe, test } from "node:test";

import { eq } from "drizzle-orm";

import { closeDb, getDb, schema } from "../../db/index.ts";
import { setupTestDb, truncateAll } from "../../db/testing.ts";
import { findAccountByEmail } from "../queries/accounts.ts";
import { expectedOrigin, relyingPartyId } from "./passkey.ts";
import {
  finishLogin,
  finishSignup,
  reverifyPasskey,
  startLogin,
  startSignup,
} from "./passkeyFlow.ts";
import { getSessionByToken } from "./session.ts";
import { createFakeAuthenticator, type FakeAuthenticator } from "./testing.ts";

const CONTEXT = { ip: "203.0.113.7", userAgent: "node:test" };

before(setupTestDb);
beforeEach(truncateAll);
after(closeDb);

async function signUp(
  authenticator: FakeAuthenticator,
  email = "jann@ouf.local",
) {
  const started = await startSignup({ email, name: "Jann" });
  assert.ok(started.ok);
  return finishSignup({
    response: authenticator.register({
      challenge: started.options.challenge,
      origin: expectedOrigin(),
      rpId: relyingPartyId(),
    }),
    context: CONTEXT,
  });
}

async function logIn(authenticator: FakeAuthenticator, counter = 1) {
  const options = await startLogin();
  return finishLogin({
    response: authenticator.assert({
      challenge: options.challenge,
      origin: expectedOrigin(),
      rpId: relyingPartyId(),
      counter,
    }),
    context: CONTEXT,
  });
}

describe("Registrieren", () => {
  test("legt Konto und Passkey an und meldet gleich an", async () => {
    const result = await signUp(createFakeAuthenticator());
    assert.ok(result.ok);

    const session = await getSessionByToken(result.token);
    assert.equal(session?.email, "jann@ouf.local");
    assert.equal(session?.name, "Jann");
  });

  test("legt ohne Passkey kein Konto an", async () => {
    const started = await startSignup({
      email: "jann@ouf.local",
      name: "Jann",
    });
    assert.ok(started.ok);
    assert.equal(await findAccountByEmail("jann@ouf.local"), null);
  });

  test("weist eine vergebene Adresse ab", async () => {
    await signUp(createFakeAuthenticator());
    const second = await startSignup({
      email: "jann@ouf.local",
      name: "Jemand",
    });
    assert.deepEqual(second, { ok: false, reason: "email-taken" });
  });

  test("nimmt dieselbe Challenge nur einmal an", async () => {
    const authenticator = createFakeAuthenticator();
    const started = await startSignup({
      email: "jann@ouf.local",
      name: "Jann",
    });
    assert.ok(started.ok);
    const response = authenticator.register({
      challenge: started.options.challenge,
      origin: expectedOrigin(),
      rpId: relyingPartyId(),
    });

    assert.ok((await finishSignup({ response, context: CONTEXT })).ok);
    const again = await finishSignup({ response, context: CONTEXT });
    assert.deepEqual(again, { ok: false, reason: "challenge-expired" });
  });

  test("weist eine Antwort von fremder Herkunft ab", async () => {
    const started = await startSignup({
      email: "jann@ouf.local",
      name: "Jann",
    });
    assert.ok(started.ok);
    const result = await finishSignup({
      response: createFakeAuthenticator().register({
        challenge: started.options.challenge,
        origin: "https://boese.example",
        rpId: relyingPartyId(),
      }),
      context: CONTEXT,
    });
    assert.deepEqual(result, { ok: false, reason: "invalid-signature" });
    assert.equal(await findAccountByEmail("jann@ouf.local"), null);
  });
});

describe("Anmelden", () => {
  test("meldet mit dem eigenen Passkey an und zählt den Zähler hoch", async () => {
    const authenticator = createFakeAuthenticator();
    await signUp(authenticator);

    const result = await logIn(authenticator, 7);
    assert.ok(result.ok);

    const [passkey] = await getDb()
      .select({
        counter: schema.passkeys.counter,
        lastUsedAt: schema.passkeys.lastUsedAt,
      })
      .from(schema.passkeys);
    assert.equal(passkey.counter, 7);
    assert.ok(passkey.lastUsedAt);
  });

  test("kennt einen fremden Passkey nicht", async () => {
    await signUp(createFakeAuthenticator());
    const result = await logIn(createFakeAuthenticator());
    assert.deepEqual(result, { ok: false, reason: "unknown-passkey" });
  });

  test("lässt ein gesperrtes Konto trotz gültigem Passkey nicht hinein", async () => {
    const authenticator = createFakeAuthenticator();
    await signUp(authenticator);
    await getDb()
      .update(schema.users)
      .set({ lockedUntil: new Date(Date.now() + 60_000) })
      .where(eq(schema.users.email, "jann@ouf.local"));

    assert.deepEqual(await logIn(authenticator), {
      ok: false,
      reason: "locked",
    });
  });
});

describe("Erneut bestätigen", () => {
  test("nimmt nur einen Passkey des eigenen Kontos", async () => {
    const jann = createFakeAuthenticator();
    const noah = createFakeAuthenticator();
    const a = await signUp(jann, "jann@ouf.local");
    await signUp(noah, "noah@ouf.local");
    assert.ok(a.ok);
    const userId = (await getSessionByToken(a.token))!.userId;

    const options = await startLogin();
    const fremd = noah.assert({
      challenge: options.challenge,
      origin: expectedOrigin(),
      rpId: relyingPartyId(),
    });
    assert.equal(await reverifyPasskey({ userId, response: fremd }), false);

    const eigene = await startLogin();
    const eigen = jann.assert({
      challenge: eigene.challenge,
      origin: expectedOrigin(),
      rpId: relyingPartyId(),
    });
    assert.equal(await reverifyPasskey({ userId, response: eigen }), true);
  });
});
