"use client";

import { useEffect, useState } from "react";

const DEBOUNCE_MS = 200;

/** Treffer aus `api/emoji`: zur Suche, sonst passend zum Namen des Felds daneben. */
export function useEmojiSearch(
  query: string,
  name: string,
  open: boolean,
): string[] {
  const key = query.trim() ? `suche:${query.trim()}` : `name:${name.trim()}`;
  const [result, setResult] = useState<{ key: string; emoji: string[] }>({
    key: "",
    emoji: [],
  });

  useEffect(() => {
    if (!open || key === "name:") return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const [kind, value] = [
        key.slice(0, key.indexOf(":")),
        key.slice(key.indexOf(":") + 1),
      ];
      try {
        const response = await fetch(
          `/api/emoji?${new URLSearchParams({ [kind]: value })}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const body = (await response.json()) as { emoji: string[] };
        setResult({ key, emoji: body.emoji });
      } catch {
        // Abgebrochen, weil weitergetippt wurde.
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, open]);

  return result.key === key ? result.emoji : [];
}
