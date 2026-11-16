"use client"; // Gesteuerte Auswahl.

import { GENDER_LABELS, type Gender } from "@/lib/languages/catalog";

const GENDERS: { value: Gender | ""; label: string }[] = [
  { value: "m", label: "m" },
  { value: "f", label: "f" },
  { value: "", label: "–" },
];

export default function GenderField({
  value,
  onChange,
}: {
  value: Gender | "";
  onChange: (gender: Gender | "") => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">
        Genus
      </legend>
      <div className="inline-flex rounded-lg border border-gray-300 p-0.5 dark:border-gray-700">
        {GENDERS.map((option) => (
          <label
            key={option.value || "keins"}
            title={option.value ? GENDER_LABELS[option.value] : "kein Genus"}
            className={`text-theme-sm has-focus-visible:ring-brand-500 flex h-10 min-w-12 cursor-pointer items-center justify-center rounded-md px-3 font-medium has-focus-visible:ring-2 ${
              value === option.value
                ? "bg-brand-50 dark:bg-brand-300/10 dark:text-brand-300 text-gray-900"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
            }`}
          >
            <input
              type="radio"
              name="card-gender"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span aria-hidden>{option.label}</span>
            <span className="sr-only">
              {option.value ? GENDER_LABELS[option.value] : "kein Genus"}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
