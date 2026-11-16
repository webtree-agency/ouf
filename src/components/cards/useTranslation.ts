"use client";

import { useEffect, useState } from "react";

import type { Translation } from "@/lib/capture/suggest";

// Länger als die Rechtschreibung: Jede Anfrage kostet ein paar Tokens.
const DEBOUNCE_MS = 900;

/**
 * Schlägt zur Vorderseite die Rückseite vor, solange diese leer ist. Was
 * schon gefragt wurde, kommt aus dem Gedächtnis, nicht noch einmal vom Modell.
 */
export function useTranslation(
  front: string,
  enabled: boolean,
): Translation | null {
  const [known, setKnown] = useState<
    Readonly<Record<string, Translation | null>>
  >({});
  const value = front.trim();

  useEffect(() => {
    if (!enabled || value.length < 2 || value in known) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/uebersetzung?${new URLSearchParams({ text: value })}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const body = (await response.json()) as {
          translation: Translation | null;
        };
        setKnown((current) => ({ ...current, [value]: body.translation }));
      } catch {
        // Abgebrochen, weil weitergetippt wurde.
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, enabled, known]);

  return enabled ? (known[value] ?? null) : null;
}
