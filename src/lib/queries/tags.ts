import { and, asc, eq, sql } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import type { TagLook } from "../tags/colors.ts";

export type TagRow = TagLook & { id: string; cardCount: number };

/** Die Tags einer Sprache mit der Zahl ihrer Karten, nach Namen. */
export async function listTags(
  userId: string,
  languageId: string,
): Promise<TagRow[]> {
  return getDb()
    .select({
      id: schema.tags.id,
      name: schema.tags.name,
      emoji: schema.tags.emoji,
      color: schema.tags.color,
      // Ausgeschrieben: In einer Abfrage auf eine Tabelle lässt Drizzle den Tabellennamen weg.
      cardCount: sql<number>`(
        select count(*)::int from cards c
        join decks d on d.id = c.deck_id
        where d.language_id = "tags"."language_id"
          and c.tags @> array["tags"."name"]::text[]
      )`,
    })
    .from(schema.tags)
    .where(
      and(
        eq(schema.tags.userId, userId),
        eq(schema.tags.languageId, languageId),
      ),
    )
    .orderBy(asc(schema.tags.name), asc(schema.tags.id));
}
