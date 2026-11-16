"use client"; // Gesteuerte Felder.

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { genderFromArticle } from "@/lib/cards/gender";
import type { Gender } from "@/lib/languages/catalog";
import type { Duplicate } from "@/lib/queries/cards";
import BackField from "./BackField";
import {
  assistKey,
  assistState,
  NO_ASSIST,
  Side,
  type AssistField,
  type FieldAssist,
} from "./fieldAssist";
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

export default function CardFields({
  values,
  onChange,
  fields,
  genders,
  duplicates,
  autoFocus = false,
  assist = NO_ASSIST,
  languageName,
}: {
  values: CardValues;
  onChange: (next: CardValues) => void;
  fields: Record<string, string>;
  /** Ob die Sprache ein Genus kennt; sonst gibt es das Feld nicht. */
  genders: boolean;
  duplicates: Duplicate[];
  autoFocus?: boolean;
  assist?: FieldAssist;
  /** Steht über der Vorderseite, damit klar ist, was wohin gehört. */
  languageName?: string;
}) {
  const keyOf = (field: AssistField) => assistKey(assist, field);
  const busy = (field: AssistField) => assistState(assist, field);
  const suggestion = values.back ? null : (assist.backSuggestion ?? null);
  const set = (patch: Partial<CardValues>) => onChange({ ...values, ...patch });

  function acceptBack() {
    if (!suggestion) return;
    set({
      back: suggestion.back,
      gender:
        genders && !values.genderTouched
          ? suggestion.gender || values.gender
          : values.gender,
    });
  }

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
          <Label htmlFor="card-front">
            Vorderseite
            {languageName && <Side>{languageName}</Side>}
          </Label>
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
        <BackField
          key={keyOf("back")}
          busy={busy("back")}
          side={languageName && <Side>Deutsch</Side>}
          value={values.back}
          onChange={(back) => set({ back })}
          error={fields.back}
          suggestion={suggestion?.back ?? null}
          onAccept={acceptBack}
        />
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
