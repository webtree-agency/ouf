"use client"; // Öffnet die Bestätigung.

import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import DeleteCardDialog from "./DeleteCardDialog";

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
  return (
    <>
      <Button variant="outline" onClick={openModal}>
        Löschen
      </Button>
      <DeleteCardDialog
        cardId={cardId}
        front={front}
        returnTo={returnTo}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </>
  );
}
