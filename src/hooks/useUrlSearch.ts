"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useQueryHref } from "@/hooks/useQueryHref";

// Lang genug, dass ein getippter Name nicht jede Zwischenstufe abfragt (§3).
const DEBOUNCE_MS = 300;

/**
 * Ein Suchfeld, das entprellt in die Adresse schreibt. Gesucht wird auf dem
 * Server — hier steht nur, was in der Adresse landet, und deshalb überlebt die
 * Suche das Neuladen und den Zurück-Knopf (§3).
 *
 * **Die Seitenzahl fällt mit**: Wer tippt, will den ersten Treffer sehen, nicht
 * Seite vier einer anderen Liste.
 */
export function useUrlSearch(param: string): [string, (value: string) => void] {
  const router = useRouter();
  const { params, href } = useQueryHref();
  const inUrl = params.get(param) ?? "";
  const [query, setQuery] = useState(inUrl);

  useEffect(() => {
    if (query === inUrl) return;

    const timer = setTimeout(
      () =>
        router.replace(href({ [param]: query, seite: null }), {
          scroll: false,
        }),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query, inUrl, href, router, param]);

  return [query, setQuery];
}
