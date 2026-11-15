/**
 * Die zwei Gründe, aus denen eine Aktion abbricht, bevor sie etwas tut.
 *
 * **Sie stehen hier und nicht in `serverSession.ts`, weil das `next/headers`
 * mitbringt** — und was das lädt, lässt sich in einem Unit-Test nicht laden
 * (§5). Wer sie bisher von dort importiert hat, tut es weiterhin: die Datei
 * gibt sie unverändert weiter.
 */

// Server Actions sind von aussen aufrufbar wie jede Route — die Prüfung steckt in der Aktion.
export class NotAuthenticatedError extends Error {
  constructor() {
    super("Nicht angemeldet");
    this.name = "NotAuthenticatedError";
  }
}

export class ReauthenticationRequiredError extends Error {
  constructor() {
    super("Bitte erneut bestätigen");
    this.name = "ReauthenticationRequiredError";
  }
}
