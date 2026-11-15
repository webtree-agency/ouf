"use client"; // Zeigt den Zustand aus `useGuardedAction`.

import { usePathname } from "next/navigation";

import AuthNotice from "@/components/common/AuthNotice";
import Button from "@/components/ui/button/Button";
import ReauthDialog from "./ReauthDialog";
import type { GuardedAction } from "./useGuardedAction";

/** `AuthNotice` rendert ein `<p>`, deshalb Spannen statt Blöcke. */
export default function ActionNotice({ gate }: { gate: GuardedAction }) {
  // Damit die Anmeldung zurückführt, wo man gerade steht — nicht auf die Übersicht.
  const zurück = usePathname();

  if (gate.reauth) return <ReauthDialog gate={gate} />;
  if (!gate.error) return null;

  return (
    <AuthNotice tone="error">
      <span className="flex flex-wrap items-center justify-between gap-3">
        <span>{gate.error}</span>

        {gate.signIn && (
          <Button
            size="sm"
            href={`/anmelden?weiter=${encodeURIComponent(zurück)}`}
          >
            Neu anmelden
          </Button>
        )}
      </span>
    </AuthNotice>
  );
}
