"use client"; // Dialog mit Bestätigung.

import { useState, useTransition } from "react";

import { deleteCardAction } from "@/app/(app)/karten/actions";
import AuthNotice from "@/components/common/AuthNotice";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";

/** Die Bestätigung vor dem Löschen; danach geht es zurück in die Liste. */
export default function DeleteCardDialog({
  cardId,
  front,
  returnTo,
  isOpen,
  onClose,
}: {
  cardId: string;
  front: string;
  returnTo: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteCardAction(cardId, returnTo);
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
      <h2 className="text-theme-xl font-medium text-gray-800 dark:text-white/90">
        {front} löschen
      </h2>
      <p className="text-theme-sm mt-2 text-gray-500 dark:text-gray-400">
        Die Karte und ihr Lernstand gehen. Die Statistik behält, was schon
        gelernt wurde.
      </p>
      {error && (
        <AuthNotice tone="error" className="mt-4">
          {error}
        </AuthNotice>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button variant="danger" onClick={remove} disabled={pending}>
          {pending ? "Wird gelöscht …" : "Löschen"}
        </Button>
      </div>
    </Modal>
  );
}
