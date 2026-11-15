"use client"; // Schaltet den Modus im Browser.

import { useTheme } from "@/context/ThemeContext";
import { MoonIcon, SunIcon } from "@/icons";

/**
 * Für Seiten ohne Benutzermenü: Anmelden und Registrieren. Welches Bild steht,
 * entscheidet die Klasse `dark`, nicht der Zustand: Der Server kennt den Modus
 * nicht, und beide Bilder im Markup ersparen den Unterschied beim Hydrieren.
 */
export default function ThemeTogglerTwo() {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Hell oder dunkel"
      title="Hell oder dunkel"
      className="flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-white/90"
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="dark:hidden" />
    </button>
  );
}
