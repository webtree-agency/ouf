import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { OK, type ActionResult } from "../actionResult.ts";
import {
  freshSessionOrFailure,
  requireSession,
} from "../auth/serverSession.ts";
import { withDefer } from "../defer.ts";
import { answerOrThrow } from "./answer.ts";

/** Wer handelt: dieselbe Form, die jedes `lib/<bereich>/` erwartet. */
export type Actor = { id: string; email: string };

export type RunOptions = {
  /** Welche Ansichten danach veraltet sind, immer mit `"layout"` (§2). */
  revalidate?: readonly string[];
  /** Verlangt einen frischen Faktor statt nur einer Sitzung (§10). */
  fresh?: boolean;
};

/**
 * **Was jede Server Action durchläuft: Sitzung, Aktion, Erneuern, Aufruf.**
 * Die Aktion gibt zurück, wo ihr Ergebnis steht; wer nichts zurückgibt,
 * bleibt, wo er ist, und die Ansicht wird erneuert.
 */
export async function runAction(
  options: RunOptions,
  action: (actor: Actor) => Promise<string | void>,
): Promise<ActionResult> {
  let actor: Actor;
  try {
    if (options.fresh) {
      const gate = await freshSessionOrFailure();
      if (!gate.ok) return gate.result;
      actor = { id: gate.session.userId, email: gate.session.email };
    } else {
      const session = await requireSession();
      actor = { id: session.userId, email: session.email };
    }
  } catch (error) {
    return answerOrThrow(error);
  }

  let ziel: string | void;
  try {
    // Was der Fachbereich mit `afterResponse` markiert, läuft nach der Antwort.
    ziel = await withDefer(after, () => action(actor));
  } catch (error) {
    return answerOrThrow(error);
  }

  for (const pfad of options.revalidate ?? []) revalidatePath(pfad, "layout");

  // `redirect()` wirft, deshalb hinter dem `try`, wo es nicht als Fachfehler durchginge.
  if (ziel) redirect(ziel);
  return OK;
}
