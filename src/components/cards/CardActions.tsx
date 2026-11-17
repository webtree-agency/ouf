"use client"; // Menü, Verschieben und Löschen.

import Link from "next/link";
import { useState, useTransition } from "react";

import { moveCardAction } from "@/app/(app)/karten/actions";
import { MENU_ITEM } from "@/components/shell/menuItem";
import {
  anchorBelow,
  Dropdown,
  type DropdownAnchor,
} from "@/components/ui/dropdown/Dropdown";
import { cn } from "@/utils";
import { CheckLineIcon, MoreDotIcon, PencilIcon, TrashBinIcon } from "@/icons";
import DeleteCardDialog from "./DeleteCardDialog";

const MENU_SIZE = { width: 256, height: 360 };

/**
 * **Die drei Punkte oben rechts an jeder Karte:** bearbeiten, in ein anderes
 * Deck verschieben, löschen. Verschieben gilt sofort, Löschen fragt nach.
 */
export default function CardActions({
  cardId,
  front,
  deckId,
  decks,
  editHref,
  listHref,
}: {
  cardId: string;
  front: string;
  deckId: string;
  decks: { value: string; label: string }[];
  editHref: string;
  listHref: string;
}) {
  const [anchor, setAnchor] = useState<DropdownAnchor | null>(null);
  // Der Knopf selbst, damit sein Klick das Menü nicht als „daneben“ schliesst.
  const [opener, setOpener] = useState<HTMLButtonElement | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const close = () => setAnchor(null);

  function move(next: string) {
    close();
    if (next === deckId) return;
    setError(null);
    startTransition(async () => {
      const result = await moveCardAction(cardId, next);
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Aktionen für ${front}`}
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
        title={error ?? "Aktionen"}
        disabled={pending}
        onClick={(event) => {
          const button = event.currentTarget;
          setOpener(button);
          setAnchor((open) => (open ? null : anchorBelow(button, MENU_SIZE)));
        }}
        className={`flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 ${
          error ? "text-error-500" : "text-gray-500 dark:text-gray-400"
        } ${pending ? "opacity-50" : ""}`}
      >
        <MoreDotIcon />
      </button>
      <Dropdown
        isOpen={anchor !== null}
        onClose={close}
        anchor={anchor ?? undefined}
        toggle={opener}
        className="w-64 p-2"
      >
        <Link href={editHref} onClick={close} className={MENU_ITEM}>
          <PencilIcon />
          Bearbeiten
        </Link>
        <p className="text-theme-xs mt-2 px-3 pb-1 font-medium text-gray-500 dark:text-gray-400">
          In Deck verschieben
        </p>
        {decks.map((deck) => (
          <button
            key={deck.value}
            type="button"
            onClick={() => move(deck.value)}
            className={`${MENU_ITEM} w-full justify-between`}
          >
            <span className="truncate">{deck.label}</span>
            {deck.value === deckId && <CheckLineIcon aria-label="aktuell" />}
          </button>
        ))}
        <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-800">
          <button
            type="button"
            onClick={() => {
              close();
              setConfirm(true);
            }}
            className={cn(
              MENU_ITEM,
              "text-error-600 dark:text-error-400 w-full",
            )}
          >
            <TrashBinIcon />
            Löschen
          </button>
        </div>
      </Dropdown>
      <DeleteCardDialog
        cardId={cardId}
        front={front}
        returnTo={listHref}
        isOpen={confirm}
        onClose={() => setConfirm(false)}
      />
    </>
  );
}
