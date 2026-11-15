"use client"; // Formular mit Entwurf und Dublettenprüfung.

import { useRef, useState } from "react";

import { updateCardAction } from "@/app/(app)/karten/actions";
import AuthNotice from "@/components/common/AuthNotice";
import DraftNotice from "@/components/common/DraftNotice";
import SelectField from "@/components/form/SelectField";
import Button from "@/components/ui/button/Button";
import { useFormDraft } from "@/hooks/useFormDraft";
import CardFields, { draftOf, type CardValues } from "./CardFields";
import { useDuplicates } from "./useDuplicates";

export default function CardEditForm({
  cardId,
  initial,
  decks,
  genders,
  back,
}: {
  cardId: string;
  initial: CardValues;
  decks: { value: string; label: string }[];
  genders: boolean;
  back: string;
}) {
  const form = useRef<HTMLFormElement>(null);
  const draft = useFormDraft<CardValues>(`karte:${cardId}`, initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const duplicates = useDuplicates(draft.values.front, cardId);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await draft.submit(() =>
      updateCardAction(cardId, draftOf(draft.values), back),
    );
    setPending(false);
    if (result.ok) return;
    const amFeld = result.fields ?? {};
    setFields(amFeld);
    setError(Object.keys(amFeld).length ? null : result.message);
    const erstes = Object.keys(amFeld)[0];
    if (erstes)
      form.current?.querySelector<HTMLElement>(`#card-${erstes}`)?.focus();
  }

  return (
    <form ref={form} onSubmit={submit} noValidate className="space-y-4">
      {draft.restoredAt && (
        <DraftNotice savedAt={draft.restoredAt} onDiscard={draft.discard} />
      )}
      {error && <AuthNotice tone="error">{error}</AuthNotice>}
      <SelectField
        id="card-deckId"
        label="Deck"
        value={draft.values.deckId}
        options={decks}
        onChange={(deckId) => draft.setValues({ ...draft.values, deckId })}
        error={Boolean(fields.deckId)}
        hint={fields.deckId}
      />
      <CardFields
        values={draft.values}
        onChange={(next) => draft.setValues(next)}
        fields={fields}
        genders={genders}
        duplicates={duplicates}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Wird gespeichert …" : "Speichern"}
        </Button>
        <Button variant="outline" href={back}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
