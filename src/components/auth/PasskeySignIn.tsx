"use client"; // WebAuthn läuft im Browser — dazwischen liegen zwei Server-Aufrufe.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  browserSupportsWebAuthn,
  startAuthentication,
  WebAuthnAbortService,
} from "@simplewebauthn/browser";

import { passkeyLogin, passkeyLoginOptions } from "@/app/(auth)/actions";
import AuthNotice from "@/components/common/AuthNotice";
import Button from "@/components/ui/button/Button";
import { LockIcon } from "@/icons";

/**
 * Der Browser soll nach 60 Sekunden von selbst aufgeben — manche Geräte tun das
 * nicht und zeigen dabei gar keinen Dialog. Dann steht hier sonst ewig „Einen
 * Moment …" ohne Ausweg.
 */
const HINT_AFTER_MS = 15_000;

export default function PasskeySignIn({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setError(null);
    if (!browserSupportsWebAuthn()) {
      setError(
        "Dieser Browser kann keine Passkeys. Ohne Passkey geht es über den Code aus der App.",
      );
      return;
    }
    setBusy(true);
    setStuck(false);
    const watchdog = setTimeout(() => setStuck(true), HINT_AFTER_MS);

    try {
      const optionen = await passkeyLoginOptions();
      if (!optionen.ok) {
        setError(optionen.message);
        return;
      }
      const response = await startAuthentication({
        optionsJSON: optionen.options,
      });
      const result = await passkeyLogin(response);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch {
      // Abbruch im Betriebssystem-Dialog kommt hier genauso an wie ein echter Fehler.
      setError("Die Anmeldung wurde abgebrochen.");
    } finally {
      clearTimeout(watchdog);
      setStuck(false);
      setBusy(false);
    }
  }

  // Bricht die laufende Abfrage wirklich ab — der Knopf wird sonst nie wieder frei.
  function cancel() {
    WebAuthnAbortService.cancelCeremony();
  }

  return (
    <div>
      <h1 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
        Anmelden
      </h1>
      <p className="text-theme-sm mt-2 text-gray-500 dark:text-gray-400">
        Mit Touch ID, Face ID oder Windows Hello.
      </p>

      {error && (
        <AuthNotice tone="error" className="mt-6">
          {error}
        </AuthNotice>
      )}

      <Button
        className="mt-6 w-full"
        onClick={signIn}
        disabled={busy}
        startIcon={<LockIcon />}
      >
        {busy ? "Einen Moment …" : "Mit Passkey anmelden"}
      </Button>

      {stuck && (
        <div className="mt-3">
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">
            Kein Dialog erschienen? Prüfe hinter dem Browser und auf einem
            zweiten Bildschirm.
          </p>
          <button
            type="button"
            onClick={cancel}
            className="text-theme-sm link-brand mt-2 font-medium"
          >
            Abbrechen und neu versuchen
          </button>
        </div>
      )}

      <div className="text-theme-sm mt-6 flex flex-wrap justify-between gap-3">
        <Link href="/registrieren" className="link-brand font-medium">
          Konto anlegen
        </Link>
        <Link href="/anmelden/notfall" className="link-brand font-medium">
          Ohne Passkey anmelden
        </Link>
      </div>
    </div>
  );
}
