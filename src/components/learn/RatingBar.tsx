import type { Rating } from "@/lib/learning/scheduler";

export const RATING_LABELS: Record<Rating, string> = {
  1: "Nochmal",
  2: "Schwer",
  3: "Gut",
  4: "Leicht",
};

const BUTTON =
  "flex h-14 flex-col items-center justify-center rounded-xl text-sm font-medium transition disabled:cursor-not-allowed";
const OUTLINE =
  "bg-white text-gray-800 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-gray-900 dark:text-white/90 dark:ring-gray-700 dark:hover:bg-white/5";
const PRIMARY =
  "bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-300 dark:text-gray-900 dark:hover:bg-brand-200";

/** Vier gleich breite Knöpfe, unter jedem das nächste Intervall. „Gut" ist der Hauptknopf. */
export default function RatingBar({
  intervals,
  onRate,
  disabled,
}: {
  intervals: Record<Rating, string>;
  onRate: (rating: Rating) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {([1, 2, 3, 4] as const).map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onRate(rating)}
          disabled={disabled}
          aria-keyshortcuts={String(rating)}
          className={`${BUTTON} ${rating === 3 ? PRIMARY : OUTLINE}`}
        >
          <span>{RATING_LABELS[rating]}</span>
          <span
            className={`text-theme-xs ${rating === 3 ? "opacity-80" : "text-gray-500 dark:text-gray-400"}`}
          >
            {intervals[rating]}
          </span>
        </button>
      ))}
    </div>
  );
}
