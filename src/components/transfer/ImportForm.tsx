"use client"; // Datei wählen und Rückmeldung.

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { importAction } from "@/app/(app)/daten/actions";
import AuthNotice from "@/components/common/AuthNotice";
import Label from "@/components/form/Label";
import SelectField from "@/components/form/SelectField";
import Button from "@/components/ui/button/Button";

export default function ImportForm({
  decks,
}: {
  decks: { value: string; label: string }[];
}) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [deck, setDeck] = useState(decks[0]?.value ?? "");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.set("deck", deck);
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await importAction(data);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setNotice(result.notice ?? null);
      form.current?.reset();
      router.refresh();
    });
  }

  return (
    <form ref={form} onSubmit={submit} noValidate className="space-y-4">
      {error && <AuthNotice tone="error">{error}</AuthNotice>}
      {notice && <AuthNotice tone="success">{notice}</AuthNotice>}
      <div>
        <Label htmlFor="import-datei">Datei (CSV oder TSV)</Label>
        <input
          id="import-datei"
          name="datei"
          type="file"
          accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
          className="text-theme-sm file:text-theme-sm block w-full rounded-lg border border-gray-300 text-gray-700 file:mr-4 file:h-11 file:border-0 file:border-r file:border-gray-300 file:bg-gray-50 file:px-4 file:font-medium file:text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:file:border-gray-700 dark:file:bg-white/5 dark:file:text-gray-300"
        />
      </div>
      <SelectField
        id="import-deck"
        label="Deck"
        value={deck}
        options={decks}
        onChange={setDeck}
      />
      <p className="text-theme-xs text-gray-500 dark:text-gray-400">
        Steht in der Datei eine Spalte «deck», kommt jede Karte in das Deck
        dieses Namens. Was es schon gibt, wird übersprungen.
      </p>
      <Button type="submit" disabled={pending || !deck}>
        {pending ? "Wird importiert …" : "Importieren"}
      </Button>
    </form>
  );
}
