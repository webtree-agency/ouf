"use client"; // Auswahl und Rückmeldung.

import { useState, useTransition } from "react";

import { addLanguageAction } from "@/app/(app)/sprachen/actions";
import AuthNotice from "@/components/common/AuthNotice";
import SelectField from "@/components/form/SelectField";
import Button from "@/components/ui/button/Button";

export default function AddLanguage({
  choices,
}: {
  choices: { value: string; label: string }[];
}) {
  const [code, setCode] = useState(choices[0]?.value ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (choices.length === 0) return null;

  function add() {
    setError(null);
    startTransition(async () => {
      const result = await addLanguageAction(code);
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <div className="space-y-3">
      {error && <AuthNotice tone="error">{error}</AuthNotice>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <SelectField
            id="language-code"
            label="Sprache"
            value={code}
            options={choices}
            onChange={setCode}
          />
        </div>
        <Button onClick={add} disabled={pending || !code}>
          {pending ? "Wird angelegt …" : "Hinzufügen"}
        </Button>
      </div>
    </div>
  );
}
