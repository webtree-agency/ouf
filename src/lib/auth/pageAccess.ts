import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { currentSession } from "./serverSession.ts";
import type { Session } from "./session.ts";

/** Die Sitzung oder die Anmeldung, die danach hierher zurückführt. */
export async function sessionOrLogin(): Promise<Session> {
  const session = await currentSession();
  if (session) return session;

  const pfad = (await headers()).get("x-pathname") ?? "/";
  redirect(
    pfad === "/" ? "/anmelden" : `/anmelden?weiter=${encodeURIComponent(pfad)}`,
  );
}
