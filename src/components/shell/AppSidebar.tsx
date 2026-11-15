"use client"; // Überfahren und Aufklappen sind Zustand im Browser.

import Link from "next/link";
import { usePathname } from "next/navigation";

import BrandLogo from "@/components/brand/BrandLogo";
import SidebarEntry from "@/components/shell/SidebarEntry";
import { useSidebar } from "@/context/SidebarContext";
import { MAIN_NAV } from "@/lib/navigation";
import { activeHref } from "@/lib/navigation/active";

export default function AppSidebar() {
  const pathname = usePathname();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const wide = isExpanded || isHovered || isMobileOpen;
  const current = activeHref(
    pathname,
    MAIN_NAV.map((entry) => entry.href),
  );

  return (
    <aside
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white px-4 transition-all duration-300 ease-in-out xl:translate-x-0 dark:border-gray-800 dark:bg-gray-900 ${
        wide ? "w-64" : "w-20"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className={`flex py-6 ${wide ? "px-2" : "xl:justify-center"}`}>
        <Link href="/" aria-label="Zur Übersicht">
          <BrandLogo className={wide ? "h-12" : "h-8"} />
        </Link>
      </div>

      <nav
        aria-label="Hauptnavigation"
        className="no-scrollbar overflow-y-auto pb-6"
      >
        <ul className="flex flex-col gap-1">
          {MAIN_NAV.map((entry) => (
            <SidebarEntry
              key={entry.href}
              entry={entry}
              wide={wide}
              current={entry.href === current}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
