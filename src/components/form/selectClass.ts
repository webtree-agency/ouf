/**
 * **Die eine Klassenkette für ein natives `<select>`.** Sie stand in sechs
 * Dateien je ein wenig anders — mal ohne Pfeil, mal ohne `w-full`, mal mit
 * anderem Innenabstand — und dasselbe Feld sah auf zwei Seiten verschieden aus.
 * Ohne `"use client"`, damit der Wert auch in einer Server-Komponente ein Wert
 * bleibt (Brain: use-client-konstante-…).
 */
export function selectClass(error = false): string {
  return `text-theme-sm focus:ring-brand-500/20 h-11 w-full appearance-none rounded-lg border bg-transparent px-4 pr-11 text-gray-800 focus:ring-3 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-900 dark:text-white/90 ${
    error
      ? "border-error-500 focus:border-error-300 dark:border-error-500"
      : "focus:border-brand-500 border-gray-300 dark:border-gray-700"
  }`;
}

/** Die kleine Fassung im Kopf einer Karte — „Zeige [10] Einträge". */
export const SELECT_COMPACT =
  "text-theme-sm focus:border-brand-500 focus:ring-brand-500/20 h-9 appearance-none rounded-lg border border-gray-300 bg-transparent py-0 pr-8 pl-3 text-gray-800 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

/**
 * Eine Wahl aus wenigen Knöpfen — Stufe, Gutschein, Zeitraum. Denselben Knopf
 * gab es dreimal mit je eigenem Rand und eigener Farbe.
 */
export function choiceClass(active: boolean, disabled = false): string {
  return `text-theme-sm inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 font-medium transition-colors ${
    active
      ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-300 dark:bg-brand-300/10 dark:text-brand-300"
      : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
  } ${disabled ? "cursor-not-allowed opacity-60" : ""}`;
}
