import DayBarChart from "@/components/charts/DayBarChart";
import ComponentCard from "@/components/common/ComponentCard";
import { formatCount } from "@/lib/format/number";
import { dayLabel, type DayCount } from "@/lib/stats/days";

export default function ForecastCard({ days }: { days: DayCount[] }) {
  const total = days.reduce((sum, day) => sum + day.count, 0);
  return (
    <ComponentCard
      title="Prognose, 14 Tage"
      desc={`${formatCount(total)} Wiederholungen, Neues nicht mitgezählt`}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <DayBarChart
          label="Fällige Wiederholungen je Tag"
          labels={days.map((day, index) =>
            index === 0 ? "heute" : dayLabel(day.day),
          )}
          series={[
            {
              name: "Fällig",
              values: days.map((day) => day.count),
              tone: "primary",
            },
          ]}
        />
        <ul className="text-theme-sm grid grid-flow-col grid-cols-2 grid-rows-7 gap-x-8 gap-y-1 self-start">
          {days.map((day, index) => (
            <li key={day.day} className="flex justify-between gap-3 py-0.5">
              <span className="text-gray-500 dark:text-gray-400">
                {index === 0 ? "heute" : dayLabel(day.day)}
              </span>
              <span className="font-medium text-gray-800 tabular-nums dark:text-white/90">
                {formatCount(day.count)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ComponentCard>
  );
}
