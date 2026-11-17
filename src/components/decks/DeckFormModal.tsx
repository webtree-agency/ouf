"use client"; // Dialog mit Formular.

import { useRef, useState, useTransition } from "react";

import { createDeckAction, updateDeckAction } from "@/app/(app)/decks/actions";
import AuthNotice from "@/components/common/AuthNotice";
import EmojiPicker from "@/components/form/EmojiPicker";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";

export type DeckValues = {
  id?: string;
  name: string;
  emoji: string | null;
  newPerDay: number;
};

export default function DeckFormModal({
  deck,
  isOpen,
  onClose,
}: {
  deck: DeckValues;
  isOpen: boolean;
  onClose: () => void;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [name, setName] = useState(deck.name);
  const [emoji, setEmoji] = useState(deck.emoji ?? "");
  const [newPerDay, setNewPerDay] = useState(String(deck.newPerDay));
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function close() {
    setError(null);
    setFields({});
    onClose();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const input = { name, emoji, newPerDay };
      const result = deck.id
        ? await updateDeckAction(deck.id, input)
        : await createDeckAction(input);
      if (result.ok) {
        close();
        if (!deck.id) {
          setName("");
          setEmoji("");
          setNewPerDay(String(deck.newPerDay));
        }
        return;
      }
      const amFeld = result.fields ?? {};
      setFields(amFeld);
      setError(Object.keys(amFeld).length ? null : result.message);
      const erstes = Object.keys(amFeld)[0];
      if (erstes)
        form.current
          ?.querySelector<HTMLInputElement>(
            `#deck-${erstes === "name" ? "title" : erstes}`,
          )
          ?.focus();
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={close} className="max-w-md p-6 sm:p-8">
      <h2 className="text-theme-xl font-medium text-gray-800 dark:text-white/90">
        {deck.id ? "Deck bearbeiten" : "Neues Deck"}
      </h2>
      <form ref={form} onSubmit={submit} noValidate className="mt-6 space-y-4">
        {error && <AuthNotice tone="error">{error}</AuthNotice>}
        <EmojiPicker value={emoji} onChange={setEmoji} name={name}>
          {/* „Titel" statt „Name": Bei „Name" bietet iOS den eigenen Kontakt an. */}
          <Label htmlFor="deck-title">Titel</Label>
          <Input
            id="deck-title"
            autoComplete="off"
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
            error={Boolean(fields.name)}
            hint={fields.name ?? fields.emoji}
          />
        </EmojiPicker>
        <div>
          <Label htmlFor="deck-newPerDay">Neue Karten je Tag</Label>
          <Input
            id="deck-newPerDay"
            accepts="digits"
            value={newPerDay}
            onChange={(event) => setNewPerDay(event.target.value)}
            error={Boolean(fields.newPerDay)}
            hint={fields.newPerDay}
          />
        </div>
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={close}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Wird gespeichert …" : "Speichern"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
