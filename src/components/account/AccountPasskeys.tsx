"use client"; // Passkey anlegen und entfernen laufen im Browser.

import {
  browserSupportsWebAuthn,
  startRegistration,
} from "@simplewebauthn/browser";
import { useState } from "react";

import {
  addPasskey,
  addPasskeyOptions,
  removePasskey,
} from "@/app/(app)/konto/actions";
import ActionNotice from "@/components/auth/ActionNotice";
import { useGuardedAction } from "@/components/auth/useGuardedAction";
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { PlusIcon, TrashBinIcon } from "@/icons";
import { failed } from "@/lib/actionResult";
import { formatDateTime } from "@/lib/format/dateTime";

export type PasskeyRow = {
  id: string;
  label: string | null;
  createdAt: Date;
  lastUsedAt: Date | null;
};

export default function AccountPasskeys({
  passkeys,
}: {
  passkeys: PasskeyRow[];
}) {
  const [label, setLabel] = useState("");
  const gate = useGuardedAction();

  function add() {
    gate.run(
      async () => {
        if (!browserSupportsWebAuthn())
          return failed("Dieser Browser kann keine Passkeys anlegen.");

        // Der frische Faktor wird vor dem Dialog des Browsers verlangt; die
        // Abweisung kommt als Ergebnis, damit der Bestätigungsdialog erscheint.
        const start = await addPasskeyOptions();
        if (!start.ok) return start;
        try {
          const response = await startRegistration({
            optionsJSON: start.options,
          });
          return await addPasskey({ label, response });
        } catch {
          return failed("Die Einrichtung wurde abgebrochen.");
        }
      },
      () => setLabel(""),
    );
  }

  return (
    <ComponentCard title="Passkeys">
      <ActionNotice gate={gate} />

      {passkeys.length === 0 && (
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          Noch kein Passkey. Angemeldet bist du über den lokalen Kurzweg.
        </p>
      )}
      <ul className="divide-y divide-gray-100 empty:hidden dark:divide-gray-800">
        {passkeys.map((passkey) => (
          <li
            key={passkey.id}
            className="flex items-center justify-between gap-3 py-3 first:pt-0"
          >
            <div className="min-w-0">
              <p className="text-theme-sm truncate font-medium text-gray-800 dark:text-white/90">
                {passkey.label ?? "Ohne Namen"}
              </p>
              <p className="text-theme-xs mt-0.5 text-gray-500 dark:text-gray-400">
                Angelegt {formatDateTime(passkey.createdAt)}
                {passkey.lastUsedAt
                  ? ` · zuletzt ${formatDateTime(passkey.lastUsedAt)}`
                  : ""}
              </p>
            </div>
            {passkeys.length > 1 && (
              <button
                type="button"
                onClick={() => gate.run(() => removePasskey(passkey.id))}
                disabled={gate.pending}
                aria-label={`Passkey ${passkey.label ?? "ohne Namen"} entfernen`}
                title="Entfernen"
                className="text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
              >
                <TrashBinIcon />
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="passkey-label">Gerätename</Label>
          <Input
            id="passkey-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
        </div>
        <Button onClick={add} disabled={gate.pending} startIcon={<PlusIcon />}>
          Passkey hinzufügen
        </Button>
      </div>
    </ComponentCard>
  );
}
