"use client";
import { cn } from "@/utils";
import type React from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type DropdownAnchor = {
  left: number;
  /** Genau eines von beiden: nach unten am oberen Rand, nach oben am unteren. */
  top?: number;
  bottom?: number;
};

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /**
   * Wo der Aufklapper stehen soll, gemessen beim Öffnen (`anchorBelow`). Ist er
   * gesetzt, wird über ein Portal am Seitenkörper gezeichnet statt im Elternteil
   * — nötig, sobald ein Vorfahr scrollt: `overflow-x-auto` schneidet ab, was aus
   * ihm herausragt, und der Aufklapper der letzten Tabellenzeile war damit nicht
   * mehr anklickbar (§3).
   */
  anchor?: DropdownAnchor;
  /**
   * Der Knopf, der diesen Aufklapper geöffnet hat. Ohne ihn müsste der
   * Aussenklick jeden `.dropdown-toggle` verschonen — dann bleibt der erste
   * offen, wenn man den zweiten anklickt, und es stehen zwei Menüs da.
   */
  toggle?: HTMLElement | null;
}

const PANEL =
  "shadow-theme-lg dark:bg-gray-900 rounded-xl border border-gray-200 bg-white dark:border-gray-800";

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  anchor,
  toggle,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const ziel = event.target as Node;
      const eigenerKnopf = toggle
        ? toggle.contains(ziel)
        : Boolean((ziel as HTMLElement).closest?.(".dropdown-toggle"));

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(ziel) &&
        !eigenerKnopf
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    // Am Fenster gezeichnet heisst: mitscrollen tut er nicht. Statt neben dem
    // Knopf zu stehen, stünde er irgendwo — also zumachen. Erst ab dem nächsten
    // Bild: Browser stellen `scroll` verzögert zu, und der Klick, der einen
    // halb sichtbaren Knopf ins Bild holt, schickt seinen Scroll dann genau in
    // das eben geöffnete Menü. Es ging im selben Atemzug wieder zu.
    //
    // **Nur fremdes Scrollen schliesst** (Jann, 23.09.2026): Der Lauscher sitzt
    // in der Einfangphase und sah sonst auch die eigene Liste — die Aufrufe
    // einer Vorschau gingen beim ersten Rad-Dreh zu.
    const handleScroll = (event: Event) => {
      if (dropdownRef.current?.contains(event.target as Node)) return;
      onClose();
    };
    const angemeldet = anchor
      ? requestAnimationFrame(() =>
          window.addEventListener("scroll", handleScroll, true),
        )
      : null;

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      if (angemeldet !== null) cancelAnimationFrame(angemeldet);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, onClose, anchor, toggle]);

  if (!isOpen) return null;

  if (!anchor) {
    return (
      <div
        ref={dropdownRef}
        className={cn(PANEL, "absolute right-0 z-40 mt-2", className)}
      >
        {children}
      </div>
    );
  }

  return createPortal(
    <div
      ref={dropdownRef}
      style={{ top: anchor.top, bottom: anchor.bottom, left: anchor.left }}
      className={cn(PANEL, "fixed z-99999", className)}
    >
      {children}
    </div>,
    document.body,
  );
};

/**
 * Rechtsbündig unter dem Knopf — und darüber, wenn unten kein Platz mehr ist.
 * Gemessen wird beim Klick, nicht beim Zeichnen: dort kennt man die Stelle,
 * ohne dafür einen Effect und einen zweiten Durchlauf zu brauchen.
 *
 * `height` schätzt nur, **ob** hochgeklappt wird. Gestellt wird nach oben über
 * die Unterkante — sonst schwebt ein kurzes Menü unter einer falschen Schätzung.
 */
export function anchorBelow(
  button: HTMLElement,
  size: { width: number; height: number },
): DropdownAnchor {
  const box = button.getBoundingClientRect();
  const left = Math.max(8, box.right - size.width);

  return window.innerHeight - box.bottom < size.height
    ? { left, bottom: window.innerHeight - box.top + 8 }
    : { left, top: box.bottom + 8 };
}
