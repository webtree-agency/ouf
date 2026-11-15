"use client"; // Die Auswahl schreibt in die Adresse; gerechnet wird auf dem Server.

import { SELECT_COMPACT } from "@/components/form/selectClass";
import { useUrlChoice } from "@/hooks/useUrlChoice";
import { ChevronDownIcon } from "@/icons";

/**
 * „Zeige [10] …" im Kopf einer Karte: eine kleine Auswahl über die **Ansicht**,
 * nicht über den Bestand. `PerPageSelect` und `ShareLimitSelect` trugen
 * denselben Rumpf zweimal (§2).
 */
export default function CompactUrlSelect({
  param,
  defaultValue,
  choices,
  resets,
  suffix,
  label = "Zeige",
}: {
  param: string;
  defaultValue: string;
  choices: readonly { value: string; label: string }[];
  /** Adressparameter, die mit der Wahl hinfällig werden — die Seitenzahl. */
  resets?: string[];
  suffix?: string;
  /** „Stand“ bei einem Filter in der Karte (Jann, 27.10.2026). */
  label?: string;
}) {
  const [selected, set] = useUrlChoice(param, { defaultValue, resets });

  return (
    <label className="text-theme-sm flex items-center gap-2 text-gray-500 dark:text-gray-400">
      {label}
      <span className="relative">
        <select
          className={SELECT_COMPACT}
          value={selected}
          onChange={(event) => set(event.target.value)}
        >
          {choices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <ChevronDownIcon className="size-4" />
        </span>
      </span>
      {suffix}
    </label>
  );
}
