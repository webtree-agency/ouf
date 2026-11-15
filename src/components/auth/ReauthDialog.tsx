"use client"; // Dialog über der Seite, der Passkey läuft im Browser.

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import type { GuardedAction } from "./useGuardedAction";

const claims = new Map<string, symbol[]>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setClaims(id: string, next: symbol[]) {
  if (next.length) claims.set(id, next);
  else claims.delete(id);
  listeners.forEach((listener) => listener());
}

/** Wer von mehreren Meldungen desselben Hakens den Dialog zeigt: die erste, die sich meldet. */
function useFirstClaim(id: string, active: boolean) {
  const [own] = useState(() => Symbol(id));

  useEffect(() => {
    if (!active) return;
    setClaims(id, [...(claims.get(id) ?? []), own]);
    return () =>
      setClaims(
        id,
        (claims.get(id) ?? []).filter((c) => c !== own),
      );
  }, [id, active, own]);

  return useSyncExternalStore(
    subscribe,
    () => claims.get(id)?.[0] === own,
    () => false,
  );
}

/**
 * **Die frische Bestätigung liegt über allem, nicht in der Seite.** Als Hinweis
 * stand sie dort, wo die Aktion ihre Meldung zeigt, oft weit über dem Knopf,
 * und man musste hinaufscrollen, um sie zu finden (Jann, 29.10.2026).
 * Das Portal hebt sie auch über einen offenen Dialog (§3, „Überlagerungen").
 */
export default function ReauthDialog({ gate }: { gate: GuardedAction }) {
  const shown = useFirstClaim(gate.id, gate.reauth);
  if (!gate.reauth || !shown) return null;

  return createPortal(
    <Modal
      isOpen
      onClose={gate.reset}
      showCloseButton={false}
      className="max-w-md p-6 lg:p-8"
    >
      <h4 className="text-theme-xl mb-2 font-medium text-gray-800 dark:text-white/90">
        Mit Passkey bestätigen
      </h4>
      <p
        role="status"
        className="text-theme-sm mb-6 text-gray-500 dark:text-gray-400"
      >
        {gate.error}
      </p>
      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={gate.reset}
          disabled={gate.pending}
        >
          Abbrechen
        </Button>
        <Button type="button" onClick={gate.confirm} disabled={gate.pending}>
          {gate.pending ? "Einen Moment …" : "Bestätigen"}
        </Button>
      </div>
    </Modal>,
    document.body,
  );
}
