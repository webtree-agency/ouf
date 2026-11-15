"use client"; // Die Seite steht in der Adresse, gelesen wird sie im Browser.

import Link from "next/link";

import { useQueryHref } from "@/hooks/useQueryHref";

const STEP =
  "shadow-theme-xs flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]";

/**
 * Geblättert wird über Links, nicht über Knöpfe: eine Seite bleibt so teilbar,
 * lässt sich in einem neuen Tab öffnen und überlebt das Neuladen. Welche Seite
 * gilt, sagt die Adresse — der Server liest denselben Wert.
 */
export default function Pagination({
  page,
  pageCount,
  param = "seite",
}: {
  page: number;
  pageCount: number;
  param?: string;
}) {
  const { href } = useQueryHref();
  if (pageCount <= 1) return null;

  // Höchstens drei Zahlen, die aktuelle in der Mitte, an den Rändern verschoben.
  const first = Math.max(1, Math.min(page - 1, pageCount - 2));
  const around = Array.from(
    { length: Math.min(3, pageCount) },
    (_, index) => first + index,
  );

  const linkFor = (target: number) =>
    href({ [param]: target === 1 ? null : String(target) });

  return (
    <nav aria-label="Seiten" className="flex items-center gap-2.5">
      {page > 1 ? (
        <Link href={linkFor(page - 1)} scroll={false} className={STEP}>
          Zurück
        </Link>
      ) : (
        <span className={`${STEP} opacity-50`}>Zurück</span>
      )}

      <div className="flex items-center gap-2">
        {page > 3 && <span className="px-2 text-gray-500">…</span>}
        {around.map((target) => (
          <Link
            key={target}
            href={linkFor(target)}
            scroll={false}
            aria-current={target === page ? "page" : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
              target === page
                ? "bg-brand-600 dark:bg-brand-300 text-white dark:text-gray-900"
                : "hover:text-brand-600 text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            }`}
          >
            {target}
          </Link>
        ))}
        {page < pageCount - 2 && <span className="px-2 text-gray-500">…</span>}
      </div>

      {page < pageCount ? (
        <Link href={linkFor(page + 1)} scroll={false} className={STEP}>
          Weiter
        </Link>
      ) : (
        <span className={`${STEP} opacity-50`}>Weiter</span>
      )}
    </nav>
  );
}
