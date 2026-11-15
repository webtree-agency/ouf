"use client"; // Die Auswahl schreibt in die Adresse; gefiltert wird auf dem Server.

import type { ReactNode } from "react";

import Label from "@/components/form/Label";
import SearchSelect from "@/components/form/SearchSelect";
import { SEARCH_FROM } from "@/components/form/searchFrom";
import { selectClass } from "@/components/form/selectClass";
import { useUrlChoice } from "@/hooks/useUrlChoice";
import { ChevronDownIcon } from "@/icons";

export type FilterOption = { value: string; label: string };

export default function FilterSelect({
  param,
  label,
  options,
  allLabel,
  fallback,
  resets = ["seite"],
  leading,
  search = options.length >= SEARCH_FROM,
}: {
  param: string;
  label: string;
  options: FilterOption[];
  /**
   * Was der leere Wert heisst — „Alle Websites". **Nur für Kriterien, bei denen
   * „nichts gewählt" wirklich etwas anderes bedeutet als jede Option.**
   */
  allLabel?: string;
  /**
   * Die Vorgabe, wenn in der Adresse nichts steht — für Kriterien, die immer
   * einen Wert haben. **Ohne das stand die Vorgabe zweimal in der Liste:**
   * einmal als leerer Eintrag „28 Tage" und einmal als Option „28 Tage",
   * und man sah nicht, welcher der beiden gerade galt.
   */
  fallback?: string;
  /**
   * Werte, die mit dieser Auswahl hinfällig werden. **Die Seitenzahl ist immer
   * dabei** — sie stand einundfünfzigmal von Hand da, und wer sie einmal
   * vergisst, landet nach dem Filtern auf Seite 4 von 2. Wer mehr zurücksetzt,
   * gibt die Seite mit an.
   */
  resets?: string[];
  /** Ein Bild links im Feld — die Person beim Filter „Zuständig". */
  leading?: ReactNode;
  /**
   * Gesucht statt geklappt — von selbst ab `SEARCH_FROM` Einträgen, wie bei
   * `SelectField`. **Personen sucht man immer** (Jann, 23.10.2026): Einen
   * Namen tippt man, auch wenn es erst drei sind.
   */
  search?: boolean;
}) {
  const [selected, set] = useUrlChoice(param, { resets });

  if (search) {
    return (
      <SearchSelect
        id={`filter-${param}`}
        label={label}
        choices={options}
        value={selected || fallback || null}
        onChange={(value) => set(value ?? "")}
        emptyLabel={fallback === undefined ? (allLabel ?? "Alle") : undefined}
      />
    );
  }

  return (
    <div>
      <Label htmlFor={`filter-${param}`}>{label}</Label>
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
            {leading}
          </span>
        )}
        <select
          id={`filter-${param}`}
          className={`${selectClass()} ${leading ? "pl-11" : ""}`}
          value={selected || (fallback ?? "")}
          onChange={(event) => set(event.target.value)}
        >
          {fallback === undefined && (
            <option value="">{allLabel ?? "Alle"}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <ChevronDownIcon />
        </span>
      </div>
    </div>
  );
}
