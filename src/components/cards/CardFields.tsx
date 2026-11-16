"use client"; // Gesteuerte Felder.

import type { ReactNode } from "react";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { genderFromArticle } from "@/lib/cards/gender";
import type { Gender } from "@/lib/languages/catalog";
import type { Duplicate } from "@/lib/queries/cards";
import DuplicateNotice from "./DuplicateNotice";
import GenderField from "./GenderField";

export type CardValues = {
  deckId: string;
  front: string;
  back: string;
  example: string;
  note: string;
  gender: Gender | "";
  tags: string;
  reverse: boolean;
  /** Ob das Genus von Hand gesetzt ist; sonst folgt es dem Artikel. */
  genderTouched: boolean;
};

export type AssistField = "front" | "back" | "example";

/** Was das Diktat und die Vorschläge an den Feldern zeigen (`useCardAssist`). */
export type FieldAssist = {
  /** Felder, für die gerade ein Vorschlag kommt: grau, sie atmen leise. */
  loading: ReadonlySet<AssistField>;
  /** Was diktiert wurde, grau in der Vorderseite, bis der Vorschlag da ist. */
  ghost: string;
  /** Zählt je Feld die Vorschläge; ein neuer kommt weich herein. */
  revealed: Partial<Record<AssistField, number>>;
  frontHint?: ReactNode;
  exampleAction?: ReactNode;
};

const NO_ASSIST: FieldAssist = { loading: new Set(), ghost: "", revealed: {} };

export default function CardFields({
  values,
  onChange,
  fields,
  genders,
  duplicates,
  autoFocus = false,
  assist = NO_ASSIST,
}: {
  values: CardValues;
  onChange: (next: CardValues) => void;
  fields: Record<string, string>;
  /** Ob die Sprache ein Genus kennt; sonst gibt es das Feld nicht. */
  genders: boolean;
  duplicates: Duplicate[];
  autoFocus?: boolean;
  assist?: FieldAssist;
}) {
  // Ein neuer Schlüssel je Vorschlag baut das Feld neu, und es kommt weich herein.
  const keyOf = (field: AssistField) =>
    `${field}-${assist.revealed[field] ?? 0}`;
  const busy = (field: AssistField) => ({
    readOnly: assist.loading.has(field),
    className: assist.loading.has(field)
      ? "motion-safe:animate-pulse"
      : assist.revealed[field]
        ? "motion-safe:animate-reveal"
        : "",
  });
  const set = (patch: Partial<CardValues>) => onChange({ ...values, ...patch });

  function setFront(front: string) {
    const fromArticle = genderFromArticle(front);
    set({
      front,
      gender:
        genders && !values.genderTouched ? (fromArticle ?? "") : values.gender,
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="card-front">Vorderseite</Label>
          <Input
            key={keyOf("front")}
            {...busy("front")}
            placeholder={assist.loading.has("front") ? assist.ghost : undefined}
            id="card-front"
            autoFocus={autoFocus}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={values.front}
            onChange={(event) => setFront(event.target.value)}
            error={Boolean(fields.front)}
            hint={fields.front}
          />
          <DuplicateNotice duplicates={duplicates} />
          {assist.frontHint}
        </div>
        <div>
          <Label htmlFor="card-back">Rückseite</Label>
          <Input
            key={keyOf("back")}
            {...busy("back")}
            id="card-back"
            autoComplete="off"
            value={values.back}
            onChange={(event) => set({ back: event.target.value })}
            error={Boolean(fields.back)}
            hint={fields.back}
          />
        </div>
      </div>

      {genders && (
        <GenderField
          value={values.gender}
          onChange={(gender) => set({ gender, genderTouched: true })}
        />
      )}

      <div>
        <div className="flex items-end justify-between gap-3">
          <Label htmlFor="card-example">Beispielsatz</Label>
          {assist.exampleAction}
        </div>
        <Input
          key={keyOf("example")}
          {...busy("example")}
          id="card-example"
          autoComplete="off"
          value={values.example}
          onChange={(event) => set({ example: event.target.value })}
          error={Boolean(fields.example)}
          hint={fields.example}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="card-tags">Tags</Label>
          <Input
            id="card-tags"
            autoComplete="off"
            autoCapitalize="none"
            value={values.tags}
            onChange={(event) => set({ tags: event.target.value })}
            error={Boolean(fields.tags)}
            hint={fields.tags ?? "Mit Komma oder Leerzeichen getrennt."}
          />
        </div>
        <div>
          <Label htmlFor="card-note">Notiz</Label>
          <Input
            id="card-note"
            autoComplete="off"
            value={values.note}
            onChange={(event) => set({ note: event.target.value })}
            error={Boolean(fields.note)}
            hint={fields.note}
          />
        </div>
      </div>

      <Checkbox
        id="card-reverse"
        label="Auch rückwärts lernen"
        checked={values.reverse}
        onChange={(reverse) => set({ reverse })}
      />
    </div>
  );
}

/** Was an den Server geht: ohne den Merker fürs Genus. */
export function draftOf(values: CardValues) {
  return {
    deckId: values.deckId,
    front: values.front,
    back: values.back,
    example: values.example,
    note: values.note,
    gender: values.gender,
    tags: values.tags,
    reverse: values.reverse,
  };
}
