"use client";

import { usePathname, useSearchParams } from "next/navigation";

/**
 * Filter, Sortierung und Seite stehen in der Adresse: teilbar, überlebt das
 * Neuladen, und gefiltert wird auf dem Server. Diese Hilfe baut die nächste
 * Adresse, ohne die übrigen Werte zu verlieren — ein leerer Wert fällt heraus.
 */
export function useQueryHref() {
  const pathname = usePathname();
  const params = useSearchParams();

  return {
    params,
    href(changes: Record<string, string | null>): string {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      return next.size ? `${pathname}?${next}` : pathname;
    },
  };
}
