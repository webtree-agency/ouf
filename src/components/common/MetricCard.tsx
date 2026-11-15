import Link from "next/link";

import Badge from "@/components/ui/badge/Badge";

/**
 * Wie sich die Zahl entwickelt hat. **Nicht immer ist mehr besser** — bei der
 * durchschnittlichen Position ist Platz 4 besser als Platz 11, und ein rotes
 * Minus stünde dort neben der besten Nachricht des Monats. Deshalb sagt der
 * Aufrufer die Richtung, statt dass die Kachel sie aus dem Vorzeichen rät.
 */
export type MetricChange = {
  text: string;
  direction: "hoch" | "runter" | "gleich";
};

/**
 * Eine Zahl, die man sonst zählen müsste — und darunter, woran sie sich misst.
 * Eine Zahl ohne Vergleich ist eine halbe Zahl (§3).
 */
export default function MetricCard({
  value,
  label,
  note,
  change,
  href,
  active,
}: {
  value: string;
  label: string;
  /**
   * Ein Satz unter der Beschriftung. **Darf fehlen** (28.08.2026): Wo die Zahl
   * für sich spricht, ist er eine Zeile, die man jedes Mal wieder überliest
   * (§3).
   */
  note?: string;
  change?: MetricChange;
  /** Die Kachel führt zur Liste, die sie zählt — die ganze Fläche ist der Weg. */
  href?: string;
  /**
   * Die Liste darunter gehört zu dieser Kachel. **Nur wo der Weg auf derselben
   * Seite bleibt**: Dann sagt der Rahmen, welche Zahl man gerade aufgeschlagen
   * hat, und die Ansicht springt beim Klick nicht nach oben (§3).
   */
  active?: boolean;
}) {
  const card = (
    <>
      {/*
        Absolut statt in einer Zeile neben der Zahl: Zahl, Beschriftung und
        Zusatz bleiben so **Geschwister**. Ein `div` dazwischen hat den E2E-Test
        der Projekte fallen lassen, der die Zahl als Vorgänger ihrer
        Beschriftung sucht — und dieselbe Verschachtelung hätte jeder
        Vorlesesoftware eine Kachel in zwei Teile zerlegt.
      */}
      {change && (
        <span className="absolute top-5 right-5 md:top-6 md:right-6">
          <Badge
            size="sm"
            color={
              change.direction === "hoch"
                ? "success"
                : change.direction === "runter"
                  ? "error"
                  : "light"
            }
          >
            {change.text}
          </Badge>
        </span>
      )}
      {/*
        **Eine Zahl bricht nicht.** „CHF 1'714" stand in vier Kacheln
        nebeneinander zweizeilig da, mit dem Betrag unter der Währung — das liest
        sich als zwei Angaben. Wird es wirklich zu breit, rückt das Abzeichen
        darüber, statt die Zahl zu zerlegen.
      */}
      <p className="text-title-sm pr-20 font-medium whitespace-nowrap text-gray-800 dark:text-white/90">
        {value}
      </p>
      <p className="text-theme-sm mt-4 text-gray-700 dark:text-gray-400">
        {label}
      </p>
      {note && (
        <p className="text-theme-xs mt-1 text-gray-500 dark:text-gray-500">
          {note}
        </p>
      )}
    </>
  );

  const frame =
    "relative block rounded-2xl border bg-white p-5 md:p-6 dark:bg-white/[0.03]";
  // Getrennt vom Rahmen, nicht angehängt: Zwei Randfarben in einer Klassenliste
  // gewinnen nach der Reihenfolge im Stylesheet, nicht nach der im String.
  const rand = active
    ? "border-brand-500"
    : "border-gray-200 dark:border-gray-800";

  if (href) {
    return (
      <Link
        href={href}
        scroll={active === undefined}
        className={`${frame} ${rand} hover:border-brand-300 dark:hover:border-brand-800 transition`}
      >
        {card}
      </Link>
    );
  }

  return <div className={`${frame} ${rand}`}>{card}</div>;
}

export function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {children}
    </div>
  );
}
