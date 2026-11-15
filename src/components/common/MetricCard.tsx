import { CARD } from "@/components/common/card";

/** Eine Zahl, die man sonst zählen müsste, und darunter, woran sie sich misst (§3). */
export default function MetricCard({
  value,
  label,
  comparison,
}: {
  value: string;
  label: string;
  comparison: string;
}) {
  return (
    <div className={`${CARD} p-5 md:p-6`}>
      <p className="text-title-md font-medium whitespace-nowrap text-gray-800 dark:text-white/90">
        {value}
      </p>
      <p className="text-theme-sm mt-3 text-gray-700 dark:text-gray-300">
        {label}
      </p>
      <p className="text-theme-xs mt-1 text-gray-500 dark:text-gray-400">
        {comparison}
      </p>
    </div>
  );
}
