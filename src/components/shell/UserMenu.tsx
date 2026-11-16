"use client"; // Aufklappbares Menü mit Klick nach aussen.

import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import { menuKey } from "@/components/shell/menuKey";
import { MENU_ITEM } from "@/components/shell/menuItem";
import { NAV_ICONS } from "@/components/shell/navIcons";
import ThemeMenuItem from "@/components/shell/ThemeMenuItem";
import { useClickOutside } from "@/hooks/useClickOutside";
import { LogoutIcon } from "@/icons";
import { PERSONAL_LINKS } from "@/lib/navigation";

export default function UserMenu({
  name,
  email,
  signOut,
  inBar = false,
}: {
  name: string;
  email: string;
  signOut: () => Promise<void>;
  /** In der Leiste unten klappt das Menü nach oben auf. */
  inBar?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [leaving, startLeaving] = useTransition();
  const container = useRef<HTMLDivElement>(null);
  useClickOutside(container, () => setOpen(false));

  function leave() {
    startLeaving(async () => {
      await signOut();
      window.location.assign("/anmelden");
    });
  }

  return (
    <div
      className="relative"
      ref={container}
      onKeyDown={menuKey(() => setOpen(false))}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menü von ${name}`}
        className="text-theme-sm flex h-11 w-11 items-center justify-center rounded-full font-medium hover:bg-gray-100 dark:hover:bg-white/5"
      >
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200/70 text-gray-800 dark:bg-white/10 dark:text-white/90"
        >
          {initial(name)}
        </span>
      </button>

      {open && (
        <div
          className={`motion-safe:animate-pop shadow-theme-lg absolute right-0 z-99 w-64 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 ${inBar ? "bottom-full mb-3" : "mt-2"}`}
        >
          <p className="text-theme-sm truncate px-3 font-medium text-gray-800 dark:text-white/90">
            {name}
          </p>
          <p className="text-theme-xs truncate px-3 text-gray-500 dark:text-gray-400">
            {email}
          </p>

          <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
            {PERSONAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={MENU_ITEM}
              >
                <span className="menu-item-icon">{NAV_ICONS[link.icon]}</span>
                {link.label}
              </Link>
            ))}
            <ThemeMenuItem />
            <form action={leave}>
              <button
                type="submit"
                disabled={leaving}
                className={`w-full ${MENU_ITEM}`}
              >
                <span className="menu-item-icon">
                  <LogoutIcon />
                </span>
                {leaving ? "Wird abgemeldet …" : "Abmelden"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}
