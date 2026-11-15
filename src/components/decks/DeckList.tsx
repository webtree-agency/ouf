import Link from "next/link";

import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { counted } from "@/lib/format/plural";
import type { DeckRow } from "@/lib/queries/decks";
import DeckActions from "./DeckActions";
import NewDeckButton from "./NewDeckButton";

export default function DeckList({
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
    <ComponentCard>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {decks.map((deck) => (
          <li
            key={deck.id}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={`/karten?deck=${deck.id}`}
                className="link-underline text-base font-medium text-gray-800 dark:text-white/90"
              >
                {deck.name}
              </Link>
              <p className="text-theme-sm mt-0.5 text-gray-500 dark:text-gray-400">
                {counted(deck.cardCount, { one: "Karte", many: "Karten" })} ·{" "}
                {deck.newCount} neu · {deck.dueCount} fällig · {deck.newPerDay}{" "}
                neue je Tag
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                href={`/lernen?deck=${deck.id}`}
                variant={
                  deck.dueCount > 0 || deck.newCount > 0 ? "primary" : "outline"
                }
              >
                Lernen
              </Button>
              <Button
                size="sm"
                variant="outline"
                href={`/karten/neu?deck=${deck.id}`}
              >
                Erfassen
              </Button>
              <DeckActions
                deck={{
                  id: deck.id,
                  name: deck.name,
                  newPerDay: deck.newPerDay,
                }}
                cardCount={deck.cardCount}
              />
            </div>
          </li>
        ))}
      </ul>
    </ComponentCard>
  );
}
