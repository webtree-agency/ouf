import { failed, type ActionResult } from "../actionResult.ts";

/**
 * **Ein Aufruf, der die Fehlerseite nicht auslöst.** Wirft eine Server Action
 * unerwartet, tauscht React die Seite gegen die Fehlergrenze, und mit ihr ist
 * alles Getippte weg. Hier wird daraus eine Meldung: Das Formular bleibt
 * stehen, ein zweiter Versuch kostet einen Klick.
 */
export async function callAction(
  run: () => Promise<ActionResult>,
): Promise<ActionResult> {
  try {
    return await run();
  } catch (error) {
    // Eine Weiterleitung ist kein Fehler, sondern der Weg weiter.
    if (isNavigation(error)) throw error;
    return failed(unsavedMessage(error));
  }
}

/** Die Kennung steht auch im Server-Protokoll; damit ist der Fall auffindbar. */
export function unsavedMessage(error: unknown): string {
  const kennung = digestOf(error);

  return [
    "Gespeichert wurde nichts, deine Eingaben stehen noch im Formular.",
    kennung ? `Kennung: ${kennung}.` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function isNavigation(error: unknown): boolean {
  return digestOf(error)?.startsWith("NEXT_") ?? false;
}

function digestOf(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" ? digest : null;
}
