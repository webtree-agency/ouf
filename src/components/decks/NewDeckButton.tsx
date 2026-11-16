"use client"; // Öffnet den Dialog.

import { useState } from "react";

import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import DeckFormModal from "./DeckFormModal";

export default function NewDeckButton({
  variant = "primary",
}: {
  /** `icon`: nur das Plus, neben einer Überschrift. */
  variant?: "primary" | "outline" | "icon";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Neues Deck"
          title="Neues Deck"
          className="flex size-11 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <PlusIcon />
        </button>
      ) : (
        <Button
          type="button"
          variant={variant}
          onClick={() => setOpen(true)}
          startIcon={<PlusIcon />}
        >
          Neues Deck
        </Button>
      )}
      <DeckFormModal
        deck={{ name: "", newPerDay: 20 }}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
