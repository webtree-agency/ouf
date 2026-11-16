"use client"; // Bearbeiten und Löschen öffnen Dialoge.

import { useState, useTransition } from "react";

import { deleteTagAction } from "@/app/(app)/decks/tags/actions";
import AuthNotice from "@/components/common/AuthNotice";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { counted } from "@/lib/format/plural";
import TagFormModal, { type TagValues } from "./TagFormModal";

const ICON_BUTTON =
  "flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90";

export default function TagActions({
  tag,
  cardCount,
}: {
  tag: Required<TagValues>;
  cardCount: number;
}) {
  const [open, setOpen] = useState<"edit" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTagAction(tag.id);
      if (result.ok) setOpen(null);
      else setError(result.message);
    });
  }

  return (
    <div className="flex">
      <button
        type="button"
        onClick={() => setOpen("edit")}
        aria-label={`${tag.name} bearbeiten`}
        title="Bearbeiten"
        className={ICON_BUTTON}
      >
        <PencilIcon />
      </button>
      <button
        type="button"
        onClick={() => setOpen("delete")}
        aria-label={`${tag.name} löschen`}
        title="Löschen"
        className={ICON_BUTTON}
      >
        <TrashBinIcon />
      </button>

      <TagFormModal
        key={`${tag.name}-${tag.emoji}-${tag.color}`}
        tag={tag}
        isOpen={open === "edit"}
        onClose={() => setOpen(null)}
      />

      <Modal
        isOpen={open === "delete"}
        onClose={() => setOpen(null)}
        className="max-w-md p-6 sm:p-8"
      >
        <h2 className="text-theme-xl font-medium text-gray-800 dark:text-white/90">
          {tag.name} löschen
        </h2>
        <p className="text-theme-sm mt-2 text-gray-500 dark:text-gray-400">
          {cardCount > 0
            ? `Der Tag verschwindet von ${counted(cardCount, { one: "Karte", many: "Karten" })}. Die Karten bleiben.`
            : "Keine Karte trägt ihn."}
        </p>
        {error && (
          <AuthNotice tone="error" className="mt-4">
            {error}
          </AuthNotice>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setOpen(null)}>
            Abbrechen
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={remove}
            disabled={pending}
          >
            {pending ? "Wird gelöscht …" : "Löschen"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
