"use client";

import { useEffect, useRef } from "react";

import { genderFromArticle } from "@/lib/cards/gender";

// Wie die Rechtschreibung: gefragt wird, wenn man innehält.
const DEBOUNCE_MS = 800;

/**
 * **Genus ohne Artikel** („vérité", „l'eau"): fragt nach einer Pause und
 * meldet das Ergebnis mit dem Ausdruck, zu dem es gehört. Jeder Ausdruck wird
 * nur einmal gefragt.
 */
export function useGenderGuess(
  front: string,
  enabled: boolean,
  onGuess: (front: string, gender: "m" | "f") => void,
) {
  const asked = useRef(new Set<string>());
  const report = useRef(onGuess);
  useEffect(() => {
    report.current = onGuess;
  });

  useEffect(() => {
    const value = front.trim();
    if (!enabled || value.length < 2 || genderFromArticle(value)) return;
    if (asked.current.has(value)) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/genus?${new URLSearchParams({ text: value })}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        asked.current.add(value);
        const body = (await response.json()) as { gender: "m" | "f" | null };
        if (body.gender) report.current(value, body.gender);
      } catch {
        // Abgebrochen, weil weitergetippt wurde.
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [front, enabled]);
}
