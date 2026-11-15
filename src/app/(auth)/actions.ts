"use server";

import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { headers } from "next/headers";
import { z } from "zod";

import { failed, OK, type ActionResult } from "@/lib/actionResult";
import { devLogin as startDevSession } from "@/lib/auth/devLogin";
import {
  loginWithRecoveryCode,
  loginWithTotp,
  type EmergencyFailure,
} from "@/lib/auth/emergencyLogin";
import { allowOptionsFromIp } from "@/lib/auth/lockout";
import {
  finishLogin,
  finishSignup,
  startLogin,
  startSignup,
  type LoginFailure,
} from "@/lib/auth/passkeyFlow";
import { actionContext, setSessionCookie } from "@/lib/auth/serverSession";
import {
  fieldMessages,
  requiredEmailField,
  requiredTextField,
} from "@/lib/validation/fields";

/**
 * Die Türen ohne Sitzung (§8). Sie laufen nicht durch `runAction()`, weil es
 * hier noch keine Sitzung gibt; jede hat ihr Rate-Limit je IP.
 *
 * Gleiche Antwort für alles ausser Sperre und Rate-Limit: kein Fehlversuch
 * verrät, welcher Passkey zu welchem Konto gehört.
 */
const MESSAGES: Record<LoginFailure | EmergencyFailure, string> = {
  "rate-limited": "Zu viele Versuche. In einer Viertelstunde geht es wieder.",
  locked: "Das Konto ist für eine Viertelstunde gesperrt.",
  "challenge-expired": "Der Versuch ist abgelaufen. Bitte neu beginnen.",
  "unknown-passkey": "Anmeldung nicht möglich.",
  "invalid-signature": "Anmeldung nicht möglich.",
  invalid: "Anmeldung nicht möglich.",
  "email-taken": "Für diese Adresse gibt es schon ein Konto.",
};

type Options<T> =
  | { ok: true; options: T }
  | { ok: false; message: string; fields?: Record<string, string> };

export async function passkeyLoginOptions(): Promise<
  Options<PublicKeyCredentialRequestOptionsJSON>
> {
  const { ip } = await actionContext();
  if (!(await allowOptionsFromIp(ip)))
    return { ok: false, message: MESSAGES["rate-limited"] };
  return { ok: true, options: await startLogin() };
}

export async function passkeyLogin(
  response: AuthenticationResponseJSON,
): Promise<ActionResult> {
  const result = await finishLogin({
    response,
    context: await actionContext(),
  });
  if (!result.ok) return failed(MESSAGES[result.reason]);

  await setSessionCookie(result.token);
  return OK;
}

const signupSchema = z.object({
  email: requiredEmailField(),
  name: requiredTextField(80),
});

export async function signupOptions(input: {
  email: string;
  name: string;
}): Promise<Options<PublicKeyCredentialCreationOptionsJSON>> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Bitte die markierten Felder prüfen.",
      fields: fieldMessages(parsed.error),
    };
  }

  const { ip } = await actionContext();
  if (!(await allowOptionsFromIp(ip)))
    return { ok: false, message: MESSAGES["rate-limited"] };

  const started = await startSignup(parsed.data);
  if (!started.ok) {
    return {
      ok: false,
      message: MESSAGES["email-taken"],
      fields: { email: MESSAGES["email-taken"] },
    };
  }
  return { ok: true, options: started.options };
}

export async function signup(
  response: RegistrationResponseJSON,
): Promise<ActionResult> {
  const result = await finishSignup({
    response,
    context: await actionContext(),
  });
  if (!result.ok) return failed(MESSAGES[result.reason]);

  await setSessionCookie(result.token);
  return OK;
}

/** Nur lokal; die Bedingung steht an einer Stelle, in `lib/auth/devLogin.ts`. */
export async function devLogin(): Promise<ActionResult> {
  const host = (await headers()).get("host");
  const result = await startDevSession(host, await actionContext());
  if (!result) return failed("Nicht verfügbar.");

  await setSessionCookie(result.token);
  return OK;
}

export async function emergencyLogin(input: {
  method: "totp" | "recovery-code";
  email: string;
  code: string;
}): Promise<ActionResult> {
  const attempt = {
    email: String(input.email).slice(0, 254),
    code: String(input.code).slice(0, 40),
    context: await actionContext(),
  };
  const result =
    input.method === "totp"
      ? await loginWithTotp(attempt)
      : await loginWithRecoveryCode(attempt);
  if (!result.ok) return failed(MESSAGES[result.reason]);

  await setSessionCookie(result.token);
  return OK;
}
