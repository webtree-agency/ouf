"use client"; // Der Zurücksetzen-Link liest die Adresse; gefiltert wird auf dem Server.

import Link from "next/link";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useQueryHref } from "@/hooks/useQueryHref";

// Wörtliche Klassen statt gebauter Strings — Tailwind sieht nur, was dasteht.
// Am Handy zwei Auswahlen nebeneinander, die Suche über die ganze Breite:
// untereinander schob die Filterkarte die Liste aus dem ersten Bildschirm.
const GRID = {
  2: "grid grid-cols-2 gap-4",
  3: "grid grid-cols-2 gap-4 lg:grid-cols-3",
  4: "grid grid-cols-2 gap-4 lg:grid-cols-4",
} as const;

const FULL_ROW = {
  2: "col-span-2",
  3: "col-span-2 lg:col-span-3",
  4: "col-span-2 lg:col-span-4",
} as const;

export type FilterBarColumns = keyof typeof GRID;

/**
 * Das Suchfeld in der Filterkarte. Zustand und Entprellen bleiben beim
 * Aufrufer (`useUrlSearch`) — nur er kann den Text bei „Filter zurücksetzen"
 * mit abräumen.
 */
export function FilterSearch({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="col-span-2 lg:col-span-1">
      <Label htmlFor={id}>Suchen</Label>
      <Input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/**
 * Die Filterkarte über einer Liste — ohne Titelzeile, damit sie kompakt bleibt
 * (Noah, 9.2). „Filter zurücksetzen" steht erst da, wenn eine Auswahl greift.
 */
export default function FilterBar({
  columns = 4,
  params,
  onReset,
  children,
}: {
  columns?: FilterBarColumns;
  /**
   * Alle Adress-Parameter der Liste. Weglassen, wo immer etwas gewählt ist
   * (`fallback`-Filter) — dann gibt es nichts zurückzusetzen.
   */
  params?: string[];
  /** Räumt lokalen Zustand mit ab — etwa den Text im Suchfeld. */
  onReset?: () => void;
  children: React.ReactNode;
}) {
  const { params: inUrl, href } = useQueryHref();
  const gefiltert = params?.some((name) => inUrl.get(name)) ?? false;

  return (
    <ComponentCard>
      <div className={GRID[columns]}>
        {children}
        {gefiltert && params && (
          <div className={FULL_ROW[columns]}>
            <Link
              href={href(
                Object.fromEntries(params.map((name) => [name, null])),
              )}
              scroll={false}
              onClick={onReset}
              className="text-theme-sm link-brand"
            >
              Filter zurücksetzen
            </Link>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}
