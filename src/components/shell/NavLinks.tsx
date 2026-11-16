"use client"; // Der aktive Pfad ist Zustand im Browser.

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MAIN_NAV } from "@/lib/navigation";
import { activeHref } from "@/lib/navigation/active";

/** Die Hauptnavigation in der Kopfzeile, ab `md`. */
export default function NavLinks() {
  const current = useCurrentHref();
  return (
    <nav aria-label="Hauptnavigation" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {MAIN_NAV.map((entry) => (
          <li key={entry.href}>
            <Link
              href={entry.href}
              aria-current={entry.href === current ? "page" : undefined}
              className={`text-theme-sm flex h-10 items-center rounded-full px-4 font-medium transition ${
                entry.href === current
                  ? "bg-brand-300/45 dark:bg-brand-300/10 dark:text-brand-300 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90"
              }`}
            >
              {entry.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function useCurrentHref(): string | null {
  const pathname = usePathname();
  return activeHref(
    pathname,
    MAIN_NAV.map((entry) => entry.href),
  );
}
