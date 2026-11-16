import Link from "next/link";

import NewDeckButton from "@/components/decks/NewDeckButton";
import { ChevronRightIcon, StackIcon } from "@/icons";
import type { DeckRow } from "@/lib/queries/decks";

/** Je Deck, was heute offen ist. Die ganze Zeile führt weiter. */
export default function DeckList({ decks }: { decks: DeckRow[] }) {
  if (decks.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-medium text-gray-900 dark:text-white/90">
          Deine Decks
        </h2>
        <NewDeckButton variant="icon" />
      </div>
      <ul className="space-y-2">
        {decks.map((deck) => (
          <li key={deck.id}>
            <DeckLink deck={deck} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function DeckLink({ deck }: { deck: DeckRow }) {
  const offen = deck.newToday + deck.dueCount;
  const href =
    deck.cardCount === 0
      ? `/karten/neu?deck=${deck.id}`
      : offen > 0
        ? `/lernen?deck=${deck.id}`
        : `/karten?deck=${deck.id}`;

  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
    >
      <span
        aria-hidden
        className="bg-brand-100 dark:bg-brand-300/10 dark:text-brand-300 flex size-11 shrink-0 items-center justify-center rounded-xl text-gray-800"
      >
        <StackIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-medium text-gray-900 dark:text-white/90">
          {deck.name}
        </span>
        <span className="text-theme-sm text-gray-500 dark:text-gray-400">
          {deck.cardCount === 1 ? "1 Karte" : `${deck.cardCount} Karten`}
        </span>
      </span>
      <span
        className={`text-theme-sm shrink-0 ${offen > 0 ? "font-medium text-gray-900 dark:text-white/90" : "text-gray-500 dark:text-gray-400"}`}
      >
        {deck.cardCount === 0
          ? "erfassen"
          : offen > 0
            ? `${offen} offen`
            : "erledigt"}
      </span>
      <ChevronRightIcon aria-hidden className="shrink-0 text-gray-400" />
    </Link>
  );
}
