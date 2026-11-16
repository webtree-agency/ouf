import ComponentCard from "@/components/common/ComponentCard";
import { formatCount, formatDollars } from "@/lib/format/number";
import type { TaskUsage } from "@/lib/queries/usage";

const LABELS: Record<TaskUsage["task"], string> = {
  transcribe: "Aufnahmen abgeschrieben",
  card: "Karten vorgeschlagen",
  example: "Beispielsätze",
  translate: "Übersetzungen beim Tippen",
};

/** Was Diktat und Vorschläge diesen Monat gekostet haben, von ouf. selbst gerechnet. */
export default function AccountUsage({
  tasks,
  total,
}: {
  tasks: TaskUsage[];
  total: number;
}) {
  return (
    <ComponentCard title="Diktat und Vorschläge diesen Monat">
      {tasks.length === 0 ? (
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          Noch nichts diktiert oder vorgeschlagen.
        </p>
      ) : (
        <dl className="text-theme-sm divide-y divide-gray-100 dark:divide-gray-800">
          {tasks.map((task) => (
            <div key={task.task} className="flex justify-between gap-4 py-2.5">
              <dt className="text-gray-600 dark:text-gray-400">
                {LABELS[task.task]}
              </dt>
              <dd className="text-gray-800 tabular-nums dark:text-white/90">
                {formatCount(task.calls)} · {formatDollars(task.cost)}
              </dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 pt-3 font-medium">
            <dt className="text-gray-800 dark:text-white/90">Zusammen</dt>
            <dd className="text-gray-900 tabular-nums dark:text-white">
              {formatDollars(total)}
            </dd>
          </div>
        </dl>
      )}
      <p className="text-theme-xs mt-3 text-gray-500 dark:text-gray-400">
        Zu Listenpreisen gerechnet. Die Rechtschreibung kostet nichts.
      </p>
    </ComponentCard>
  );
}
