"use client"; // Einrichten läuft in Schritten, die Codes sind nur einmal sichtbar.

import { useState } from "react";

import {
  beginTotpSetup,
  completeTotpSetup,
  regenerateRecoveryCodes,
} from "@/app/(app)/konto/actions";
import ActionNotice from "@/components/auth/ActionNotice";
import { useGuardedAction } from "@/components/auth/useGuardedAction";
import AuthNotice from "@/components/common/AuthNotice";
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { OK } from "@/lib/actionResult";

type Setup = { secret: string; qr: string };

export default function AccountEmergency({
  totpConfirmed,
  recoveryCodesLeft,
}: {
  totpConfirmed: boolean;
  recoveryCodesLeft: number;
}) {
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const gate = useGuardedAction("totp-");

  function begin() {
    gate.run(async () => {
      const result = await beginTotpSetup();
      if (!result.ok) return result;
      setSetup({ secret: result.secret, qr: result.qr });
      return OK;
    });
  }

  function newCodes() {
    gate.run(async () => {
      const result = await regenerateRecoveryCodes();
      if (!result.ok) return result;
      setCodes(result.codes);
      return OK;
    });
  }

  return (
    <ComponentCard
      title="Ohne Passkey anmelden"
      desc="Für den Fall, dass kein Gerät mit Passkey da ist."
    >
      <ActionNotice gate={gate} />

      <section>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
            Code-App
          </h3>
          <Badge color={totpConfirmed ? "success" : "light"} size="sm">
            {totpConfirmed ? "Eingerichtet" : "Nicht eingerichtet"}
          </Badge>
        </div>

        {setup ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Weisse Fläche fest, sonst scannt im Dunkelmodus nichts. */}
              <div className="shrink-0 self-center rounded-xl bg-white p-3 sm:self-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={setup.qr}
                  alt="QR-Code für die Code-App"
                  width={160}
                  height={160}
                />
              </div>
              <div className="min-w-0 flex-1">
                <Label htmlFor="totp-secret">
                  Oder diesen Schlüssel eintippen
                </Label>
                <Input
                  id="totp-secret"
                  value={setup.secret}
                  readOnly
                  className="tracking-wider"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <Label htmlFor="totp-code">Aktueller Code aus der App</Label>
                <Input
                  id="totp-code"
                  accepts="digits"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value);
                    gate.clearField("code");
                  }}
                  error={Boolean(gate.fields.code)}
                  hint={gate.fields.code}
                />
              </div>
              <Button
                className="sm:mt-6.5"
                disabled={gate.pending || code.length < 6}
                onClick={() =>
                  gate.run(
                    () => completeTotpSetup(code),
                    () => {
                      setSetup(null);
                      setCode("");
                    },
                  )
                }
              >
                Bestätigen
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="mt-3"
            disabled={gate.pending}
            onClick={begin}
          >
            {totpConfirmed ? "Neu einrichten" : "Einrichten"}
          </Button>
        )}
      </section>

      <section className="border-t border-gray-100 pt-6 dark:border-gray-800">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
            Ersatzcodes
          </h3>
          <Badge color={recoveryCodesLeft > 0 ? "success" : "light"} size="sm">
            {recoveryCodesLeft} unbenutzt
          </Badge>
        </div>

        {codes && (
          <div className="mt-4">
            <AuthNotice tone="warning">
              Jetzt ablegen, etwa im Passwortmanager. Danach sind sie nicht mehr
              lesbar.
            </AuthNotice>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {codes.map((entry) => (
                <li
                  key={entry}
                  className="text-theme-sm rounded-lg bg-gray-50 px-3 py-2 tracking-wider text-gray-800 dark:bg-white/5 dark:text-white/90"
                >
                  {entry}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          variant="outline"
          className="mt-3"
          disabled={gate.pending}
          onClick={newCodes}
        >
          Zehn neue Codes erzeugen
        </Button>
        {recoveryCodesLeft > 0 && !codes && (
          <p className="text-theme-xs mt-2 text-gray-500 dark:text-gray-400">
            Die bisherigen gelten danach nicht mehr.
          </p>
        )}
      </section>
    </ComponentCard>
  );
}
