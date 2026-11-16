import Link from "next/link";

import Button from "@/components/ui/button/Button";
import { withFilter, type LearnFilter } from "@/lib/learning/filter";

/** Nichts mehr dran: was los ist und wohin es weitergeht. */
export default function LearnDone({
  hasWaiting,
  filter,
}: {
  hasWaiting: boolean;
  filter: LearnFilter;
}) {
  const narrowed = Boolean(
    filter.deckId ||
    filter.tag ||
    filter.gender ||
    filter.level ||
    filter.direction,
  );
  return (
    <div className="motion-safe:animate-card-in mt-16 flex flex-col items-center gap-4 text-center">
      <p className="text-theme-xl text-gray-800 dark:text-white/90">
        {hasWaiting
          ? "Gleich kommt wieder etwas."
          : filter.all
            ? "Alles in dieser Auswahl ist heute durch."
            : narrowed
              ? "In dieser Auswahl ist heute nichts fällig."
              : "Für heute ist alles gelernt."}
      </p>
      <p className="text-theme-sm text-gray-500 dark:text-gray-400">
        {hasWaiting
          ? "Eine Karte im Lernschritt ist in mehr als 20 Minuten wieder dran."
          : filter.all
            ? "Morgen kommt alles wieder."
            : "Morgen geht es weiter."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {!filter.all && !hasWaiting && (
          <Button href={withFilter(filter, { all: true })}>Alles üben</Button>
        )}
        <Button href="/" variant="outline">
          Zur Übersicht
        </Button>
        <Button href="/karten/neu" variant="outline">
          Karte erfassen
        </Button>
      </div>
      <Link href="/statistik" className="text-theme-sm link-brand">
        Statistik
      </Link>
    </div>
  );
}
