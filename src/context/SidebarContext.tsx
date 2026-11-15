"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";

/**
 * **Die Grenze zwischen den beiden Leisten, und zwar die einzige.** Darüber
 * steht sie fest neben dem Inhalt und lässt sich schmal klappen, darunter
 * schiebt sie sich als Überlagerung darüber.
 *
 * **Sie muss zum `xl:` in `AppShell`, `AppSidebar` und `Backdrop` passen.**
 * Bis zum 12.08.2026 stand hier 768, im Markup aber `xl` — dazwischen war die
 * Leiste per CSS weggeschoben, während der Zustand sie für fest neben dem
 * Inhalt hielt: Auf jedem Fenster zwischen 768 und 1279 px gab es deshalb keine
 * Navigation, und der Knopf oben tat nichts. (Aus dem Template geerbt, dort
 * steht derselbe Widerspruch.)
 */
export const SIDEBAR_BREAKPOINT = 1280;

function subscribeToViewport(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function isMobileViewport() {
  return window.innerWidth < SIDEBAR_BREAKPOINT;
}

type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isMobile = useSyncExternalStore(
    subscribeToViewport,
    isMobileViewport,
    () => false,
  );

  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsMobileOpen(false);
  }

  // Escape schliesst, was über der Seite liegt (§3) — der Klick daneben tut es
  // über den Backdrop, die Taste fehlte.
  useEffect(() => {
    if (!isMobileOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMobileOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileOpen]);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const toggleSubmenu = (item: string) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  };

  return (
    <SidebarContext.Provider
      value={{
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen: isMobile && isMobileOpen,
        isHovered,
        activeItem,
        openSubmenu,
        toggleSidebar,
        toggleMobileSidebar,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
