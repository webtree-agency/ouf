"use client"; // Formularzustand und Wechsel zwischen den beiden Ersatzwegen.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { emergencyLogin } from "@/app/(auth)/actions";
import AuthNotice from "@/components/common/AuthNotice";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

const METHODS = {
  totp: {
    label: "Code aus der App",
    hint: "Der sechsstellige Code aus deiner Code-App.",
    placeholder: "123456",
    inputMode: "numeric" as const,
  },
  "recovery-code": {
    label: "Ersatzcode",
    hint: "Einer deiner zehn Ersatzcodes. Jeder gilt einmal.",
    placeholder: "ABCD-EFGH-JKMN",
    inputMode: "text" as const,
  },
};

type Method = keyof typeof METHODS;

export default function EmergencySignIn({
  redirectTo,
}: {
  redirectTo: string;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("totp");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setBusy(true);
    setError(null);

    const result = await emergencyLogin({ method, email, code });
    if (!result.ok) {
      setError(result.message);
      setBusy(false);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  const active = METHODS[method];

  return (
    <div>
      <h1 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
        Ohne Passkey anmelden
      </h1>
      <p className="text-theme-sm mt-2 text-gray-500 dark:text-gray-400">
        Mit dem Code aus der App oder einem Ersatzcode, beides eingerichtet
        unter Konto.
      </p>

      {error && (
        <AuthNotice tone="error" className="mt-6">
          {error}
        </AuthNotice>
      )}

      <div className="mt-6 flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {(Object.keys(METHODS) as Method[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMethod(key)}
            className={`text-theme-sm flex-1 rounded-md px-3 py-2.5 font-medium transition ${
              method === key
                ? "shadow-theme-xs bg-white text-gray-800 dark:bg-gray-950 dark:text-white/90"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {METHODS[key].label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <Label htmlFor="email">E-Mail-Adresse</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="mt-4">
        <Label htmlFor="code">{active.label}</Label>
        <Input
          id="code"
          inputMode={active.inputMode}
          autoComplete="one-time-code"
          placeholder={active.placeholder}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          hint={active.hint}
        />
      </div>

      <Button
        className="mt-6 w-full"
        onClick={signIn}
        disabled={busy || !email || !code}
      >
        {busy ? "Einen Moment …" : "Anmelden"}
      </Button>

      <p className="text-theme-sm mt-6 text-center text-gray-500 dark:text-gray-400">
        <Link href="/anmelden" className="link-brand font-medium">
          Zurück zur Anmeldung
        </Link>
      </p>
    </div>
  );
}
