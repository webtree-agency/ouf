"use client"; // Der aktive Pfad ist Zustand im Browser.

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ICONS } from "@/components/shell/navIcons";
import { MAIN_NAV } from "@/lib/navigation";
import { activeHref } from "@/lib/navigation/active";

/**
 * Die Hauptnavigation als schwebende Pille aus Glas, unten, auf jeder Breite.
 * Am Handy liegen beim Lernen dort die Bewertungsknöpfe; dann fehlt sie.
 */
export default function TabBar({ extras }: { extras: React.ReactNode }) {
  const pathname = usePathname();
  const current = activeHref(
    pathname,
    MAIN_NAV.map((entry) => entry.href),
  );
  const hideOnPhone = pathname.startsWith("/lernen") ? "max-md:hidden" : "";

  return (
    <>
      {/* Hält den Platz frei, damit die Leiste nichts vom Inhalt verdeckt. */}
      <div aria-hidden className={`h-24 ${hideOnPhone}`} />
      <nav
        aria-label="Hauptnavigation"
        className={`pb-safe fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 ${hideOnPhone}`}
      >
        <ul className="shadow-theme-lg flex w-full max-w-md items-center gap-1 rounded-full border border-white/60 bg-white/70 p-1.5 backdrop-blur-xl backdrop-saturate-150 md:w-auto md:max-w-none dark:border-white/10 dark:bg-gray-900/60">
          {MAIN_NAV.map((entry) => {
            const active = entry.href === current;
            return (
              <li key={entry.href} className="flex-1 md:flex-none">
                <Link
                  href={entry.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-theme-xs md:text-theme-sm flex h-12 flex-col items-center justify-center gap-0.5 rounded-full font-medium transition md:h-11 md:flex-row md:gap-2 md:px-4 ${
                    active
                      ? "bg-brand-300/60 dark:bg-brand-300/15 dark:text-brand-300 text-gray-900"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white/90"
                  }`}
                >
                  {NAV_ICONS[entry.icon]}
                  {entry.label}
                </Link>
              </li>
            );
          })}
          <li
            aria-hidden
            className="mx-1 hidden h-6 w-px bg-gray-200 md:block dark:bg-white/10"
          />
          <li className="hidden items-center gap-1 md:flex">{extras}</li>
        </ul>
      </nav>
    </>
  );
}
