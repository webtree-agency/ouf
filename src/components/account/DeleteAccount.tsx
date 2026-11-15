"use client"; // Dialog mit Bestätigung.

import { useState } from "react";

import { removeAccount } from "@/app/(app)/konto/actions";
import ActionNotice from "@/components/auth/ActionNotice";
import { useGuardedAction } from "@/components/auth/useGuardedAction";
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

export default function DeleteAccount({ email }: { email: string }) {
  const { isOpen, openModal, closeModal } = useModal();
  const [confirmation, setConfirmation] = useState("");
  const gate = useGuardedAction("delete-");

  function close() {
    setConfirmation("");
    gate.reset();
    closeModal();
  }

  return (
    <ComponentCard title="Konto löschen">
      <p className="text-theme-sm text-gray-500 dark:text-gray-400">
        Löscht das Konto mit allen Sprachen, Decks, Karten und dem Lernverlauf.
      </p>
      <Button variant="danger" onClick={openModal}>
        Konto löschen
      </Button>

      <Modal isOpen={isOpen} onClose={close} className="max-w-md p-6 sm:p-8">
        <h2 className="text-theme-xl font-medium text-gray-800 dark:text-white/90">
          Konto endgültig löschen
        </h2>
        <p className="text-theme-sm mt-2 text-gray-500 dark:text-gray-400">
          Das lässt sich nicht rückgängig machen. Zur Bestätigung die
          E-Mail-Adresse eintippen.
        </p>
        <form
          noValidate
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            gate.run(
              () => removeAccount(confirmation),
              () => window.location.assign("/registrieren"),
            );
          }}
        >
          <ActionNotice gate={gate} />
          <div>
            <Label htmlFor="delete-confirmation">{email}</Label>
            <Input
              id="delete-confirmation"
              type="email"
              autoFocus
              autoComplete="off"
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value);
                gate.reset();
              }}
              error={Boolean(gate.fields.confirmation)}
              hint={gate.fields.confirmation}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={close}>
              Abbrechen
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={
                gate.pending || confirmation.trim().toLowerCase() !== email
              }
            >
              {gate.pending ? "Wird gelöscht …" : "Endgültig löschen"}
            </Button>
          </div>
        </form>
      </Modal>
    </ComponentCard>
  );
}
