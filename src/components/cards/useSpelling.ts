"use client";

import { useEffect, useState } from "react";

// Länger als bei den Dubletten: geprüft wird, wenn man innehält, nicht bei jedem Buchstaben.
const DEBOUNCE_MS = 700;

/** Fragt LanguageTool, ob die Vorderseite richtig geschrieben ist (`api/rechtschreibung`). */
export function useSpelling(front: string, paused: boolean): string | null {
  const [result, setResult] = useState<{
    front: string;
    correction: string | null;
  }>({ front: "", correction: null });

  useEffect(() => {
    const value = front.trim();
    if (!value || paused) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/rechtschreibung?${new URLSearchParams({ text: value })}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const body = (await response.json()) as { correction: string | null };
        setResult({ front: value, correction: body.correction });
      } catch {
        // Abgebrochen, weil weitergetippt wurde.
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [front, paused]);

  return result.front === front.trim() ? result.correction : null;
}
