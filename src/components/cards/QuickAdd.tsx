"use client"; // Formular mit Fokus, Entwurf und Dublettenprüfung.

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { createCardAction } from "@/app/(app)/karten/actions";
import AuthNotice from "@/components/common/AuthNotice";
import ComponentCard from "@/components/common/ComponentCard";
import DraftNotice from "@/components/common/DraftNotice";
import SelectField from "@/components/form/SelectField";
import Button from "@/components/ui/button/Button";
import { useFormDraft } from "@/hooks/useFormDraft";
import type { TagLook } from "@/lib/tags/colors";
import AssistedFields from "./AssistedFields";
import { draftOf, type CardValues } from "./CardFields";
import { PreviewStack } from "./CardPreview";
import { useDuplicates } from "./useDuplicates";

type Sticky = Pick<CardValues, "tags" | "reverse">;

/**
 * **Vorderseite, Tab, Rückseite, Enter.** Nach dem Speichern baut sich das
 * Formular neu auf (`key`), der Fokus steht wieder vorne, und Deck, Tags und
 * Rückwärtskarte bleiben, wie sie waren.
 */
export default function QuickAdd({
  decks,
  deckId,
  genders,
  language,
  dictation,
  tagOptions,
  aside,
}: {
  decks: { value: string; label: string }[];
  deckId: string;
  genders: boolean;
  /** Der Name der Sprache, wenn das Diktat eingerichtet ist, sonst `null`. */
  language: string;
  dictation: string | null;
  tagOptions: TagLook[];
  /** Was rechts unter der Vorschau steht: die zuletzt erfassten Karten. */
  aside: React.ReactNode;
}) {
  const router = useRouter();
  const [round, setRound] = useState(0);
  const [sticky, setSticky] = useState<Sticky>({ tags: "", reverse: false });
  const [saved, setSaved] = useState<string | null>(null);
  const [preview, setPreview] = useState<CardValues | null>(null);
  const [leaving, setLeaving] = useState<CardValues | null>(null);
  const looks = new Map(tagOptions.map((tag) => [tag.name, tag]));

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <ComponentCard>
          <div className="space-y-6">
            <SelectField
              id="card-deck"
              label="Deck"
              value={deckId}
              options={decks}
              onChange={(id) =>
                router.replace(`/karten/neu?deck=${id}`, { scroll: false })
              }
            />
            <QuickAddForm
              key={`${deckId}-${round}`}
              deckId={deckId}
              genders={genders}
              language={language}
              dictation={dictation}
              tagOptions={tagOptions}
              sticky={sticky}
              onValues={setPreview}
              onSaved={(values) => {
                setSticky({ tags: values.tags, reverse: values.reverse });
                setSaved(values.front.trim());
                setLeaving(values);
                setRound((value) => value + 1);
              }}
            />
            <p
              key={round}
              role="status"
              className="text-theme-sm text-success-700 dark:text-success-400 motion-safe:animate-pop min-h-5"
            >
              {saved && `Gespeichert: ${saved}`}
            </p>
          </div>
        </ComponentCard>
      </div>
      <div className="space-y-6 self-start xl:sticky xl:top-6">
        {preview && (
          <PreviewStack
            round={round}
            values={preview}
            leaving={leaving}
            onLeft={() => setLeaving(null)}
            looks={looks}
          />
        )}
        {aside}
      </div>
    </div>
  );
}

function QuickAddForm({
  deckId,
  genders,
  language,
  dictation,
  tagOptions,
  sticky,
  onValues,
  onSaved,
}: {
  deckId: string;
  genders: boolean;
  language: string;
  dictation: string | null;
  tagOptions: TagLook[];
  sticky: Sticky;
  /** Meldet jeden Stand nach oben, für die Vorschau. */
  onValues: (values: CardValues) => void;
  onSaved: (values: CardValues) => void;
}) {
  const form = useRef<HTMLFormElement>(null);
  // Einmal festgehalten: Ein neues Objekt je Rendern liesse die Vorschau
  // pausenlos neu melden, und die Antwort des Servers käme nie an die Reihe.
  const [empty] = useState<CardValues>(() => ({
    deckId,
    front: "",
    back: "",
    example: "",
    note: "",
    gender: "",
    genderTouched: false,
    ...sticky,
  }));
  const draft = useFormDraft<CardValues>(`karte-neu:${deckId}`, empty);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const duplicates = useDuplicates(draft.values.front);
  useEffect(() => onValues(draft.values), [draft.values, onValues]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    const values = draft.values;
    const result = await draft.submit(() => createCardAction(draftOf(values)));
    setPending(false);
    if (result.ok) {
      onSaved(values);
      return;
    }
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
      <AssistedFields
        values={draft.values}
        setValues={(next) => {
          draft.setValues(next);
          if (Object.keys(fields).length) setFields({});
        }}
        fields={fields}
        genders={genders}
        duplicates={duplicates}
        language={language}
        dictation={dictation}
        tagOptions={tagOptions}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Wird gespeichert …" : "Speichern"}
        </Button>
        <span className="text-theme-xs text-gray-500 dark:text-gray-400">
          Enter speichert.
        </span>
      </div>
    </form>
  );
}
