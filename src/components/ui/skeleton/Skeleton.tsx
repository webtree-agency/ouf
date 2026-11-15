/**
 * **Was lädt, hält seinen Platz frei.** Ein Skelett hat die Höhe dessen, was
 * es vertritt — Kachel, Tabelle, Karte —, damit beim Eintreffen nichts
 * springt (§3, „Was man nicht sieht"). Die Flächen sind bewusst ohne Text:
 * eine Zeile „Wird geladen" liest niemand, die Vorlesehilfe bekommt sie über
 * `aria-busy` und den versteckten Satz.
 */
export default function Skeleton({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded bg-gray-100 dark:bg-white/5 ${className}`}
    />
  );
}

export const CARD =
  "rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900";

/** Eine Karte ohne Inhalt, so hoch wie die, die sie vertritt. */
export function CardSkeleton({
  lines = 4,
  title = true,
}: {
  lines?: number;
  title?: boolean;
}) {
  return (
    <div className={`${CARD} p-4 sm:p-6`}>
      {title && <Skeleton className="mb-6 h-5 w-40" />}
      <div className="space-y-3">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className={i % 3 === 2 ? "h-4 w-2/3" : "h-4"} />
        ))}
      </div>
    </div>
  );
}

/** Die Kennzahl-Kacheln einer Bereichs-Übersicht (`MetricGrid`). */
export function TilesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${CARD} p-5 md:p-6`}>
          <Skeleton className="h-9 w-24" />
          <Skeleton className="mt-4 h-4 w-28" />
          <Skeleton className="mt-2 h-3 w-36" />
        </div>
      ))}
    </div>
  );
}

/** Eine Liste in ihrer Karte: Kopfzeile, Zeilen, Fusszeile mit Blättern. */
export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className={`${CARD} p-4 sm:p-6`}>
      <Skeleton className="mb-6 h-9 w-44" />
      <div className="space-y-4">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="hidden h-4 w-32 sm:block" />
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}

/** Die Filterkarte über einer Liste: drei Felder nebeneinander. */
export function FiltersSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className={`${CARD} p-4 sm:p-6`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i}>
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-11" />
          </div>
        ))}
      </div>
    </div>
  );
}
