import { redirect } from "next/navigation";

import { sessionOrLogin } from "../auth/pageAccess.ts";
import { activeLanguage } from "../queries/languages.ts";

/** Sitzung und aktive Sprache; ohne Sprache geht es zuerst zu `/sprachen`. */
export async function requireLanguage() {
  const session = await sessionOrLogin();
  const { active, all } = await activeLanguage(session.userId);
  if (!active) redirect("/sprachen");
  return { session, language: active, languages: all };
}
