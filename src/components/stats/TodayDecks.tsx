import Link from "next/link";

import ComponentCard from "@/components/common/ComponentCard";
import NewDeckButton from "@/components/decks/NewDeckButton";
import Button from "@/components/ui/button/Button";
import type { DeckRow } from "@/lib/queries/decks";

/** Was heute je Deck ansteht, mit dem Weg zum Lernen. */
export default function TodayDecks({
  decks,
  languageName,
}: {
  decks: DeckRow[];
  languageName: string;
}) {
  if (decks.length === 0) {
    return (
      <ComponentCard>
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          In {languageName} gibt es noch kein Deck.
        </p>
        <NewDeckButton />
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Heute">
      <ul className="-my-3 divide-y divide-gray-100 dark:divide-gray-800">
        {decks.map((deck) => {
          const offen = deck.newToday + deck.dueCount;
          return (
            <li key={deck.id} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/karten?deck=${deck.id}`}
                  className="link-underline text-base font-medium text-gray-800 dark:text-white/90"
                >
                  {deck.name}
                </Link>
                <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                  {deck.cardCount === 0
                    ? "noch leer"
                    : offen === 0
                      ? "erledigt"
                      : `${deck.newToday} neu, ${deck.dueCount} fällig`}
                </p>
              </div>
              {deck.cardCount === 0 ? (
                <Button
                  size="sm"
                  variant="outline"
                  href={`/karten/neu?deck=${deck.id}`}
                >
                  Erfassen
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={offen > 0 ? "primary" : "outline"}
                  href={`/lernen?deck=${deck.id}`}
                >
                  Lernen
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </ComponentCard>
  );
}
