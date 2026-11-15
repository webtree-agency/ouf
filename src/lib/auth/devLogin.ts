import { findAccountByEmail } from "../queries/accounts.ts";
import { completeLogin, type LoginContext } from "./completeLogin.ts";

/**
 * Der Kurzweg für die lokale Entwicklung: ein Klick statt Passkey. Er umgeht
 * die Anmeldung, also hängt er an **drei Bedingungen gleichzeitig** (§8):
 *
 * 1. `NODE_ENV` ist nicht `production`, das Abbild setzt es beim Bauen.
 * 2. `DEV_LOGIN_EMAIL` ist gesetzt, in der Produktion steht die Variable nicht.
 * 3. Der Aufruf kommt an `localhost`. Diese Bedingung kann von aussen niemand
 *    erfüllen, ein Proxy reicht den echten Namen durch.
 */
const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1", "[::1]"];

export function devLoginEmail(host: string | null | undefined): string | null {
  if (process.env.NODE_ENV === "production") return null;

  const email = process.env.DEV_LOGIN_EMAIL?.trim();
  if (!email) return null;

  return isLocal(host) ? email.toLowerCase() : null;
}

function isLocal(host: string | null | undefined): boolean {
  if (!host) return false;
  return LOCAL_HOSTNAMES.includes(hostname(host));
}

// „localhost:3400", „127.0.0.1", „[::1]:3400": der Port gehört nicht dazu.
function hostname(host: string): string {
  if (host.startsWith("[")) return host.slice(0, host.indexOf("]") + 1);
  return host.split(":")[0];
}

export async function devLogin(
  host: string | null | undefined,
  context: LoginContext,
): Promise<{ token: string; expiresAt: Date } | null> {
  const email = devLoginEmail(host);
  if (!email) return null;

  const account = await findAccountByEmail(email);
  if (!account) return null;

  return completeLogin(account, "lokal", context);
}
