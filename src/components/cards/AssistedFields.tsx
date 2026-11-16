"use client"; // Diktat, Vorschläge und Rechtschreibung an den Feldern.

import { useRef } from "react";

import { SparkIcon } from "@/icons";
import { genderFromArticle } from "@/lib/cards/gender";
import type { Duplicate } from "@/lib/queries/cards";
import CardFields, { type CardValues } from "./CardFields";
import Dictate from "./Dictate";
import { useCardAssist } from "./useCardAssist";
import { useSpelling } from "./useSpelling";
import { useTranslation } from "./useTranslation";

/** Die Felder der Schnellerfassung, mit allem, was beim Erfassen hilft. */
export default function AssistedFields({
  values,
  setValues,
  fields,
  genders,
  duplicates,
  language,
  dictation,
}: {
  values: CardValues;
  setValues: (next: (current: CardValues) => CardValues) => void;
  fields: Record<string, string>;
  genders: boolean;
  duplicates: Duplicate[];
  language: string;
  /** Ob Diktat und Vorschläge eingerichtet sind. */
  dictation: string | null;
}) {
  const box = useRef<HTMLDivElement>(null);
  const assist = useCardAssist({
    genders,
    update: setValues,
    // Enter in der Vorderseite speichert, wie beim Tippen.
    focusFront: () =>
      requestAnimationFrame(() =>
        box.current?.querySelector<HTMLElement>("#card-front")?.focus(),
      ),
  });
  const corrections = useSpelling(values.front, assist.busy);
  const translation = useTranslation(
    values.front,
    Boolean(dictation) && !values.back && !assist.busy,
  );

  function applyCorrection(front: string) {
    setValues((current) => ({
      ...current,
      front,
      gender:
        genders && !current.genderTouched
          ? (genderFromArticle(front) ?? "")
          : current.gender,
    }));
  }

  return (
    <div ref={box} className="space-y-4">
      {dictation && (
        <Dictate
          language={dictation}
          busy={assist.busy}
          suggested={assist.hasSuggestion}
          error={assist.error}
          onAudio={assist.dictated}
          onSuggest={() => assist.suggest(values)}
          onError={assist.setError}
        />
      )}
      <CardFields
        values={values}
        onChange={(next) => setValues(() => next)}
        fields={fields}
        genders={genders}
        duplicates={duplicates}
        autoFocus
        languageName={language}
        assist={{
          ...assist.fields,
          backSuggestion: translation,
          frontHint: corrections.length > 0 && (
            <p className="text-theme-xs motion-safe:animate-reveal mt-1.5 flex flex-wrap items-center gap-x-1 gap-y-1 text-gray-600 dark:text-gray-300">
              Meintest du
              {corrections.map((option, index) => (
                <span key={option}>
                  {index > 0 && "oder "}
                  <button
                    type="button"
                    onClick={() => applyCorrection(option)}
                    className="link-brand"
                  >
                    {option}
                  </button>
                  {index === corrections.length - 1 && "?"}
                </span>
              ))}
            </p>
          ),
          exampleAction: dictation && (
            <button
              type="button"
              onClick={() => assist.example(values)}
              disabled={assist.busy}
              className="text-theme-xs -mt-3 mb-0 flex min-h-11 items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 dark:text-gray-300 dark:hover:text-white"
            >
              <SparkIcon />
              {values.example ? "Anderer Satz" : "Satz vorschlagen"}
            </button>
          ),
        }}
      />
    </div>
  );
}
