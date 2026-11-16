"use client"; // Chips, Eingabe und Vorschläge.

import Link from "next/link";
import { useState } from "react";

import type { TagLook } from "@/lib/tags/colors";
import { normalizeTags } from "@/lib/validation/fields";
import TagChip, { lookOf } from "./TagChip";

const SHOWN = 12;

/**
 * **Tags als Chips.** Antippen wählt einen vorhandenen, Enter oder Komma legt
 * einen neuen an (er erscheint danach unter „Tags", grau). Der Wert bleibt
 * Text, durch Leerzeichen getrennt, wie ihn das Formular immer hatte.
 */
export default function TagInput({
  id,
  value,
  onChange,
  options,
  error,
}: {
  id: string;
  value: string;
  onChange: (tags: string) => void;
  options: TagLook[];
  error?: string;
}) {
  const [typed, setTyped] = useState("");
  const [focused, setFocused] = useState(false);
  const chosen = normalizeTags(value);
  const looks = new Map(options.map((tag) => [tag.name, tag]));
  const query = normalizeTags(typed)[0] ?? "";
  const matches = options
    .filter((tag) => !chosen.includes(tag.name) && tag.name.includes(query))
    .slice(0, SHOWN);

  const set = (names: string[]) => onChange(names.join(" "));
  function add(raw: string) {
    const names = normalizeTags(raw);
    if (names.length) set([...new Set([...chosen, ...names])]);
    setTyped("");
  }

  return (
    <div>
      <div
        className={`shadow-theme-xs flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1.5 ${
          error
            ? "border-error-500"
            : focused
              ? "border-brand-500 ring-brand-500/20 dark:border-brand-800 ring-3"
              : "border-gray-300 dark:border-gray-700"
        }`}
      >
        {chosen.map((name) => (
          <TagChip key={name} tag={lookOf(name, looks)}>
            <button
              type="button"
              onClick={() => set(chosen.filter((tag) => tag !== name))}
              aria-label={`${name} entfernen`}
              className="-mr-1 ml-0.5 opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </TagChip>
        ))}
        <input
          id={id}
          value={typed}
          autoComplete="off"
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            if (typed.trim()) add(typed);
          }}
          onChange={(event) => {
            const next = event.target.value;
            if (/[,\s]$/.test(next)) add(next);
            else setTyped(next);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && typed.trim()) {
              event.preventDefault();
              add(typed);
            }
            if (event.key === "Backspace" && !typed && chosen.length)
              set(chosen.slice(0, -1));
          }}
          className="text-theme-sm h-8 min-w-24 flex-1 bg-transparent px-1 text-gray-800 focus:outline-hidden dark:text-white/90"
        />
      </div>
      {focused && matches.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {matches.map((tag) => (
            <button
              key={tag.name}
              type="button"
              // Vor dem Blur, sonst nähme das Feld erst den getippten Rest.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => add(tag.name)}
              className="rounded-full opacity-70 transition hover:opacity-100"
            >
              <TagChip tag={tag} />
            </button>
          ))}
        </div>
      )}
      <p
        className={`text-theme-xs mt-1.5 ${error ? "text-error-500" : "text-gray-500 dark:text-gray-400"}`}
      >
        {error ?? (
          <>
            Antippen wählt, Enter legt einen neuen an.{" "}
            <Link href="/decks/tags" className="link-underline">
              Tags verwalten
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
