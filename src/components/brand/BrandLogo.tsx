import {
  DOT,
  LETTER_PATHS,
  LOGO_VIEWBOX,
  RING,
  SHEEN,
  STROKE_WIDTH,
} from "./logoPaths";

/**
 * «ouf.»: Ring und Punkt im Verlauf des App-Icons, «uf» in Tinte, dunkel in
 * Weiss. Die Kennung des Verlaufs ist fest; zwei Logos auf einer Seite teilen
 * dieselbe Definition.
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
        <linearGradient
          id="ouf-sheen"
          gradientUnits="userSpaceOnUse"
          x1="51"
          y1="30"
          x2="98"
          y2="75"
        >
          {SHEEN.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
        {/* Wie im Icon: der Punkt liegt im hinteren Teil des Verlaufs. */}
        <linearGradient id="ouf-dot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4270aa" />
          <stop offset="1" stopColor="#89b1e3" />
        </linearGradient>
      </defs>
      <circle
        cx={RING.cx}
        cy={RING.cy}
        r={RING.r}
        fill="none"
        stroke="url(#ouf-sheen)"
        strokeWidth={RING.width}
      />
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-900 dark:text-white"
      >
        {LETTER_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} fill="url(#ouf-dot)" />
    </svg>
  );
}
