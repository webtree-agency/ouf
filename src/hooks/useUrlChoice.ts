"use client";

import { useRouter } from "next/navigation";

import { useQueryHref } from "@/hooks/useQueryHref";

/**
 * Eine Auswahl, die in der Adresse steht: teilbar, überlebt das Neuladen, und
 * der Server liest denselben Wert. Zwei Bedienelemente zeigen sie verschieden
 * an — die Mechanik dahinter gibt es nur einmal.
 */
export function useUrlChoice(
  param: string,
  options: {
    /** Wert, der nicht in die Adresse geschrieben wird, weil er ohnehin gilt. */
    defaultValue?: string;
    /** Werte, die mit dieser Auswahl hinfällig werden — etwa die Seitenzahl. */
    resets?: string[];
  } = {},
): [string, (value: string) => void] {
  const router = useRouter();
  const { params, href } = useQueryHref();
  const selected = params.get(param) ?? options.defaultValue ?? "";

  function set(value: string) {
    const changes: Record<string, string | null> = {
      [param]: value === options.defaultValue ? null : value,
    };
    for (const key of options.resets ?? []) changes[key] = null;

    // Ohne `scroll: false` springt die Seite nach oben, und man sucht die
    // Zeile wieder, bei der man gerade war.
    router.replace(href(changes), { scroll: false });
  }

  return [selected, set];
}
