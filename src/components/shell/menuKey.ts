import type { KeyboardEvent } from "react";

/** Escape schliesst, was aufgeklappt ist (§3). */
export function menuKey(close: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key === "Escape") close();
  };
}
