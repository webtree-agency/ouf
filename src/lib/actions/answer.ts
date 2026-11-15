import { failed, SESSION_EXPIRED, type ActionResult } from "../actionResult.ts";
import { NotAuthenticatedError } from "../auth/errors.ts";
import { DomainError } from "../domainError.ts";

/**
 * Welcher Fehler zu welcher Antwort wird. `null` heisst: nicht unserer,
 * weiterwerfen, auf die Fehlerseite.
 */
export function answerFor(error: unknown): ActionResult | null {
  if (error instanceof NotAuthenticatedError) return SESSION_EXPIRED;
  if (error instanceof DomainError) {
    return failed(
      error.message,
      error.field ? { [error.field]: error.message } : undefined,
    );
  }
  return null;
}

export function answerOrThrow(error: unknown): ActionResult {
  const result = answerFor(error);
  if (!result) throw error;
  return result;
}
