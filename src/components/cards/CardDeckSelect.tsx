"use client"; // Wechselt das Deck auf der Stelle.

import { useState, useTransition } from "react";

import { moveCardAction } from "@/app/(app)/karten/actions";
import { SELECT_COMPACT } from "@/components/form/selectClass";
import { ChevronDownIcon } from "@/icons";

/**
 * **Das Deck einer Karte, gleich in der Liste wählbar.** Die Wahl gilt sofort;
 * schlägt sie fehl, springt die Auswahl zurück und sagt warum.
 */
export default function CardDeckSelect({
  cardId,
  deckId,
  decks,
  front,
}: {
  cardId: string;
  deckId: string;
  decks: { value: string; label: string }[];
  /** Für die Vorlesehilfe: welche Karte das Feld verschiebt. */
  front: string;
}) {
  const [value, setValue] = useState(deckId);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function move(next: string) {
    const before = value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      const result = await moveCardAction(cardId, next);
      if (!result.ok) {
        setValue(before);
        setError(result.message);
      }
    });
  }

  return (
    <span className="relative inline-flex max-w-full items-center">
      <select
        aria-label={`Deck von ${front}`}
        title={error ?? undefined}
        value={value}
        disabled={pending}
        onChange={(event) => move(event.target.value)}
        className={`${SELECT_COMPACT} max-w-56 truncate ${error ? "border-error-500" : ""} ${pending ? "opacity-60" : ""}`}
      >
        {decks.map((deck) => (
          <option key={deck.value} value={deck.value}>
            {deck.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        aria-hidden
        className="pointer-events-none absolute right-2.5 size-4 text-gray-500"
      />
    </span>
  );
}
