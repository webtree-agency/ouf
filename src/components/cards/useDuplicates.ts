"use client";

import { useEffect, useState } from "react";

import type { Duplicate } from "@/lib/queries/cards";

const DEBOUNCE_MS = 300;

/** Fragt beim Tippen nach, ob es die Vorderseite in der Sprache schon gibt. */
export function useDuplicates(front: string, excludeId?: string): Duplicate[] {
  const [result, setResult] = useState<{
    front: string;
    duplicates: Duplicate[];
  }>({
    front: "",
    duplicates: [],
  });

  useEffect(() => {
    const value = front.trim();
    if (!value) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const params = new URLSearchParams({ vorderseite: value });
      if (excludeId) params.set("ausser", excludeId);
      try {
        const response = await fetch(`/api/dubletten?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const body = (await response.json()) as { duplicates: Duplicate[] };
        setResult({ front: value, duplicates: body.duplicates });
      } catch {
        // Abgebrochen, weil weitergetippt wurde: die nächste Anfrage ist unterwegs.
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [front, excludeId]);

  return front.trim() && result.front === front.trim() ? result.duplicates : [];
}
