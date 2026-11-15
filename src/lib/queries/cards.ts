import { and, asc, desc, eq, ilike, ne, or, sql, type SQL } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import type { Gender } from "../languages/catalog.ts";
import { paginate, type Page } from "./paginate.ts";

export type CardFilters = {
  query?: string;
  deckId?: string;
  tag?: string;
  gender?: Gender;
  page?: number;
  perPage: number;
};

export type CardRow = {
  id: string;
  front: string;
  back: string;
  gender: Gender | null;
  tags: string[];
  reverse: boolean;
  deckId: string;
  deckName: string;
};

// `%` und `_` sind in LIKE Platzhalter; wer nach „50%" sucht, meint das Zeichen.
function likePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, (zeichen) => `\\${zeichen}`)}%`;
}

function cardScope(
  userId: string,
  languageId: string,
  filters: CardFilters,
): SQL | undefined {
  const query = filters.query?.trim();
  return and(
    eq(schema.decks.userId, userId),
    eq(schema.decks.languageId, languageId),
    filters.deckId ? eq(schema.cards.deckId, filters.deckId) : undefined,
    filters.tag
      ? sql`${schema.cards.tags} @> array[${filters.tag}]::text[]`
      : undefined,
    filters.gender ? eq(schema.cards.gender, filters.gender) : undefined,
    query
      ? or(
          ilike(schema.cards.front, likePattern(query)),
          ilike(schema.cards.back, likePattern(query)),
          ilike(schema.cards.example, likePattern(query)),
          ilike(schema.cards.note, likePattern(query)),
        )
      : undefined,
  );
}

export async function listCards(
  userId: string,
  languageId: string,
  filters: CardFilters,
): Promise<{ rows: CardRow[]; total: number } & Page> {
  const where = cardScope(userId, languageId, filters);
  const [{ total }] = await getDb()
    .select({ total: sql<number>`count(*)::int` })
    .from(schema.cards)
    .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
    .where(where);

  const page = paginate(total, filters.perPage, filters.page);
  const rows = await getDb()
    .select({
      id: schema.cards.id,
      front: schema.cards.front,
      back: schema.cards.back,
      gender: schema.cards.gender,
      tags: schema.cards.tags,
      reverse: schema.cards.reverse,
      deckId: schema.decks.id,
      deckName: schema.decks.name,
    })
    .from(schema.cards)
    .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
    .where(where)
    .orderBy(desc(schema.cards.createdAt), desc(schema.cards.id))
    .limit(filters.perPage)
    .offset(page.offset);

  return { rows, total, ...page };
}

export async function listTags(
  userId: string,
  languageId: string,
): Promise<string[]> {
  const rows = await getDb()
    .selectDistinct({ tag: sql<string>`unnest(${schema.cards.tags})` })
    .from(schema.cards)
    .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
    .where(
      and(
        eq(schema.decks.userId, userId),
        eq(schema.decks.languageId, languageId),
      ),
    )
    .orderBy(asc(sql`1`));
  return rows.map((row) => row.tag);
}

export async function findCard(userId: string, cardId: string) {
  const [card] = await getDb()
    .select({
      id: schema.cards.id,
      deckId: schema.cards.deckId,
      languageId: schema.decks.languageId,
      front: schema.cards.front,
      back: schema.cards.back,
      example: schema.cards.example,
      note: schema.cards.note,
      gender: schema.cards.gender,
      tags: schema.cards.tags,
      reverse: schema.cards.reverse,
      updatedAt: schema.cards.updatedAt,
    })
    .from(schema.cards)
    .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
    .where(and(eq(schema.cards.id, cardId), eq(schema.decks.userId, userId)));
  return card ?? null;
}

export type Duplicate = {
  id: string;
  front: string;
  back: string;
  deckName: string;
};

/** Karten derselben Sprache mit derselben normierten Vorderseite. */
export async function findDuplicates(
  userId: string,
  languageId: string,
  key: string,
  excludeId?: string,
): Promise<Duplicate[]> {
  if (!key) return [];
  return getDb()
    .select({
      id: schema.cards.id,
      front: schema.cards.front,
      back: schema.cards.back,
      deckName: schema.decks.name,
    })
    .from(schema.cards)
    .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
    .where(
      and(
        eq(schema.decks.userId, userId),
        eq(schema.decks.languageId, languageId),
        eq(schema.cards.frontKey, key),
        excludeId ? ne(schema.cards.id, excludeId) : undefined,
      ),
    )
    .orderBy(asc(schema.cards.createdAt))
    .limit(3);
}

/** Die zuletzt erfassten Karten eines Decks, unter der Schnellerfassung. */
export async function recentCards(userId: string, deckId: string, limit = 5) {
  return getDb()
    .select({
      id: schema.cards.id,
      front: schema.cards.front,
      back: schema.cards.back,
    })
    .from(schema.cards)
    .innerJoin(schema.decks, eq(schema.decks.id, schema.cards.deckId))
    .where(
      and(eq(schema.cards.deckId, deckId), eq(schema.decks.userId, userId)),
    )
    .orderBy(desc(schema.cards.createdAt), desc(schema.cards.id))
    .limit(limit);
}
