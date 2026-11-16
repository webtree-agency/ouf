import { FlameIcon } from "@/icons";

/** Tage in Folge gelernt. Ohne Serie bleibt die Flamme grau. */
export default function StreakBadge({ days }: { days: number }) {
  const label =
    days === 1 ? "1 Tag in Folge gelernt" : `${days} Tage in Folge gelernt`;
  return (
    <p
      title={label}
      aria-label={label}
      className={`text-theme-sm flex h-11 items-center gap-1 px-1 font-medium tabular-nums ${
        days > 0
          ? "text-gray-900 dark:text-white/90"
          : "text-gray-400 dark:text-gray-500"
      }`}
    >
      <FlameIcon
        aria-hidden
        className={days > 0 ? "text-warning-500" : undefined}
      />
      {days}
    </p>
  );
}
