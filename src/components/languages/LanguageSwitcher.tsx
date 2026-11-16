"use client"; // Aufklapper und Wechsel sind Interaktionen.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";

import { switchLanguage } from "@/app/(app)/sprachen/actions";
import { MENU_ITEM } from "@/components/shell/menuItem";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { CheckLineIcon, ChevronDownIcon, GlobeIcon } from "@/icons";

export type LanguageChoice = { id: string; name: string; code: string };

/** Ein Klick wechselt die Sprache; Übersicht, Decks und Statistik folgen. */
export default function LanguageSwitcher({
  languages,
  activeId,
  inBar = false,
}: {
  languages: LanguageChoice[];
  activeId: string | null;
  /** In der Leiste unten: nur das Kürzel, das Menü klappt nach oben auf. */
  inBar?: boolean;
}) {
  const pathname = usePathname();
  const [toggle, setToggle] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const active = languages.find((language) => language.id === activeId);

  function choose(id: string) {
    setOpen(false);
    if (id === activeId) return;
    startTransition(async () => {
      await switchLanguage(id, pathname);
    });
  }

  if (languages.length === 0) return null;

  return (
    <div className="relative">
      <button
        ref={setToggle}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Sprache: ${active?.name ?? "keine"}`}
        className="text-theme-sm flex h-11 items-center gap-1.5 rounded-full px-3 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
      >
        <GlobeIcon className="size-5 text-gray-500 dark:text-gray-400" />
        {/* Das Kürzel reicht; der volle Name steht im Menü. */}
        <span className={`uppercase ${pending ? "opacity-60" : ""}`}>
          {active?.code ?? "?"}
        </span>
        <ChevronDownIcon className={`size-5 ${open ? "rotate-180" : ""}`} />
      </button>

      <Dropdown
        isOpen={open}
        onClose={() => setOpen(false)}
        toggle={toggle}
        className={`right-0 left-auto w-60 p-2 ${inBar ? "top-auto bottom-full mt-0 mb-3" : ""}`}
      >
        <ul role="menu">
          {languages.map((language) => (
            <li key={language.id} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={language.id === activeId}
                onClick={() => choose(language.id)}
                className={`w-full ${MENU_ITEM}`}
              >
                <span className="flex-1 text-left">{language.name}</span>
                {language.id === activeId && (
                  <CheckLineIcon className="dark:text-brand-300 size-5 text-gray-900" />
                )}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-800">
          <Link
            href="/sprachen"
            onClick={() => setOpen(false)}
            className={MENU_ITEM}
          >
            Sprachen verwalten
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
