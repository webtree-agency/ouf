import { consumeRateLimit } from "./rateLimit.ts";
import { matchingTotpStep, TOTP_ACCEPT_MS } from "./totp.ts";

/**
 * **Ein Code gilt einmal** (RFC 6238 §5.2, Prüflauf 31.10.2026). Bis dahin nahm
 * die Anmeldung denselben Code neunzig Sekunden lang mehrfach an; wer ihn vom
 * Bildschirm las, kam ein zweites Mal hinein. Der Schritt wird je Konto
 * verbraucht, in derselben Tabelle wie die übrigen Grenzen.
 */
export async function acceptTotpCode(
  userId: string,
  secret: string,
  code: string,
  at = new Date(),
): Promise<boolean> {
  const step = matchingTotpStep(secret, code, at);
  if (step === null) return false;

  const used = await consumeRateLimit({
    key: `totp-step:${userId}:${step}`,
    limit: 1,
    windowMs: TOTP_ACCEPT_MS,
    now: at,
  });
  return used.allowed;
}
