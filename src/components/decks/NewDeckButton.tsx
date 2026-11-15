"use client"; // Öffnet den Dialog.

import { useState } from "react";

import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import DeckFormModal from "./DeckFormModal";

export default function NewDeckButton({
  variant = "primary",
}: {
  variant?: "primary" | "outline";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant={variant}
        onClick={() => setOpen(true)}
        startIcon={<PlusIcon />}
      >
        Neues Deck
      </Button>
      <DeckFormModal
        deck={{ name: "", newPerDay: 20 }}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
