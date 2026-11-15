"use client"; // Dialog mit Bestätigung.

import { useState, useTransition } from "react";

import { deleteCardAction } from "@/app/(app)/karten/actions";
import AuthNotice from "@/components/common/AuthNotice";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

export default function DeleteCard({
  cardId,
  front,
  returnTo,
}: {
  cardId: string;
  front: string;
  returnTo: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
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
    <>
      <Button variant="outline" onClick={openModal}>
        Löschen
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-md p-6 sm:p-8"
      >
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
          <Button variant="outline" onClick={closeModal}>
            Abbrechen
          </Button>
          <Button variant="danger" onClick={remove} disabled={pending}>
            {pending ? "Wird gelöscht …" : "Löschen"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
