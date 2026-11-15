"use server";

import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { headers } from "next/headers";
import { z } from "zod";

import {
  failed,
  OK,
  type ActionFailure,
  type ActionResult,
} from "@/lib/actionResult";
import {
  deleteAccount,
  removePasskey as removeOwnPasskey,
} from "@/lib/account/credentials";
import { runAction } from "@/lib/actions/run";
import { devLoginEmail } from "@/lib/auth/devLogin";
import { DomainError } from "@/lib/domainError";
import {
  confirmTotpSetup,
  issueRecoveryCodes,
  removeTotp,
  startTotpSetup,
} from "@/lib/auth/factors";
import {
  finishRegistration,
  reverifyPasskey,
  startLogin,
  startRegistration,
} from "@/lib/auth/passkeyFlow";
import {
  clearSessionCookie,
  currentSession,
  freshSessionOrFailure,
  requireSession,
} from "@/lib/auth/serverSession";
import {
  markFactorVerified,
  revokeOtherSessions,
  revokeSession,
} from "@/lib/auth/session";
import { qrDataUri } from "@/lib/qr";
import { findAccountById, updateAccountName } from "@/lib/queries/accounts";
import { requiredTextField, textField } from "@/lib/validation/fields";

const PAGE = "/konto";

async function account(userId: string) {
  const found = await findAccountById(userId);
  if (!found) throw new DomainError("Dieses Konto gibt es nicht mehr.");
  return found;
}

export async function signOut(): Promise<void> {
  const session = await currentSession();
  if (session) await revokeSession(session.sessionId);
  await clearSessionCookie();
}

export async function renameAccount(name: string): Promise<ActionResult> {
  const parsed = requiredTextField(80).safeParse(name);
  if (!parsed.success)
    return failed(parsed.error.issues[0].message, {
      name: parsed.error.issues[0].message,
    });
  return runAction({ revalidate: ["/"] }, (actor) =>
    updateAccountName(actor.id, parsed.data),
  );
}

/**
 * Ein weiterer Passkey verlangt einen frischen Faktor, wie das Entfernen: Sonst
 * macht sich eine übernommene Sitzung einen eigenen Schlüssel und bleibt drin.
 */
export async function addPasskeyOptions(): Promise<
  { ok: true; options: PublicKeyCredentialCreationOptionsJSON } | ActionFailure
> {
  const gate = await freshSessionOrFailure();
  if (!gate.ok) return gate.result;
  return {
    ok: true,
    options: await startRegistration(await account(gate.session.userId)),
  };
}

const labelSchema = textField(60);

export async function addPasskey(input: {
  label: string;
  response: RegistrationResponseJSON;
}): Promise<ActionResult> {
  const label = labelSchema.safeParse(input.label);
  if (!label.success) return failed(label.error.issues[0].message);

  return runAction({ fresh: true, revalidate: [PAGE] }, async (actor) => {
    const ok = await finishRegistration({
      account: await account(actor.id),
      response: input.response,
      label: label.data,
    });
    if (!ok)
      throw new DomainError("Der Passkey konnte nicht hinterlegt werden.");
  });
}

export async function removePasskey(passkeyId: string): Promise<ActionResult> {
  return runAction({ fresh: true, revalidate: [PAGE] }, (actor) =>
    removeOwnPasskey(actor.id, z.uuid().parse(passkeyId)),
  );
}

export async function reconfirmOptions(): Promise<PublicKeyCredentialRequestOptionsJSON> {
  await requireSession();
  return startLogin();
}

export async function reconfirm(
  response: AuthenticationResponseJSON,
): Promise<ActionResult> {
  const session = await requireSession();
  if (!(await reverifyPasskey({ userId: session.userId, response }))) {
    return failed("Die Bestätigung hat nicht geklappt.");
  }
  await markFactorVerified(session.sessionId);
  return OK;
}

/**
 * Lokal gibt es keinen Passkey; dort bestätigt der Server selbst, unter den
 * drei Bedingungen des Kurzwegs (§8). In der Produktion scheitert es immer.
 */
export async function reconfirmLocally(): Promise<ActionResult> {
  const session = await requireSession();
  if (!devLoginEmail((await headers()).get("host"))) {
    return failed("Die Bestätigung braucht einen Passkey.");
  }
  await markFactorVerified(session.sessionId);
  return OK;
}

export async function revokeOtherDevices(): Promise<ActionResult> {
  return runAction({ revalidate: [PAGE] }, async () => {
    const session = await requireSession();
    await revokeOtherSessions(session.userId, session.sessionId);
  });
}

export type TotpStart =
  { ok: true; secret: string; qr: string } | ActionFailure;

export async function beginTotpSetup(): Promise<TotpStart> {
  const gate = await freshSessionOrFailure();
  if (!gate.ok) return gate.result;
  const setup = await startTotpSetup(await account(gate.session.userId));
  return { ok: true, secret: setup.secret, qr: qrDataUri(setup.uri) };
}

export async function completeTotpSetup(code: string): Promise<ActionResult> {
  return runAction({ fresh: true, revalidate: [PAGE] }, async (actor) => {
    if (!(await confirmTotpSetup(await account(actor.id), String(code)))) {
      throw new DomainError(
        "Der Code stimmt nicht. Bitte den aktuellen eingeben.",
        "code",
      );
    }
  });
}

export async function disableTotp(): Promise<ActionResult> {
  return runAction({ fresh: true, revalidate: [PAGE] }, (actor) =>
    removeTotp(actor.id),
  );
}

export type CodesResult = { ok: true; codes: string[] } | ActionFailure;

// Nur diese eine Antwort zeigt die Codes; danach liegt nur der Hash.
export async function regenerateRecoveryCodes(): Promise<CodesResult> {
  const gate = await freshSessionOrFailure();
  if (!gate.ok) return gate.result;
  return {
    ok: true,
    codes: await issueRecoveryCodes(await account(gate.session.userId)),
  };
}

export async function removeAccount(
  confirmation: string,
): Promise<ActionResult> {
  const result = await runAction({ fresh: true }, async (actor) => {
    if (confirmation.trim().toLowerCase() !== actor.email) {
      throw new DomainError("Die Adresse stimmt nicht.", "confirmation");
    }
    await deleteAccount(actor.id);
  });
  if (result.ok) await clearSessionCookie();
  return result;
}
