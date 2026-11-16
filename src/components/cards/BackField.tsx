"use client"; // Gesteuertes Feld.

import type { ReactNode } from "react";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

/** Die Rückseite, mit „Übersetzen" rechts über dem Feld. */
export default function BackField({
  busy,
  side,
  action,
  value,
  onChange,
  error,
}: {
  busy: { readOnly: boolean; className: string };
  side: ReactNode;
  action?: ReactNode;
  value: string;
  onChange: (back: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <Label htmlFor="card-back">
          Rückseite
          {side}
        </Label>
        {action}
      </div>
      <Input
        {...busy}
        id="card-back"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={Boolean(error)}
        hint={error}
      />
    </div>
  );
}
