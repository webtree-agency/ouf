import { BRUSH_PATH, DOT, LETTER_PATHS, STROKE_WIDTH } from "./logoPaths";

/** «ouf.» auf der Pinselfläche. In beiden Modi gleich: die Fläche trägt die Schrift. */
export default function BrandLogo({
  className = "h-8",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 100"
      role="img"
      aria-label="ouf."
      className={`w-auto ${className}`}
    >
      <path
        d={BRUSH_PATH}
        transform="rotate(-3 100 50)"
        className="fill-brand-300"
      />
      <g transform="translate(-7 4)" className="text-gray-800">
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {LETTER_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} fill="currentColor" />
      </g>
    </svg>
  );
}
