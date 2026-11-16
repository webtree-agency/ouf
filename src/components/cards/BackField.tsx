"use client"; // Gesteuertes Feld.

import type { ReactNode } from "react";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

/**
 * Die Rückseite. Ist sie leer und liegt eine Übersetzung vor, steht diese grau
 * darin; Tab oder der Knopf darunter übernimmt sie (am Handy gibt es kein Tab).
 */
export default function BackField({
  busy,
  side,
  value,
  onChange,
  error,
  suggestion,
  onAccept,
}: {
  busy: { readOnly: boolean; className: string };
  side: ReactNode;
  value: string;
  onChange: (back: string) => void;
  error?: string;
  suggestion: string | null;
  onAccept: () => void;
}) {
  return (
    <div>
      <Label htmlFor="card-back">
        Rückseite
        {side}
      </Label>
      <Input
        {...busy}
        id="card-back"
        autoComplete="off"
        placeholder={suggestion ?? undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Tab" || event.shiftKey || !suggestion) return;
          event.preventDefault();
          onAccept();
        }}
        error={Boolean(error)}
        hint={error}
      />
      {suggestion && (
        <button
          type="button"
          onClick={onAccept}
          className="text-theme-xs link-underline motion-safe:animate-reveal mt-1.5 text-gray-600 dark:text-gray-300"
        >
          Übernehmen (Tab)
        </button>
      )}
    </div>
  );
}
