"use client"; // Hält Fehler, Ladezustand und den Versuch, der wiederholt werden soll.

import { useId, useState, useTransition } from "react";

import type { ActionResult } from "@/lib/actionResult";
import { confirmWithPasskey } from "./confirmWithPasskey";

type Attempt = { action: () => Promise<ActionResult>; onSuccess?: () => void };

export type GuardedAction = {
  /** Zeigen zwei `ActionNotice` denselben Haken, geht trotzdem nur ein Bestätigungsdialog auf. */
  id: string;
  /** Die Aktion aufrufen. `onSuccess` läuft auch nach einer Wiederholung. */
  run: (action: () => Promise<ActionResult>, onSuccess?: () => void) => void;
  confirm: () => void;
  /** Beim Tippen: die Beanstandung an diesem Feld verschwindet, die übrigen bleiben. */
  clearField: (name: string) => void;
  /**
   * Alles zurück, auch der Versuch, der wiederholt werden soll. **Wer den Text
   * ändert, ändert das, was verschickt werden soll** — und der gemerkte Versuch
   * trägt noch den alten. Ohne das ginge nach dem Bestätigen die Fassung
   * hinaus, die vor der Änderung im Feld stand (Noah, 23.08.2026).
   */
  reset: () => void;
  pending: boolean;
  /** Was zu keinem Feld gehört. Liegt es an einem, bleibt hier nichts stehen (§3). */
  error: string | null;
  /** Der Nachsatz einer geglückten Aktion — bei einem Stapel, der nicht ganz durchging. */
  notice: string | null;
  fields: Record<string, string>;
  reauth: boolean;
  /** Die Sitzung ist weg. Kein Wiederholen, nur der Weg zur Anmeldung. */
  signIn: boolean;
};

/**
 * **Wer eine Aktion mit frischem Faktor aufruft, nimmt diesen Haken und zeigt
 * `ActionNotice`.** Beides gehört zusammen: Die Aktion kann an einem zu alten
 * Faktor scheitern, und dann ist der Knopf zum Bestätigen die einzige
 * sinnvolle Antwort.
 *
 * **Nach der Bestätigung läuft die Aktion von selbst weiter.** Sonst drückt man
 * denselben Knopf zweimal und weiss beim ersten Mal nicht, warum.
 */
export function useGuardedAction(
  /** Der Namensteil vor dem Feld (`invite-` für `invite-email`), damit der Fokus dorthin springt (§3). */
  fieldPrefix?: string,
): GuardedAction {
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [signIn, setSignIn] = useState(false);

  function apply(result: ActionResult, versuch: Attempt) {
    if (result.ok) {
      leeren();
      setNotice(result.notice ?? null);
      versuch.onSuccess?.();
      return;
    }

    const beanstandet = result.fields ?? {};
    const amFeld = Object.keys(beanstandet).length > 0;

    setFields(beanstandet);
    setError(amFeld ? null : result.message);
    setAttempt(result.reauth ? versuch : null);
    setSignIn(result.signIn === true);

    if (amFeld && fieldPrefix) {
      document
        .getElementById(`${fieldPrefix}${Object.keys(beanstandet)[0]}`)
        ?.focus();
    }
  }

  function leeren() {
    setError(null);
    setNotice(null);
    setFields({});
    setAttempt(null);
    setSignIn(false);
  }

  function run(action: () => Promise<ActionResult>, onSuccess?: () => void) {
    const versuch = { action, onSuccess };
    leeren();

    startTransition(async () => apply(await action(), versuch));
  }

  function confirm() {
    const versuch = attempt;
    if (!versuch) return;

    startTransition(async () => {
      const bestätigt = await confirmWithPasskey();
      if (!bestätigt.ok) {
        setError(bestätigt.message);
        return;
      }
      apply(await versuch.action(), versuch);
    });
  }

  /** Nur wenn etwas dasteht: Sonst entstünde bei jedem Tastendruck ein Rendern. */
  function reset() {
    if (!error && !attempt && !signIn && Object.keys(fields).length === 0) {
      return;
    }
    leeren();
  }

  function clearField(name: string) {
    setFields((current) => {
      if (!current[name]) return current;
      const rest = { ...current };
      delete rest[name];
      return rest;
    });
  }

  return {
    id,
    run,
    confirm,
    clearField,
    reset,
    pending,
    error,
    notice,
    fields,
    reauth: attempt !== null,
    signIn,
  };
}
