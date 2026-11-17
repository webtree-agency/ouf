import { SoundIcon } from "@/icons";
import { GENDER_LABELS } from "@/lib/languages/catalog";
import type { StudyCard } from "@/lib/learning/session";

const SPEAK =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90";

/** Das Blatt: die Frage gross, nach dem Aufdecken die Antwort darunter. */
export default function StudyCardView({
  card,
  revealed,
  flips = 0,
  onFlip,
  onSpeak,
}: {
  card: StudyCard;
  revealed: boolean;
  /** Wie oft diese Karte schon gedreht wurde; nur dann dreht sie sich sichtbar. */
  flips?: number;
  /** Antippen der Karte dreht sie um, in beide Richtungen. */
  onFlip?: () => void;
  /** Nur, wenn der Browser vorlesen kann. */
  onSpeak?: (text: string) => void;
}) {
  const forward = card.direction === "forward";
  const prompt = forward ? card.front : card.back;
  const answer = forward ? card.back : card.front;
  const speakFront =
    onSpeak && (forward || revealed) ? () => onSpeak(card.front) : undefined;

  // Das Genus gehört zum französischen Wort, nicht zur Übersetzung.
  const gender = card.gender && (
    <p className="text-theme-sm mt-2 text-gray-500 dark:text-gray-400">
      {GENDER_LABELS[card.gender]}
    </p>
  );

  return (
    // Kein <button>: Darin liegen die Knöpfe zum Vorlesen. Die Tastatur deckt mit
    // der Leertaste auf, am Desktop steht der Knopf „Aufdecken“ darunter.
    <div
      key={flips}
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest("button")) onFlip?.();
      }}
      className={`${flips > 0 ? "motion-safe:animate-flip" : ""} relative flex min-h-72 w-full cursor-pointer flex-col justify-center rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center select-none sm:px-12 dark:border-gray-800 dark:bg-gray-900`}
    >
      {/* Oben rechts in der Ecke, damit das Wort genau in der Mitte steht. */}
      {speakFront && (
        <button
          type="button"
          onClick={speakFront}
          aria-label="Vorlesen"
          title="Vorlesen (V)"
          className={`${SPEAK} absolute top-3 right-3`}
        >
          <SoundIcon />
        </button>
      )}
      <p
        className="text-title-md sm:text-title-lg break-words text-gray-800 dark:text-white/90"
        lang={forward ? "fr" : "de"}
      >
        {prompt}
      </p>
      {forward && revealed && gender}
      {!forward && (
        <p className="text-theme-xs mt-2 text-gray-500 dark:text-gray-400">
          umgekehrt
        </p>
      )}

      {revealed && (
        <div className="motion-safe:animate-reveal mt-8 border-t border-gray-100 pt-8 dark:border-gray-800">
          <p
            className="text-title-sm break-words text-gray-800 dark:text-white/90"
            lang={forward ? "de" : "fr"}
          >
            {answer}
          </p>
          {!forward && gender}
          {card.example && (
            // Der Satz in einem eigenen Feld, der Lautsprecher rechts darin; der Satz bleibt mittig.
            <div className="relative mt-6 rounded-xl bg-gray-50 px-12 py-3 dark:bg-white/5">
              <p
                className="text-base text-gray-700 dark:text-gray-300"
                lang="fr"
              >
                {card.example}
              </p>
              {onSpeak && (
                <button
                  type="button"
                  onClick={() => onSpeak(card.example ?? "")}
                  aria-label="Beispielsatz vorlesen"
                  title="Beispielsatz vorlesen"
                  className={`${SPEAK} absolute top-1/2 right-0.5 -translate-y-1/2`}
                >
                  <SoundIcon />
                </button>
              )}
            </div>
          )}
          {card.note && (
            <p className="text-theme-sm mt-3 text-gray-500 dark:text-gray-400">
              {card.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
