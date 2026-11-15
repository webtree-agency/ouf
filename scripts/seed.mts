/**
 * Testdaten für die lokale Entwicklung: ein Konto für den Kurzweg und zwei
 * französische Decks. Läuft mehrfach, ohne etwas doppelt anzulegen.
 *
 *     pnpm dev:seed                 # Konto aus DEV_LOGIN_EMAIL
 *     pnpm dev:seed jann@ouf.local
 */
import { and, eq } from "drizzle-orm";

import { closeDb, getDb, schema } from "../src/db/index.ts";
import { createCard } from "../src/lib/cards/cards.ts";
import { frontKey } from "../src/lib/cards/frontKey.ts";
import { cardInput } from "../src/lib/cards/input.ts";
import { GRUNDWORTSCHATZ, VERBEN, type SeedCard } from "./seed/franzoesisch.ts";

const email = (process.argv[2] ?? process.env.DEV_LOGIN_EMAIL ?? "")
  .trim()
  .toLowerCase();
if (!email) {
  console.error(
    "So: pnpm dev:seed <e-mail>, oder DEV_LOGIN_EMAIL in .env.local setzen.",
  );
  process.exit(1);
}

const db = getDb();

const [user] = await db
  .insert(schema.users)
  .values({ email, name: "Jann" })
  .onConflictDoUpdate({ target: schema.users.email, set: { email } })
  .returning({ id: schema.users.id });

await db
  .insert(schema.languages)
  .values({ userId: user.id, code: "fr" })
  .onConflictDoNothing();
const [fr] = await db
  .select({ id: schema.languages.id })
  .from(schema.languages)
  .where(
    and(eq(schema.languages.userId, user.id), eq(schema.languages.code, "fr")),
  );
await db
  .update(schema.users)
  .set({ activeLanguageId: fr.id })
  .where(eq(schema.users.id, user.id));

async function deck(name: string, newPerDay: number, cards: SeedCard[]) {
  const [existing] = await db
    .select({ id: schema.decks.id })
    .from(schema.decks)
    .where(
      and(eq(schema.decks.languageId, fr.id), eq(schema.decks.name, name)),
    );
  const deckId =
    existing?.id ??
    (
      await db
        .insert(schema.decks)
        .values({ userId: user.id, languageId: fr.id, name, newPerDay })
        .returning({ id: schema.decks.id })
    )[0].id;

  const vorhanden = new Set(
    (
      await db
        .select({ key: schema.cards.frontKey })
        .from(schema.cards)
        .where(eq(schema.cards.deckId, deckId))
    ).map((row) => row.key),
  );

  let neu = 0;
  for (const card of cards) {
    if (vorhanden.has(frontKey(card.front))) continue;
    const input = cardInput.parse({
      deckId,
      front: card.front,
      back: card.back,
      example: card.example,
      note: card.note ?? "",
      gender: card.gender ?? "",
      tags: card.tags.join(","),
      reverse: card.reverse ?? false,
    });
    await createCard(user.id, input);
    neu += 1;
  }
  console.log(`${name}: ${neu} neue Karten, ${cards.length - neu} schon da.`);
}

await deck("Grundwortschatz", 20, GRUNDWORTSCHATZ);
await deck("Verben im Alltag", 15, VERBEN);

await closeDb();
