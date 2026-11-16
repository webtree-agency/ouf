import MetricCard from "@/components/common/MetricCard";
import { formatCount } from "@/lib/format/number";
import type { Tiles } from "@/lib/queries/stats";

function percent(value: number | null): string {
  return value === null ? "–" : `${value} %`;
}

export default function StatTiles({ tiles }: { tiles: Tiles }) {
  return (
    <div className="stagger grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-4">
      <MetricCard
        value={formatCount(tiles.dueToday)}
        label="Heute fällig"
        comparison={`morgen ${formatCount(tiles.dueTomorrow)}`}
      />
      <MetricCard
        value={formatCount(tiles.newToday)}
        label="Heute neu"
        comparison={
          tiles.newTotal === 0
            ? "keine neuen mehr"
            : `von ${formatCount(tiles.newTotal)} neuen`
        }
      />
      <MetricCard
        value={formatCount(tiles.learnedToday)}
        label="Heute gelernt"
        comparison={`gestern ${formatCount(tiles.learnedYesterday)}`}
      />
      <MetricCard
        value={percent(tiles.accuracy)}
        label="Trefferquote"
        comparison={
          tiles.accuracy === null
            ? "noch keine Wiederholung"
            : `30 Tage, davor ${percent(tiles.accuracyBefore)}`
        }
      />
    </div>
  );
}
