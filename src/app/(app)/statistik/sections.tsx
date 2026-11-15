import ForecastCard from "@/components/stats/ForecastCard";
import HistoryCard from "@/components/stats/HistoryCard";
import StatTiles from "@/components/stats/StatTiles";
import { forecast, history, tiles } from "@/lib/queries/stats";

type Scope = { userId: string; languageId: string };

export async function TilesSection({ scope }: { scope: Scope }) {
  return <StatTiles tiles={await tiles(scope)} />;
}

export async function ForecastSection({ scope }: { scope: Scope }) {
  return <ForecastCard days={await forecast(scope, new Date(), 14)} />;
}

export async function HistorySection({ scope }: { scope: Scope }) {
  return <HistoryCard days={await history(scope, new Date(), 30)} />;
}
