"use client"; // Gesteuerte Felder.

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { genderFromArticle } from "@/lib/cards/gender";
import TagInput from "@/components/tags/TagInput";
import type { Gender } from "@/lib/languages/catalog";
import type { Duplicate } from "@/lib/queries/cards";
import type { TagLook } from "@/lib/tags/colors";
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
  tagOptions = [],
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
  /** Die Tags der Sprache, zum Antippen. */
  tagOptions?: TagLook[];
}) {
  const keyOf = (field: AssistField) => assistKey(assist, field);
  const busy = (field: AssistField) => assistState(assist, field);
  const set = (patch: Partial<CardValues>) => onChange({ ...values, ...patch });

  // Ein Artikel gewinnt immer, auch gegen eine Wahl von Hand; ohne Artikel
  // bleibt, was gewählt ist (oder was `useGenderGuess` erkannt hat).
  function setFront(front: string) {
    const fromArticle = genders ? genderFromArticle(front) : null;
    set({
      front,
      gender: fromArticle ?? (values.genderTouched ? values.gender : ""),
      genderTouched: fromArticle ? false : values.genderTouched,
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
          action={assist.backAction}
          value={values.back}
          onChange={(back) => set({ back })}
          error={fields.back}
        />
      </div>

      {genders && (
        <GenderField
          value={values.gender}
          onChange={(gender) => set({ gender, genderTouched: true })}
        />
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <Label htmlFor="card-example" className="mb-0">
            Beispielsatz
          </Label>
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
          <TagInput
            id="card-tags"
            value={values.tags}
            onChange={(tags) => set({ tags })}
            options={tagOptions}
            error={fields.tags}
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
        label={`Auch umgekehrt abfragen: Deutsch → ${languageName ?? "Fremdsprache"}`}
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
