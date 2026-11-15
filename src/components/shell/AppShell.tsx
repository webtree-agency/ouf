"use client"; // Der Abstand links hängt am Zustand der Seitenleiste.

import AppSidebar from "@/components/shell/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { useSidebar } from "@/context/SidebarContext";

/**
 * Seitenleiste, Kopfzeile, Inhalt. Die Breite wird hier einmal begrenzt, nie
 * in einer Seite (§3).
 */
export default function AppShell({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const offset = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "xl:ml-64"
      : "xl:ml-20";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      {/* `min-w-0`: eine breite Tabelle schöbe sonst die Spalte auf. */}
      <div
        className={`flex min-h-dvh min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out ${offset}`}
      >
        {header}
        <main className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-1 flex-col p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
