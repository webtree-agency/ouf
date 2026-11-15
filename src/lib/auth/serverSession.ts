import { cache } from "react";
import { cookies, headers } from "next/headers";

import {
  REAUTH_REQUIRED,
  SESSION_EXPIRED,
  type ActionFailure,
} from "../actionResult.ts";
import { clientIp } from "../http/clientIp.ts";
import type { LoginContext } from "./completeLogin.ts";
import {
  NotAuthenticatedError,
  ReauthenticationRequiredError,
} from "./errors.ts";
import {
  ABSOLUTE_LIFETIME_MS,
  hasFreshFactor,
  isSecureOrigin,
  readCookies,
  sessionCookieName,
  sessionFromTokens,
  type Session,
} from "./session.ts";

export {
  NotAuthenticatedError,
  ReauthenticationRequiredError,
} from "./errors.ts";

/**
 * Der Kopf wird selbst gelesen: `cookies()` behält bei zwei gleichnamigen nur
 * einen. `cookies()` kommt dazu, weil ein eben gesetzter Cookie in keinem
 * Anfragekopf steht. `cache()`: Layout und Seite fragen nicht zweimal.
 */
export const currentSession = cache(async (): Promise<Session | null> => {
  const [header, store] = await Promise.all([headers(), cookies()]);
  const name = sessionCookieName();

  return sessionFromTokens([
    ...new Set([
      ...readCookies(header.get("cookie"), name),
      ...store.getAll(name).map((cookie) => cookie.value),
    ]),
  ]);
});

export async function requireSession(): Promise<Session> {
  const session = await currentSession();
  if (!session) throw new NotAuthenticatedError();
  return session;
}

/**
 * Wie eine Aktion einen frischen Faktor verlangt: die Sitzung oder eine
 * anzeigbare Antwort. Geworfen landete der zu alte Faktor auf der Fehlerseite.
 */
export async function freshSessionOrFailure(): Promise<
  { ok: true; session: Session } | { ok: false; result: ActionFailure }
> {
  const session = await currentSession();
  if (!session) return { ok: false, result: SESSION_EXPIRED };
  if (!hasFreshFactor(session)) return { ok: false, result: REAUTH_REQUIRED };
  return { ok: true, session };
}

export async function requireFreshSession(): Promise<Session> {
  const session = await requireSession();
  if (!hasFreshFactor(session)) throw new ReauthenticationRequiredError();
  return session;
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(sessionCookieName(), token, {
    httpOnly: true,
    // Lax statt Strict: nach dem Klick auf einen Link soll man drin sein.
    sameSite: "lax",
    secure: isSecureOrigin(),
    path: "/",
    // Der Browser behält ihn bis zur harten Grenze; die gleitende setzt der Server durch.
    maxAge: Math.floor(ABSOLUTE_LIFETIME_MS / 1000),
  });
}

// Gesetzt statt `delete()`: Ohne `Secure` nimmt der Browser das Löschen eines
// `__Host-`-Cookies nicht an.
export async function clearSessionCookie(): Promise<void> {
  (await cookies()).set(sessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureOrigin(),
    path: "/",
    maxAge: 0,
  });
}

export async function actionContext(): Promise<LoginContext> {
  const store = await headers();
  return { ip: clientIp(store), userAgent: store.get("user-agent") };
}
