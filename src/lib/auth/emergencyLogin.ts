import { and, eq, isNull } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { findAccountByEmail, type Account } from "../queries/accounts.ts";
import {
  completeLogin,
  recordFailedLogin,
  type LoginContext,
  type LoginMethod,
} from "./completeLogin.ts";
import { loadTotpSecret } from "./factors.ts";
import {
  allowAttemptFromIp,
  isLocked,
  registerFailedAttempt,
} from "./lockout.ts";
import { hashRecoveryCode } from "./recoveryCodes.ts";
import { acceptTotpCode } from "./totpOnce.ts";

export type EmergencyFailure = "rate-limited" | "invalid" | "locked";

export type EmergencyLoginResult =
  | { ok: true; token: string; expiresAt: Date }
  | { ok: false; reason: EmergencyFailure };

export type EmergencyLoginInput = {
  email: string;
  code: string;
  context: LoginContext;
};

export function loginWithTotp(
  input: EmergencyLoginInput,
): Promise<EmergencyLoginResult> {
  return emergencyLogin(input, "totp", async (account, code) => {
    const secret = await loadTotpSecret(account.id);
    if (!secret?.confirmedAt) return false;
    return acceptTotpCode(account.id, secret.value, code);
  });
}

export function loginWithRecoveryCode(
  input: EmergencyLoginInput,
): Promise<EmergencyLoginResult> {
  return emergencyLogin(input, "recovery-code", consumeRecoveryCode);
}

// Die Antwort trennt nicht zwischen unbekannter Adresse und falschem Code.
async function emergencyLogin(
  input: EmergencyLoginInput,
  method: LoginMethod,
  verify: (account: Account, code: string) => Promise<boolean>,
): Promise<EmergencyLoginResult> {
  if (!(await allowAttemptFromIp(input.context.ip))) {
    return { ok: false, reason: "rate-limited" };
  }

  const account = await findAccountByEmail(input.email);
  if (!account) {
    recordFailedLogin(null, method, "Adresse unbekannt");
    return { ok: false, reason: "invalid" };
  }
  if (isLocked(account)) return { ok: false, reason: "locked" };

  if (!(await verify(account, input.code))) {
    const { locked } = await registerFailedAttempt(account);
    recordFailedLogin(account, method, "Code ungültig");
    return { ok: false, reason: locked ? "locked" : "invalid" };
  }

  return { ok: true, ...(await completeLogin(account, method, input.context)) };
}

// Ein Code gilt genau einmal: Treffer und Entwertung in einem Schritt.
async function consumeRecoveryCode(
  account: Account,
  code: string,
): Promise<boolean> {
  const updated = await getDb()
    .update(schema.recoveryCodes)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(schema.recoveryCodes.userId, account.id),
        eq(schema.recoveryCodes.codeHash, hashRecoveryCode(code)),
        isNull(schema.recoveryCodes.usedAt),
      ),
    )
    .returning({ id: schema.recoveryCodes.id });

  return updated.length === 1;
}
