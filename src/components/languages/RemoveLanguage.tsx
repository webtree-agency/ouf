"use client"; // Dialog mit Bestätigung.

import { useState, useTransition } from "react";

import { removeLanguageAction } from "@/app/(app)/sprachen/actions";
import AuthNotice from "@/components/common/AuthNotice";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { TrashBinIcon } from "@/icons";

export default function RemoveLanguage({
  id,
  name,
  deckCount,
}: {
  id: string;
  name: string;
  deckCount: number;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await removeLanguageAction(id);
      if (result.ok) closeModal();
      else setError(result.message);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        aria-label={`${name} entfernen`}
        title="Entfernen"
        className="text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10 flex h-11 w-11 items-center justify-center rounded-lg"
      >
        <TrashBinIcon />
      </button>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-md p-6 sm:p-8"
      >
        <h2 className="text-theme-xl font-medium text-gray-800 dark:text-white/90">
          {name} entfernen
        </h2>
        <p className="text-theme-sm mt-2 text-gray-500 dark:text-gray-400">
          {deckCount > 0
            ? `${deckCount === 1 ? "Das Deck geht" : `Die ${deckCount} Decks gehen`} samt Karten mit. Das lässt sich nicht rückgängig machen.`
            : "Es gibt darin noch kein Deck."}
        </p>
        {error && (
          <AuthNotice tone="error" className="mt-4">
            {error}
          </AuthNotice>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={closeModal}>
            Abbrechen
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={remove}
            disabled={pending}
          >
            {pending ? "Wird entfernt …" : "Entfernen"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
