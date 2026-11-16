import Link from "next/link";

import Button from "@/components/ui/button/Button";

/** Nichts mehr fällig: was los ist und wohin es weitergeht. */
export default function LearnDone({ hasWaiting }: { hasWaiting: boolean }) {
  return (
    <div className="motion-safe:animate-card-in mt-16 flex flex-col items-center gap-4 text-center">
      <p className="text-theme-xl text-gray-800 dark:text-white/90">
        {hasWaiting
          ? "Gleich kommt wieder etwas."
          : "Für heute ist alles gelernt."}
      </p>
      <p className="text-theme-sm text-gray-500 dark:text-gray-400">
        {hasWaiting
          ? "Eine Karte im Lernschritt ist in mehr als 20 Minuten wieder dran."
          : "Morgen geht es weiter."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
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
