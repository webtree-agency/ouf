"use client"; // Aufklapper und Wechsel sind Interaktionen.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";

import { switchLanguage } from "@/app/(app)/sprachen/actions";
import { MENU_ITEM } from "@/components/shell/menuItem";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { CheckLineIcon, ChevronDownIcon, GlobeIcon } from "@/icons";

export type LanguageChoice = { id: string; name: string };

/** Ein Klick wechselt die Sprache; Übersicht, Decks und Statistik folgen. */
export default function LanguageSwitcher({
  languages,
  activeId,
}: {
  languages: LanguageChoice[];
  activeId: string | null;
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
        className="text-theme-sm flex h-11 items-center gap-2 rounded-lg border border-gray-200 px-3 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
      >
        <GlobeIcon className="hidden size-5 text-gray-500 sm:block dark:text-gray-400" />
        <span className={pending ? "opacity-60" : ""}>
          {active?.name ?? "Sprache"}
        </span>
        <ChevronDownIcon className={`size-5 ${open ? "rotate-180" : ""}`} />
      </button>

      <Dropdown
        isOpen={open}
        onClose={() => setOpen(false)}
        toggle={toggle}
        className="right-auto left-0 w-60 p-2"
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
                  <CheckLineIcon className="text-brand-600 dark:text-brand-300 size-5" />
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
