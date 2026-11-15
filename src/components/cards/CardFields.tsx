"use client"; // Gesteuerte Felder.

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { genderFromArticle } from "@/lib/cards/gender";
import { GENDER_LABELS, type Gender } from "@/lib/languages/catalog";
import type { Duplicate } from "@/lib/queries/cards";

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

const GENDERS: { value: Gender | ""; label: string }[] = [
  { value: "m", label: "m" },
  { value: "f", label: "f" },
  { value: "", label: "–" },
];

export default function CardFields({
  values,
  onChange,
  fields,
  genders,
  duplicates,
  autoFocus = false,
}: {
  values: CardValues;
  onChange: (next: CardValues) => void;
  fields: Record<string, string>;
  /** Ob die Sprache ein Genus kennt; sonst gibt es das Feld nicht. */
  genders: boolean;
  duplicates: Duplicate[];
  autoFocus?: boolean;
}) {
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
          {duplicates.length > 0 && (
            <p
              role="status"
              className="text-theme-xs text-warning-700 dark:text-warning-400 mt-1.5"
            >
              Gibt es schon:{" "}
              {duplicates
                .map(
                  (duplicate) =>
                    `${duplicate.front} · ${duplicate.back} (${duplicate.deckName})`,
                )
                .join("; ")}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="card-back">Rückseite</Label>
          <Input
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
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">
            Genus
          </legend>
          <div className="inline-flex rounded-lg border border-gray-300 p-0.5 dark:border-gray-700">
            {GENDERS.map((option) => (
              <label
                key={option.value || "keins"}
                title={
                  option.value ? GENDER_LABELS[option.value] : "kein Genus"
                }
                className={`text-theme-sm has-focus-visible:ring-brand-500 flex h-10 min-w-12 cursor-pointer items-center justify-center rounded-md px-3 font-medium has-focus-visible:ring-2 ${
                  values.gender === option.value
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-300/10 dark:text-brand-300"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                }`}
              >
                <input
                  type="radio"
                  name="card-gender"
                  value={option.value}
                  checked={values.gender === option.value}
                  onChange={() =>
                    set({ gender: option.value, genderTouched: true })
                  }
                  className="sr-only"
                />
                <span aria-hidden>{option.label}</span>
                <span className="sr-only">
                  {option.value ? GENDER_LABELS[option.value] : "kein Genus"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <Label htmlFor="card-example">Beispielsatz</Label>
        <Input
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
