"use client"; // Der aktive Pfad ist Zustand im Browser.

import Link from "next/link";

import { NAV_ICONS } from "@/components/shell/navIcons";
import type { NavEntry } from "@/lib/navigation";

export default function SidebarEntry({
  entry,
  wide,
  current,
}: {
  entry: NavEntry;
  /** Zusammengeschoben zeigt die Leiste nur Symbole. */
  wide: boolean;
  current: boolean;
}) {
  return (
    <li>
      <Link
        href={entry.href}
        aria-current={current ? "page" : undefined}
        aria-label={wide ? undefined : entry.label}
        title={wide ? undefined : entry.label}
        className={`menu-item group ${current ? "menu-item-active" : "menu-item-inactive"} ${wide ? "" : "xl:justify-center"}`}
      >
        <span
          className={`menu-item-icon ${current ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}
        >
          {NAV_ICONS[entry.icon]}
        </span>
        {wide && <span>{entry.label}</span>}
      </Link>
    </li>
  );
}
