import { and, asc, eq } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { DomainError } from "../domainError.ts";
import { LANGUAGE_CODES } from "./catalog.ts";

/** Legt eine Sprache an und macht sie zur aktiven. */
export async function addLanguage(
  userId: string,
  code: string,
): Promise<string> {
  if (!LANGUAGE_CODES.includes(code))
    throw new DomainError("Diese Sprache gibt es nicht.");

  return getDb().transaction(async (tx) => {
    const [created] = await tx
      .insert(schema.languages)
      .values({ userId, code })
      .onConflictDoNothing()
      .returning({ id: schema.languages.id });
    if (!created) throw new DomainError("Diese Sprache ist schon da.");

    await tx
      .update(schema.users)
      .set({ activeLanguageId: created.id })
      .where(eq(schema.users.id, userId));
    return created.id;
  });
}

export async function setActiveLanguage(
  userId: string,
  languageId: string,
): Promise<void> {
  const [language] = await getDb()
    .select({ id: schema.languages.id })
    .from(schema.languages)
    .where(
      and(
        eq(schema.languages.id, languageId),
        eq(schema.languages.userId, userId),
      ),
    );
  if (!language) throw new DomainError("Diese Sprache gibt es nicht.");

  await getDb()
    .update(schema.users)
    .set({ activeLanguageId: language.id })
    .where(eq(schema.users.id, userId));
}

/** Entfernt die Sprache samt Decks und Karten; aktiv wird die nächste. */
export async function removeLanguage(
  userId: string,
  languageId: string,
): Promise<void> {
  await getDb().transaction(async (tx) => {
    const removed = await tx
      .delete(schema.languages)
      .where(
        and(
          eq(schema.languages.id, languageId),
          eq(schema.languages.userId, userId),
        ),
      )
      .returning({ id: schema.languages.id });
    if (removed.length === 0)
      throw new DomainError("Diese Sprache gibt es nicht.");

    const [next] = await tx
      .select({ id: schema.languages.id })
      .from(schema.languages)
      .where(eq(schema.languages.userId, userId))
      .orderBy(asc(schema.languages.createdAt), asc(schema.languages.id))
      .limit(1);
    await tx
      .update(schema.users)
      .set({ activeLanguageId: next?.id ?? null })
      .where(eq(schema.users.id, userId));
  });
}
