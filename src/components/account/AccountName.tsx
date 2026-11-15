"use client"; // Formularzustand.

import { useState, useTransition } from "react";

import { renameAccount } from "@/app/(app)/konto/actions";
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

export default function AccountName({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await renameAccount(value);
      if (!result.ok) setError(result.fields?.name ?? result.message);
      else setSaved(true);
    });
  }

  return (
    <ComponentCard>
      <p className="text-theme-sm text-gray-500 dark:text-gray-400">
        Angemeldet als {email}
      </p>
      <form
        onSubmit={save}
        noValidate
        className="flex flex-col gap-3 sm:flex-row sm:items-start"
      >
        <div className="flex-1">
          <Label htmlFor="account-name">Name</Label>
          <Input
            id="account-name"
            autoComplete="name"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setSaved(false);
            }}
            error={Boolean(error)}
            hint={error ?? (saved ? "Gespeichert." : undefined)}
            success={saved}
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          className="sm:mt-6.5"
          disabled={pending || value.trim() === name}
        >
          {pending ? "Wird gespeichert …" : "Speichern"}
        </Button>
      </form>
    </ComponentCard>
  );
}
