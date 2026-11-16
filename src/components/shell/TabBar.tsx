"use client"; // Der aktive Pfad ist Zustand im Browser.

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ICONS } from "@/components/shell/navIcons";
import { useCurrentHref } from "@/components/shell/NavLinks";
import { MAIN_NAV } from "@/lib/navigation";

/**
 * Am Handy unten im Daumenbereich. Beim Lernen liegen dort die
 * Bewertungsknöpfe, deshalb fehlt die Leiste auf `/lernen`.
 */
export default function TabBar() {
  const pathname = usePathname();
  const current = useCurrentHref();
  if (pathname.startsWith("/lernen")) return null;

  return (
    <>
      {/* Hält den Platz frei, damit die Leiste nichts vom Inhalt verdeckt. */}
      <div aria-hidden className="h-20 md:hidden" />
      <nav
        aria-label="Hauptnavigation"
        className="pb-safe bg-canvas/95 fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 pt-2 backdrop-blur-md md:hidden dark:border-gray-800 dark:bg-gray-950/95"
      >
        <ul className="grid grid-cols-5">
          {MAIN_NAV.map((entry) => {
            const active = entry.href === current;
            return (
              <li key={entry.href}>
                <Link
                  href={entry.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-theme-xs flex h-12 flex-col items-center justify-center gap-0.5 font-medium ${
                    active
                      ? "dark:text-brand-300 text-gray-900"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <span
                    className={`flex h-6 w-12 items-center justify-center rounded-full ${
                      active ? "bg-brand-300/60 dark:bg-brand-300/15" : ""
                    }`}
                  >
                    {NAV_ICONS[entry.icon]}
                  </span>
                  {entry.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
