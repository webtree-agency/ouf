// Fehler kommen als anzeigbarer Text zurück, nicht als Ausnahme.
export type ActionResult =
  | {
      ok: true;
      /**
       * Es hat geklappt, und trotzdem gibt es etwas zu sagen — bei einem
       * Stapel etwa, von dem eine Rechnung liegen geblieben ist. **Ein Erfolg
       * mit Nachsatz ist kein Fehler:** Wer daraus `ok: false` machte, liesse
       * die neunzehn verschickten Rechnungen wie einen Fehlschlag aussehen.
       */
      notice?: string;
    }
  | {
      ok: false;
      message: string;
      // `fields` sagt, an welchem Eingabefeld es liegt — leer, wenn es an keinem liegt.
      fields?: Record<string, string>;
      /**
       * Nicht die Eingabe ist schuld, sondern der zu alte Faktor. Die Oberfläche
       * hängt an diese Meldung den Bestätigungs-Knopf und wiederholt danach
       * (`useGuardedAction`) — deshalb steht in der Meldung kein Weg, sondern
       * nur der Grund.
       */
      reauth?: true;
      /** Es fehlt nicht der Faktor, sondern die Sitzung. Die Meldung bekommt den Weg zur Anmeldung. */
      signIn?: true;
    };

/** Der abgewiesene Zweig allein — für Stellen, die nie einen Erfolg zurückgeben. */
export type ActionFailure = Extract<ActionResult, { ok: false }>;

export function failed(
  message: string,
  fields?: Record<string, string>,
): ActionResult {
  return { ok: false, message, fields };
}

/**
 * **Der einzige Fehler, der sich selbst heilt.** Er verwies einmal auf einen
 * Streifen am Seitenkopf, und der stand dort nur, wenn die Seite schon mit
 * altem Faktor gebaut wurde. Wer beim Arbeiten über die 15 Minuten kam, las
 * „bitte oben bestätigen" und fand oben nichts (Jann, 11.08.2026).
 */
export const REAUTH_REQUIRED: ActionFailure = {
  ok: false,
  message:
    "Das verlangt eine frische Bestätigung. Nach dem Passkey läuft es von selbst weiter.",
  reauth: true,
};

/**
 * Zwölf Stunden ohne Betrieb, und die Sitzung ist weg. Das lässt sich an Ort
 * und Stelle nicht heilen, deshalb steht daneben der Weg zur Anmeldung und
 * nicht die Aufforderung, ihn zu suchen.
 */
export const SESSION_EXPIRED_MESSAGE = "Die Sitzung ist abgelaufen.";

export const SESSION_EXPIRED: ActionFailure = {
  ok: false,
  message: SESSION_EXPIRED_MESSAGE,
  signIn: true,
};

export const OK: ActionResult = { ok: true };

/** Geglückt, mit einem Satz daneben (siehe `notice`). */
export function okWith(notice: string): ActionResult {
  return { ok: true, notice };
}
