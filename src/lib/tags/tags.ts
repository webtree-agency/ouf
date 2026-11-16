import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema, type Executor } from "../../db/index.ts";
import { DomainError } from "../domainError.ts";
import { emojiField, normalizeTags } from "../validation/fields.ts";
import { TAG_COLORS } from "./colors.ts";

/** Ein Name, wie ihn auch die Karte schreibt: klein, ein Wort, ohne `#`. */
export const tagInput = z.object({
  name: z
    .string()
    .transform((value) => normalizeTags(value))
    .refine((names) => names.length === 1, "Ein Wort, ohne Leerzeichen.")
    .transform((names) => names[0])
    .pipe(z.string().max(40, "Höchstens 40 Zeichen.")),
  emoji: emojiField(),
  color: z.enum(TAG_COLORS),
});
export type TagInput = z.infer<typeof tagInput>;

const VERGEBEN = "Diesen Tag gibt es in dieser Sprache schon.";

/** Was eine Karte trägt und es noch nicht gibt, wird ein Tag in Grau. */
export async function ensureTags(
  tx: Executor,
  userId: string,
  languageId: string,
  names: string[],
): Promise<void> {
  if (names.length === 0) return;
  await tx
    .insert(schema.tags)
    .values(names.map((name) => ({ userId, languageId, name })))
    .onConflictDoNothing();
}

async function ownedLanguage(userId: string, languageId: string) {
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
}

function unique(error: unknown): unknown {
  const code =
    (error as { cause?: { code?: string }; code?: string }).cause?.code ??
    (error as { code?: string }).code;
  return code === "23505" ? new DomainError(VERGEBEN, "name") : error;
}

export async function createTag(
  userId: string,
  languageId: string,
  input: TagInput,
): Promise<void> {
  await ownedLanguage(userId, languageId);
  try {
    await getDb()
      .insert(schema.tags)
      .values({ userId, languageId, ...input });
  } catch (error) {
    throw unique(error);
  }
}

/** Umbenennen ändert auch jede Karte, die den alten Namen trägt. */
export async function updateTag(
  userId: string,
  tagId: string,
  input: TagInput,
): Promise<void> {
  try {
    await getDb().transaction(async (tx) => {
      const mine = and(
        eq(schema.tags.id, tagId),
        eq(schema.tags.userId, userId),
      );
      const [tag] = await tx
        .select({ name: schema.tags.name, languageId: schema.tags.languageId })
        .from(schema.tags)
        .where(mine);
      if (!tag) throw new DomainError("Diesen Tag gibt es nicht.");
      await tx.update(schema.tags).set(input).where(mine);
      await renameOnCards(tx, userId, tag.languageId, tag.name, input.name);
    });
  } catch (error) {
    throw unique(error);
  }
}

async function renameOnCards(
  tx: Executor,
  userId: string,
  languageId: string,
  before: string,
  after: string | null,
) {
  if (before === after) return;
  const replaced =
    after === null
      ? sql`array_remove(${schema.cards.tags}, ${before})`
      : sql`array_replace(${schema.cards.tags}, ${before}, ${after})`;
  await tx
    .update(schema.cards)
    .set({ tags: replaced })
    .where(
      and(
        sql`${schema.cards.tags} @> array[${before}]::text[]`,
        sql`${schema.cards.deckId} in (select id from decks where user_id = ${userId} and language_id = ${languageId})`,
      ),
    );
}

/** Löschen nimmt den Tag auch von den Karten; die Karten bleiben. */
export async function deleteTag(userId: string, tagId: string): Promise<void> {
  await getDb().transaction(async (tx) => {
    const [tag] = await tx
      .delete(schema.tags)
      .where(and(eq(schema.tags.id, tagId), eq(schema.tags.userId, userId)))
      .returning({
        name: schema.tags.name,
        languageId: schema.tags.languageId,
      });
    if (!tag) throw new DomainError("Diesen Tag gibt es nicht.");
    await renameOnCards(tx, userId, tag.languageId, tag.name, null);
  });
}
