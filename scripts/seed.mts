/**
 * Testdaten für die lokale Entwicklung: ein Konto für den Kurzweg und zwei
 * französische Decks. Läuft mehrfach, ohne etwas doppelt anzulegen.
 *
 *     pnpm dev:seed                 # Konto aus DEV_LOGIN_EMAIL
 *     pnpm dev:seed jann@ouf.local
 *     pnpm dev:seed --verlauf       # dazu 30 Tage Lernen, über die echte Lernlogik
 */
import { and, eq } from "drizzle-orm";

import { closeDb, getDb, schema } from "../src/db/index.ts";
import { createCard } from "../src/lib/cards/cards.ts";
import { frontKey } from "../src/lib/cards/frontKey.ts";
import { cardInput } from "../src/lib/cards/input.ts";
import { rateCard, studyState } from "../src/lib/learning/session.ts";
import { addDays, startOfDay } from "../src/lib/time/day.ts";
import { GRUNDWORTSCHATZ, VERBEN, type SeedCard } from "./seed/franzoesisch.ts";

const args = process.argv.slice(2);
const withHistory = args.includes("--verlauf");
const email = (
  args.find((arg) => !arg.startsWith("--")) ??
  process.env.DEV_LOGIN_EMAIL ??
  ""
)
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

if (withHistory) await simulateHistory();

/**
 * Dreissig Tage Lernen, wie es ein Mensch täte: an den meisten Tagen eine
 * Runde morgens, meist „Gut", manchmal „Nochmal". Gezählt und geplant wird mit
 * derselben Logik wie in der App; nur die Uhr ist eine andere.
 */
async function simulateHistory() {
  const [vorhanden] = await db
    .select({ id: schema.reviews.id })
    .from(schema.reviews)
    .where(eq(schema.reviews.userId, user.id))
    .limit(1);
  if (vorhanden) {
    console.log("Verlauf: es gibt schon Bewertungen, nichts simuliert.");
    return;
  }

  let seed = 7;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const scope = { userId: user.id, languageId: fr.id, languageCode: "fr" };
  let total = 0;

  for (let ago = 29; ago >= 1; ago -= 1) {
    if (random() < 0.2) continue;
    // Morgens um acht in Zürich, dann alle 15 Sekunden eine Karte.
    let at = new Date(
      startOfDay(addDays(new Date(), -ago)).getTime() + 8 * 60 * 60 * 1000,
    );
    const limit = 25 + Math.floor(random() * 30);
    for (let i = 0; i < limit; i += 1) {
      const state = await studyState(scope, at);
      if (!state.card) break;
      const roll = random();
      const rating = roll < 0.1 ? 1 : roll < 0.2 ? 2 : roll < 0.93 ? 3 : 4;
      await rateCard({
        userId: user.id,
        scheduleId: state.card.scheduleId,
        rating,
        reps: state.card.reps,
        durationMs: 3000 + Math.floor(random() * 6000),
        now: at,
      });
      total += 1;
      at = new Date(at.getTime() + 15_000);
    }
  }
  console.log(`Verlauf: ${total} Bewertungen über 30 Tage.`);
}

await closeDb();
