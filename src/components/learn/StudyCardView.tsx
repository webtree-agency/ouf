import { SoundIcon } from "@/icons";
import { GENDER_LABELS } from "@/lib/languages/catalog";
import type { StudyCard } from "@/lib/learning/session";

const SPEAK =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90";

/** Das Blatt: die Frage gross, nach dem Aufdecken die Antwort darunter. */
export default function StudyCardView({
  card,
  revealed,
  onSpeak,
}: {
  card: StudyCard;
  revealed: boolean;
  /** Nur, wenn der Browser vorlesen kann. */
  onSpeak?: (text: string) => void;
}) {
  const forward = card.direction === "forward";
  const prompt = forward ? card.front : card.back;
  const answer = forward ? card.back : card.front;
  const speakFront =
    onSpeak && (forward || revealed) ? () => onSpeak(card.front) : undefined;

  return (
    <div className="flex min-h-72 w-full flex-col justify-center rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center sm:px-10 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-center gap-2">
        <p
          className="text-title-md sm:text-title-lg break-words text-gray-800 dark:text-white/90"
          lang={forward ? "fr" : "de"}
        >
          {prompt}
        </p>
        {forward && speakFront && (
          <button
            type="button"
            onClick={speakFront}
            aria-label="Vorlesen"
            title="Vorlesen (V)"
            className={SPEAK}
          >
            <SoundIcon />
          </button>
        )}
      </div>
      {!forward && (
        <p className="text-theme-xs mt-2 text-gray-500 dark:text-gray-400">
          umgekehrt
        </p>
      )}

      {revealed && (
        <div className="motion-safe:animate-reveal mt-8 border-t border-gray-100 pt-8 dark:border-gray-800">
          <div className="flex items-center justify-center gap-2">
            <p className="text-title-sm break-words text-gray-800 dark:text-white/90">
              {answer}
            </p>
            {!forward && speakFront && (
              <button
                type="button"
                onClick={speakFront}
                aria-label="Vorlesen"
                title="Vorlesen (V)"
                className={SPEAK}
              >
                <SoundIcon />
              </button>
            )}
          </div>
          {card.gender && (
            <p className="text-theme-sm mt-2 text-gray-500 dark:text-gray-400">
              {GENDER_LABELS[card.gender]}
            </p>
          )}
          {card.example && (
            <p
              className="mt-6 text-base text-gray-700 dark:text-gray-300"
              lang="fr"
            >
              {card.example}
              {onSpeak && (
                <button
                  type="button"
                  onClick={() => onSpeak(card.example ?? "")}
                  aria-label="Beispielsatz vorlesen"
                  title="Beispielsatz vorlesen"
                  className={`${SPEAK} ml-1 inline-flex align-middle`}
                >
                  <SoundIcon />
                </button>
              )}
            </p>
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
