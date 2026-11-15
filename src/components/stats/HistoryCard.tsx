import DayBarChart from "@/components/charts/DayBarChart";
import ComponentCard from "@/components/common/ComponentCard";
import { formatCount } from "@/lib/format/number";
import type { HistoryDay } from "@/lib/queries/stats";
import { dayLabel, share } from "@/lib/stats/days";

export default function HistoryCard({ days }: { days: HistoryDay[] }) {
  const total = days.reduce((sum, day) => sum + day.remembered + day.again, 0);
  const again = days.reduce((sum, day) => sum + day.again, 0);
  const active = days.filter((day) => day.remembered + day.again > 0).length;
  const best = days.reduce(
    (max, day) => Math.max(max, day.remembered + day.again),
    0,
  );
  const facts = [
    { label: "Bewertungen", value: formatCount(total) },
    { label: "Tage gelernt", value: `${active} von ${days.length}` },
    {
      label: "Schnitt je Lerntag",
      value: formatCount(active ? Math.round(total / active) : 0),
    },
    { label: "Meiste an einem Tag", value: formatCount(best) },
    {
      label: "Davon Nochmal",
      value: share(again, total) === null ? "–" : `${share(again, total)} %`,
    },
  ];

  return (
    <ComponentCard title="Verlauf, 30 Tage">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <DayBarChart
            label="Bewertungen je Tag, gewusst und Nochmal"
            labels={days.map((day) => dayLabel(day.day))}
            series={[
              {
                name: "Gewusst",
                values: days.map((day) => day.remembered),
                tone: "primary",
              },
              {
                name: "Nochmal",
                values: days.map((day) => day.again),
                tone: "muted",
              },
            ]}
          />
          <p className="text-theme-xs mt-1 flex gap-4 text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="bg-brand-600 dark:bg-brand-300 size-2.5 rounded-full"
              />
              gewusst
            </span>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-2.5 rounded-full bg-gray-300 dark:bg-gray-600"
              />
              Nochmal
            </span>
          </p>
        </div>
        <dl className="text-theme-sm space-y-2 self-start">
          {facts.map((fact) => (
            <div key={fact.label} className="flex justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">{fact.label}</dt>
              <dd className="font-medium text-gray-800 tabular-nums dark:text-white/90">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </ComponentCard>
  );
}
