"use client"; // Umdrehen auf Antippen.

import { useState } from "react";

import TagChip, { lookOf } from "@/components/tags/TagChip";
import { GENDER_LABELS } from "@/lib/languages/catalog";
import type { TagLook } from "@/lib/tags/colors";
import { normalizeTags } from "@/lib/validation/fields";
import type { CardValues } from "./CardFields";

/**
 * **Die Karte, wie sie beim Lernen aussieht**, während man sie erfasst.
 * Antippen dreht sie um. Leere Seiten stehen grau als Platzhalter da.
 */
function CardPreview({
  values,
  looks,
}: {
  values: CardValues;
  looks: ReadonlyMap<string, TagLook>;
}) {
  const [back, setBack] = useState(false);
  const tags = normalizeTags(values.tags);

  return (
    <button
      type="button"
      onClick={() => setBack((value) => !value)}
      aria-label="Karte umdrehen"
      aria-pressed={back}
      className="shadow-theme-sm flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-8 text-center transition hover:border-gray-300 active:scale-99 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
    >
      <span
        key={back ? "back" : "front"}
        className="motion-safe:animate-reveal flex flex-col items-center gap-2"
      >
        {back ? (
          <>
            <Face text={values.back} placeholder="Rückseite" lang="de" />
            {values.gender && (
              <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                {GENDER_LABELS[values.gender]}
              </span>
            )}
            {values.example && (
              <span
                lang="fr"
                className="mt-3 text-base text-gray-700 dark:text-gray-300"
              >
                {values.example}
              </span>
            )}
          </>
        ) : (
          <Face text={values.front} placeholder="Vorderseite" lang="fr" />
        )}
      </span>
      {tags.length > 0 && (
        <span className="mt-6 flex flex-wrap justify-center gap-1.5">
          {tags.map((name) => (
            <TagChip key={name} tag={lookOf(name, looks)} />
          ))}
        </span>
      )}
    </button>
  );
}

function Face({
  text,
  placeholder,
  lang,
}: {
  text: string;
  placeholder: string;
  lang: string;
}) {
  return text.trim() ? (
    <span
      lang={lang}
      className="text-title-sm break-words text-gray-800 dark:text-white/90"
    >
      {text}
    </span>
  ) : (
    <span className="text-title-sm text-gray-300 dark:text-gray-700">
      {placeholder}
    </span>
  );
}

/**
 * Beim Speichern gleitet die gespeicherte Karte hinaus, und die leere kommt
 * herein (`round` wechselt mit jedem Speichern).
 */
export function PreviewStack({
  round,
  values,
  leaving,
  onLeft,
  looks,
}: {
  round: number;
  values: CardValues;
  leaving: CardValues | null;
  onLeft: () => void;
  looks: ReadonlyMap<string, TagLook>;
}) {
  return (
    <section>
      <h2 className="eyebrow bg-brand-100 dark:bg-brand-300/15 mb-3">
        Vorschau
      </h2>
      <div className="relative">
        {leaving && (
          <div
            aria-hidden
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) onLeft();
            }}
            className="motion-safe:animate-card-out-right pointer-events-none absolute inset-x-0 top-0 z-1 motion-reduce:hidden"
          >
            <CardPreview values={leaving} looks={looks} />
          </div>
        )}
        <div key={round} className="motion-safe:animate-card-in">
          <CardPreview values={values} looks={looks} />
        </div>
      </div>
      <p className="text-theme-xs mt-2 text-center text-gray-500 dark:text-gray-400">
        Antippen dreht die Karte um.
      </p>
    </section>
  );
}
