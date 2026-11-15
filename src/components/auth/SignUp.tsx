"use client"; // WebAuthn läuft im Browser; dazwischen liegen zwei Server-Aufrufe.

import {
  browserSupportsWebAuthn,
  startRegistration,
} from "@simplewebauthn/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { signup, signupOptions } from "@/app/(auth)/actions";
import AuthNotice from "@/components/common/AuthNotice";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

export default function SignUp() {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFields({});
    if (!browserSupportsWebAuthn()) {
      setError("Dieser Browser kann keine Passkeys anlegen.");
      return;
    }

    setBusy(true);
    try {
      const started = await signupOptions({ email, name });
      if (!started.ok) {
        const amFeld = started.fields ?? {};
        setFields(amFeld);
        setError(Object.keys(amFeld).length ? null : started.message);
        const erstes = Object.keys(amFeld)[0];
        if (erstes)
          form.current?.querySelector<HTMLInputElement>(`#${erstes}`)?.focus();
        return;
      }

      const response = await startRegistration({
        optionsJSON: started.options,
      });
      const result = await signup(response);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Der Passkey wurde nicht angelegt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={form} onSubmit={submit} noValidate>
      <h1 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
        Konto anlegen
      </h1>
      <p className="text-theme-sm mt-2 text-gray-500 dark:text-gray-400">
        Danach legst du einen Passkey an. Ein Passwort gibt es nicht.
      </p>

      {error && (
        <AuthNotice tone="error" className="mt-6">
          {error}
        </AuthNotice>
      )}

      <div className="mt-6">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={Boolean(fields.name)}
          hint={fields.name}
        />
      </div>
      <div className="mt-4">
        <Label htmlFor="email">E-Mail-Adresse</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={Boolean(fields.email)}
          hint={fields.email}
        />
      </div>

      <Button type="submit" className="mt-6 w-full" disabled={busy}>
        {busy ? "Einen Moment …" : "Passkey anlegen"}
      </Button>

      <p className="text-theme-sm mt-6">
        <Link href="/anmelden" className="link-brand font-medium">
          Schon ein Konto? Anmelden
        </Link>
      </p>
    </form>
  );
}
