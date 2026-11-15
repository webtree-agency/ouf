"use client"; // Die Auswahl baut den Link.

import { useState } from "react";

import SelectField from "@/components/form/SelectField";
import Button from "@/components/ui/button/Button";
import { DownloadIcon } from "@/icons";

const FORMATS = [
  { value: "csv", label: "CSV, mit Komma" },
  { value: "tsv", label: "TSV, mit Tab (für Anki)" },
];

export default function ExportForm({
  decks,
}: {
  decks: { value: string; label: string }[];
}) {
  const [format, setFormat] = useState("csv");
  const [deck, setDeck] = useState("alle");
  const params = new URLSearchParams({
    format,
    ...(deck === "alle" ? {} : { deck }),
  });

  return (
    <div className="space-y-4">
      <SelectField
        id="export-deck"
        label="Deck"
        value={deck}
        options={[{ value: "alle", label: "Alle Decks" }, ...decks]}
        onChange={setDeck}
      />
      <SelectField
        id="export-format"
        label="Format"
        value={format}
        options={FORMATS}
        onChange={setFormat}
      />
      <Button
        href={`/api/export?${params}`}
        download
        startIcon={<DownloadIcon />}
      >
        Herunterladen
      </Button>
    </div>
  );
}
