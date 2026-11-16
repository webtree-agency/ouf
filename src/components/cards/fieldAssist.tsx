"use client"; // Teil der Felder.

import type { ReactNode } from "react";

export type AssistField = "front" | "back" | "example";

/** Was das Diktat und die Vorschläge an den Feldern zeigen (`useCardAssist`). */
export type FieldAssist = {
  /** Felder, für die gerade ein Vorschlag kommt: grau, sie atmen leise. */
  loading: ReadonlySet<AssistField>;
  /** Was diktiert wurde, grau in der Vorderseite, bis der Vorschlag da ist. */
  ghost: string;
  /** Zählt je Feld die Vorschläge; ein neuer kommt weich herein. */
  revealed: Partial<Record<AssistField, number>>;
  frontHint?: ReactNode;
  exampleAction?: ReactNode;
  backAction?: ReactNode;
};

export const NO_ASSIST: FieldAssist = {
  loading: new Set(),
  ghost: "",
  revealed: {},
};

// Ein neuer Schlüssel je Vorschlag baut das Feld neu, und es kommt weich herein.
export function assistKey(assist: FieldAssist, field: AssistField): string {
  return `${field}-${assist.revealed[field] ?? 0}`;
}

export function assistState(assist: FieldAssist, field: AssistField) {
  return {
    readOnly: assist.loading.has(field),
    className: assist.loading.has(field)
      ? "motion-safe:animate-pulse"
      : assist.revealed[field]
        ? "motion-safe:animate-reveal"
        : "",
  };
}

/** „Vorderseite · Französisch": klein daneben, was in das Feld gehört. */
export function Side({ children }: { children: ReactNode }) {
  return (
    <span className="font-normal text-gray-500 dark:text-gray-400">
      {" "}
      · {children}
    </span>
  );
}
