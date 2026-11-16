import NewDeckButton from "@/components/decks/NewDeckButton";
import Button from "@/components/ui/button/Button";
import { ArrowRightIcon } from "@/icons";
import type { DeckRow } from "@/lib/queries/decks";

/** Was heute ansteht, über alle Decks der Sprache, mit dem Weg zum Lernen. */
export default function TodayCard({ decks }: { decks: DeckRow[] }) {
  const neu = decks.reduce((sum, deck) => sum + deck.newToday, 0);
  const faellig = decks.reduce((sum, deck) => sum + deck.dueCount, 0);
  const total = neu + faellig;

  return (
    <section className="bg-brand-300 dark:bg-brand-300/10 rounded-2xl p-5 text-gray-900 md:p-6 dark:text-white/90">
      <h2 className="text-theme-xs font-medium tracking-wide uppercase">
        Heute
      </h2>
      {decks.length === 0 ? (
        <>
          <p className="mt-2 mb-4 text-base">
            Leg ein Deck an, dann kannst du Karten erfassen.
          </p>
          <NewDeckButton />
        </>
      ) : total === 0 ? (
        <p className="text-theme-xl mt-2 font-medium">
          Für heute ist alles gelernt.
        </p>
      ) : (
        <>
          <p className="text-title-md mt-2 font-medium">
            {total === 1 ? "1 Karte" : `${total} Karten`}
          </p>
          <p className="text-theme-sm mt-1">
            {[
              neu > 0 && `${neu} neu`,
              faellig > 0 && `${faellig} zum Wiederholen`,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          <Button
            href="/lernen"
            className="mt-5 w-full md:w-auto md:min-w-64"
            endIcon={<ArrowRightIcon />}
          >
            Lernen
          </Button>
        </>
      )}
    </section>
  );
}
