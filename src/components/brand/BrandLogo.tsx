import {
  DOT,
  LETTER_PATHS,
  LOGO_VIEWBOX,
  RING,
  SHEEN,
  STROKE_WIDTH,
} from "./logoPaths";

/**
 * «ouf.» in einem Zug: Ring, Striche und Punkt im Verlauf des App-Icons. Die
 * Kennung des Verlaufs ist fest; zwei Logos auf einer Seite teilen dieselbe
 * Definition.
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
          x1="48"
          y1="12"
          x2="178"
          y2="74"
        >
          {SHEEN.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke="url(#ouf-sheen)"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="butt"
      >
        <circle cx={RING.cx} cy={RING.cy} r={RING.r} />
        {LETTER_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} fill="url(#ouf-sheen)" />
    </svg>
  );
}
