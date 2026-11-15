/**
 * **Ein Formularstand, der den Browser überlebt.** Was in einem Formular steht,
 * lebt sonst allein im Zustand der Komponente: Eine geworfene Server Action
 * tauscht die Seite gegen die Fehlergrenze, ein Neuladen wirft sie weg, und die
 * halbe Rechnung ist getippt wie nie (Jann, 04.09.2026).
 *
 * Der Stand gehört ins Gerät und in keine Tabelle — niemand sonst braucht ihn,
 * und eine Zeile je Tastendruck will niemand. Diese Datei rechnet nur; das
 * Lesen und Schreiben steht in `hooks/useFormDraft.ts`.
 */

export type Draft<T> = { savedAt: number; values: T };

/**
 * Nach einer Woche ist ein nicht gespeicherter Stand keine Hilfe mehr, sondern
 * eine Überraschung: Niemand erkennt darin noch, was er sich damals gedacht hat.
 */
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Alle Entwürfe unter einem Präfix, damit man sie im Speicher wiedererkennt. */
export function draftStorageKey(key: string): string {
  return `entwurf:${key}`;
}

export function serializeDraft<T>(values: T, savedAt: number): string {
  return JSON.stringify({ savedAt, values });
}

/**
 * Was im Speicher steht, kommt von früher: eine ältere Fassung des Formulars,
 * ein abgebrochener Schreibvorgang, eine fremde Erweiterung. Alles, was nicht
 * die erwartete Form hat oder zu alt ist, gilt deshalb als nicht vorhanden.
 */
export function parseDraft<T>(
  raw: string | null,
  now: number,
): Draft<T> | null {
  if (!raw) return null;

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof value !== "object" || value === null) return null;
  const draft = value as { savedAt?: unknown; values?: unknown };
  if (typeof draft.savedAt !== "number" || !Number.isFinite(draft.savedAt)) {
    return null;
  }
  if (draft.values === undefined) return null;
  if (now - draft.savedAt > DRAFT_MAX_AGE_MS) return null;

  return { savedAt: draft.savedAt, values: draft.values as T };
}

/**
 * Ein gemerkter Stand, der dem des Servers gleicht, ist keiner — er wäre nur
 * eine Meldung über nichts.
 */
export function sameValues(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
