"use client"; // ApexCharts zeichnet im Browser.

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

import { thinLabels } from "@/lib/stats/axis";

import { useChartTheme } from "./chartTheme";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export type BarSeries = {
  name: string;
  values: number[];
  tone: "primary" | "muted";
};

/**
 * Balken je Tag. **Kein Tooltip, keine Legende**: Die Zahlen stehen daneben,
 * auf dem Handy gibt es kein Darüberfahren (CLAUDE.md §3).
 */
export default function DayBarChart({
  labels,
  series,
  height = 220,
  label,
}: {
  labels: string[];
  series: BarSeries[];
  height?: number;
  /** Was das Diagramm zeigt, für die Vorlesehilfe. */
  label: string;
}) {
  const farbe = useChartTheme();
  const options: ApexOptions = {
    colors: series.map((entry) => farbe[entry.tone]),
    chart: {
      type: "bar",
      stacked: series.length > 1,
      fontFamily: "inherit",
      toolbar: { show: false },
      animations: { enabled: false },
      zoom: { enabled: false },
    },
    plotOptions: {
      bar: {
        columnWidth: "60%",
        borderRadius: 3,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: farbe.grid,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { left: 0, right: 0 },
    },
    xaxis: {
      categories: thinLabels(labels),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: 0,
        hideOverlappingLabels: false,
        style: { colors: farbe.text, fontSize: "12px" },
      },
      tooltip: { enabled: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        style: { colors: farbe.text, fontSize: "12px" },
        formatter: (value) => String(Math.round(value)),
      },
    },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
    tooltip: { enabled: false },
    legend: { show: false },
  };

  return (
    <div role="img" aria-label={label} className="-mx-2">
      <ReactApexChart
        type="bar"
        height={height}
        options={options}
        series={series.map((entry) => ({
          name: entry.name,
          data: entry.values,
        }))}
      />
    </div>
  );
}
