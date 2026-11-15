import { asc, eq, sql } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { languageProfile, type LanguageProfile } from "../languages/catalog.ts";

export type Language = LanguageProfile & { id: string; deckCount: number };

export async function listLanguages(userId: string): Promise<Language[]> {
  const rows = await getDb()
    .select({
      id: schema.languages.id,
      code: schema.languages.code,
      deckCount: sql<number>`(select count(*)::int from ${schema.decks} where ${schema.decks.languageId} = ${schema.languages.id})`,
    })
    .from(schema.languages)
    .where(eq(schema.languages.userId, userId))
    .orderBy(asc(schema.languages.createdAt), asc(schema.languages.id));

  return rows.map((row) => ({ ...languageProfile(row.code), ...row }));
}

/**
 * Die Sprache, die die Seiten zeigen: die gewählte, sonst die erste. `null`
 * heisst, es gibt noch keine, und die Seite führt zu `/sprachen`.
 */
export async function activeLanguage(
  userId: string,
): Promise<{ active: Language | null; all: Language[] }> {
  const [all, [user]] = await Promise.all([
    listLanguages(userId),
    getDb()
      .select({ activeLanguageId: schema.users.activeLanguageId })
      .from(schema.users)
      .where(eq(schema.users.id, userId)),
  ]);
  const active =
    all.find((language) => language.id === user?.activeLanguageId) ??
    all[0] ??
    null;
  return { active, all };
}
