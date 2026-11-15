import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";

import { getDb, schema } from "../../db/index.ts";
import { logger } from "../logger.ts";
import { findAccountByEmail, type Account } from "../queries/accounts.ts";
import {
  findPasskeyWithAccount,
  listPasskeys,
} from "../queries/credentials.ts";
import { consumeChallenge, storeChallenge } from "./challenges.ts";
import { describeDevice } from "./deviceLabel.ts";
import {
  completeLogin,
  recordFailedLogin,
  type LoginContext,
} from "./completeLogin.ts";
import {
  allowAttemptFromIp,
  isLocked,
  registerFailedAttempt,
} from "./lockout.ts";
import {
  challengeFrom,
  loginOptions,
  registrationOptions,
  verifyLogin,
  verifyRegistration,
} from "./passkey.ts";

export type LoginFailure =
  | "rate-limited"
  | "challenge-expired"
  | "unknown-passkey"
  | "invalid-signature"
  | "locked"
  | "email-taken";

export type LoginResult =
  | { ok: true; token: string; expiresAt: Date }
  | { ok: false; reason: LoginFailure };

/**
 * **Registrieren: E-Mail und Name, Passkey, drin.** Das Konto entsteht erst,
 * wenn der Passkey liegt; bis dahin stehen Adresse und Name nur an der
 * Challenge. Wer abbricht, hinterlässt also kein halbes Konto.
 */
export async function startSignup(input: {
  email: string;
  name: string;
}): Promise<
  | { ok: true; options: PublicKeyCredentialCreationOptionsJSON }
  | { ok: false; reason: "email-taken" }
> {
  if (await findAccountByEmail(input.email)) {
    return { ok: false, reason: "email-taken" };
  }

  const signup = { userId: randomUUID(), email: input.email, name: input.name };
  const options = await registrationOptions({ ...signup, existing: [] });
  await storeChallenge({
    purpose: "signup",
    challenge: options.challenge,
    signup,
  });
  return { ok: true, options };
}

export async function finishSignup(input: {
  response: RegistrationResponseJSON;
  context: LoginContext;
}): Promise<LoginResult> {
  if (!(await allowAttemptFromIp(input.context.ip))) {
    return { ok: false, reason: "rate-limited" };
  }

  const challenge = challengeFrom(input.response);
  const issued = await consumeChallenge({ purpose: "signup", challenge });
  if (!issued?.signup) return { ok: false, reason: "challenge-expired" };

  const passkey = await verifyRegistration({
    response: input.response,
    expectedChallenge: challenge,
  });
  if (!passkey) return { ok: false, reason: "invalid-signature" };

  const { signup } = issued;
  const created = await getDb().transaction(async (tx) => {
    const [user] = await tx
      .insert(schema.users)
      .values({ id: signup.userId, email: signup.email, name: signup.name })
      .onConflictDoNothing()
      .returning({ id: schema.users.id });
    // Dieselbe Adresse kann in der Zwischenzeit ein zweites Mal angemeldet worden sein.
    if (!user) return false;

    await tx.insert(schema.passkeys).values({
      userId: user.id,
      ...passkey,
      label: describeDevice(input.context.userAgent ?? null),
    });
    return true;
  });
  if (!created) return { ok: false, reason: "email-taken" };

  logger.info("Konto angelegt", { userId: signup.userId });
  const account: Account = { ...signup, id: signup.userId, lockedUntil: null };
  return {
    ok: true,
    ...(await completeLogin(account, "passkey", input.context)),
  };
}

/** Ein weiterer Passkey für ein bestehendes Konto. */
export async function startRegistration(
  account: Account,
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const options = await registrationOptions({
    userId: account.id,
    email: account.email,
    name: account.name,
    existing: await listPasskeys(account.id),
  });
  await storeChallenge({
    purpose: "register",
    challenge: options.challenge,
    userId: account.id,
  });
  return options;
}

export async function finishRegistration(input: {
  account: Account;
  response: RegistrationResponseJSON;
  label: string | null;
}): Promise<boolean> {
  const challenge = challengeFrom(input.response);
  const issued = await consumeChallenge({ purpose: "register", challenge });
  if (!issued || issued.userId !== input.account.id) return false;

  const passkey = await verifyRegistration({
    response: input.response,
    expectedChallenge: challenge,
  });
  if (!passkey) return false;

  await getDb()
    .insert(schema.passkeys)
    .values({ userId: input.account.id, ...passkey, label: input.label });
  return true;
}

export async function startLogin(): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const options = await loginOptions();
  await storeChallenge({ purpose: "login", challenge: options.challenge });
  return options;
}

/**
 * Die Signatur wird vor allen Konto-Prüfungen bewertet: Erst wer den Schlüssel
 * hat, erfährt etwas über den Zustand des Kontos.
 */
export async function finishLogin(input: {
  response: AuthenticationResponseJSON;
  context: LoginContext;
}): Promise<LoginResult> {
  if (!(await allowAttemptFromIp(input.context.ip))) {
    return { ok: false, reason: "rate-limited" };
  }

  const challenge = challengeFrom(input.response);
  if (!(await consumeChallenge({ purpose: "login", challenge }))) {
    return { ok: false, reason: "challenge-expired" };
  }

  const found = await findPasskeyWithAccount(input.response.id);
  if (!found) {
    recordFailedLogin(null, "passkey", "Passkey unbekannt");
    return { ok: false, reason: "unknown-passkey" };
  }

  const { account, passkey } = found;
  const verified = await verifyLogin({
    response: input.response,
    expectedChallenge: challenge,
    passkey,
  });
  if (!verified) {
    await registerFailedAttempt(account);
    recordFailedLogin(account, "passkey", "Signatur ungültig");
    return { ok: false, reason: "invalid-signature" };
  }
  if (isLocked(account)) return { ok: false, reason: "locked" };

  await getDb()
    .update(schema.passkeys)
    .set({ counter: verified.newCounter, lastUsedAt: new Date() })
    .where(eq(schema.passkeys.id, passkey.id));

  return {
    ok: true,
    ...(await completeLogin(account, "passkey", input.context)),
  };
}

/**
 * Erneute Bestätigung vor einer sensiblen Aktion. Dieselbe Prüfung wie beim
 * Anmelden, ohne neue Sitzung; der Passkey muss zum angemeldeten Konto gehören.
 */
export async function reverifyPasskey(input: {
  userId: string;
  response: AuthenticationResponseJSON;
}): Promise<boolean> {
  const challenge = challengeFrom(input.response);
  if (!(await consumeChallenge({ purpose: "login", challenge }))) return false;

  const found = await findPasskeyWithAccount(input.response.id);
  if (!found || found.account.id !== input.userId) return false;

  const verified = await verifyLogin({
    response: input.response,
    expectedChallenge: challenge,
    passkey: found.passkey,
  });
  if (!verified) return false;

  await getDb()
    .update(schema.passkeys)
    .set({ counter: verified.newCounter, lastUsedAt: new Date() })
    .where(eq(schema.passkeys.id, found.passkey.id));
  return true;
}
