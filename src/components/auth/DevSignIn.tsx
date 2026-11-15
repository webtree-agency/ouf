"use client"; // Ein Knopf mit Rückmeldung.

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { devLogin } from "@/app/(auth)/actions";
import AuthNotice from "@/components/common/AuthNotice";
import Button from "@/components/ui/button/Button";

/**
 * Steht nur da, wenn `DEV_LOGIN_EMAIL` gesetzt ist und der Aufruf an
 * `localhost` geht — geprüft wird beides auf dem Server (`lib/auth/devLogin`),
 * hier wie in der Aktion. Der Knopf ist die Anzeige, nicht der Schutz.
 */
export default function DevSignIn({
  email,
  redirectTo,
}: {
  email: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function signIn() {
    setError(null);
    startTransition(async () => {
      const result = await devLogin();
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    });
  }

  return (
    <div className="mt-8 border-t border-dashed border-gray-300 pt-6 dark:border-gray-700">
      {error && (
        <AuthNotice tone="error" className="mb-3">
          {error}
        </AuthNotice>
      )}

      <Button
        variant="outline"
        className="w-full"
        onClick={signIn}
        disabled={pending}
      >
        {pending ? "Einen Moment …" : `Lokal anmelden als ${email}`}
      </Button>
      <p className="text-theme-xs mt-2 text-center text-gray-500 dark:text-gray-400">
        Nur auf localhost, nur mit gesetzter Variable.
      </p>
    </div>
  );
}
