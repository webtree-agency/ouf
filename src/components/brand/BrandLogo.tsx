import { DOT_PATH, LETTERS_PATH, LOGO_VIEWBOX } from "./logoPaths";

/**
 * «ouf.» in Outfit: die Schrift in Tinte, dunkel in Weiss, nur der Punkt im
 * blauen Verlauf des App-Icons. Die Kennung des Verlaufs ist fest; zwei Logos
 * auf einer Seite teilen dieselbe Definition.
 */
export default function BrandLogo({
  className = "h-8",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      role="img"
      aria-label="ouf."
      className={`w-auto ${className}`}
    >
      <defs>
        <linearGradient id="ouf-dot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#89b1e3" />
          <stop offset="1" stopColor="#4270aa" />
        </linearGradient>
      </defs>
      <path d={LETTERS_PATH} className="fill-gray-900 dark:fill-white" />
      <path d={DOT_PATH} fill="url(#ouf-dot)" />
    </svg>
  );
}
