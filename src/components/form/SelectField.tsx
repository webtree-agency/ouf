import type { ReactNode } from "react";

import Label from "@/components/form/Label";
import SearchSelect from "@/components/form/SearchSelect";
import { SEARCH_FROM } from "@/components/form/searchFrom";
import { selectClass } from "@/components/form/selectClass";
import { ChevronDownIcon } from "@/icons";

/**
 * **Eine Auswahl mit Beschriftung, gesteuert von aussen.**
 *
 * `form/Select.tsx` aus dem Template hält seinen Wert selbst und taugt deshalb
 * nicht für ein Formular, dessen Werte beim Aufrufer liegen. Diese Klassenkette
 * stand vorher in einunddreissig Dateien Zeichen für Zeichen gleich (§2) — und
 * bei jeder Abweichung sah dasselbe Feld an zwei Stellen anders aus.
 */
export default function SelectField<T extends string>({
  id,
  label,
  ariaLabel,
  value,
  options,
  onChange,
  hint,
  error = false,
  disabled = false,
  search = options.length >= SEARCH_FROM,
  prompt,
  leading,
}: {
  id: string;
  label?: string;
  /**
   * Der Name für die Vorlesehilfe, wo eine sichtbare Beschriftung die Zeile
   * zerrisse — in den Öffnungszeiten stehen vier Felder nebeneinander. Als
   * eigene Eigenschaft, nicht als `aria-label` von aussen (wie `DatePicker`).
   */
  ariaLabel?: string;
  value: T;
  /** `dot` zeigt nur die Suchauswahl; ein natives `<select>` kann keine Farbe. */
  options: readonly { value: T; label: string; dot?: string }[];
  onChange: (value: T) => void;
  hint?: string;
  error?: boolean;
  disabled?: boolean;
  /**
   * Gesucht statt geklappt wird von selbst ab `SEARCH_FROM` Einträgen — eine
   * so lange Liste kommt aus Daten (Entscheid Jann, 17.09.2026). Die Uhrzeit
   * ist die Ausnahme: 96 Viertelstunden sind keine Daten, die klappt man.
   */
  search?: boolean;
  /**
   * Was im Feld steht, solange nichts gewählt ist. Nur die Suchauswahl kennt
   * das; ein natives `<select>` zeigt immer einen Eintrag.
   */
  prompt?: string;
  /** Ein Bild links im Feld — die Person bei „Zuständig". */
  leading?: ReactNode;
}) {
  if (search && !disabled) {
    return (
      <SearchSelect
        id={id}
        label={label}
        ariaLabel={ariaLabel}
        choices={options.map((option) => ({ ...option }))}
        value={value}
        prompt={prompt}
        onChange={(wert) => {
          if (wert !== null) onChange(wert as T);
        }}
        error={error}
        hint={hint}
      />
    );
  }

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      {/* Derselbe Pfeil wie bei `SearchSelect` und dem Template-`Select`: der
          native sieht in jedem Browser anders aus. */}
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
            {leading}
          </span>
        )}
        <select
          id={id}
          value={value}
          disabled={disabled}
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={error || undefined}
          // Ein `<select>` liefert Text; was darin stehen kann, sind die Werte
          // der Optionen — geprüft wird trotzdem auf dem Server (§3).
          onChange={(event) => onChange(event.target.value as T)}
          className={`${selectClass(error)} ${leading ? "pl-11" : ""}`}
        >
          {/* Ohne diese Zeile zeigte ein leerer Wert die erste Option, als wäre
              sie gewählt. */}
          {prompt && (
            <option value="" disabled hidden>
              {prompt}
            </option>
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
      {hint && (
        <p
          className={`mt-1.5 text-xs ${error ? "text-error-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
