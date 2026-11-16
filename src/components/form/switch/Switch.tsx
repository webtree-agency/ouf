/** Zeigt einen Stand an; geschaltet wird über das Element, das ihn umgibt. */
export default function Switch({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative inline-block h-6 w-11 shrink-0 rounded-full transition duration-150 ${
        checked
          ? "dark:bg-brand-300 bg-gray-800"
          : "bg-gray-200 dark:bg-white/10"
      }`}
    >
      <span
        className={`shadow-theme-sm absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition duration-150 ${
          checked ? "translate-x-full" : "translate-x-0"
        }`}
      />
    </span>
  );
}
