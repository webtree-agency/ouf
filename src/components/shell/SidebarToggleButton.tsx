"use client"; // Klappt die Seitenleiste auf und zu.

import { SIDEBAR_BREAKPOINT, useSidebar } from "@/context/SidebarContext";
import { CloseIcon, MenuIcon } from "@/icons";

/**
 * Ab `xl` klappt die Leiste schmal, darunter schiebt sie sich über die Seite —
 * es sind zwei Zustände desselben Knopfes. **Die Grenze kommt aus dem Kontext**,
 * sie stand hier ein zweites Mal fest eingetippt und wich von ihm ab.
 */
export default function SidebarToggleButton() {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  function toggle() {
    if (window.innerWidth >= SIDEBAR_BREAKPOINT) toggleSidebar();
    else toggleMobileSidebar();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Menü ein- und ausblenden"
      className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
    >
      {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
    </button>
  );
}
