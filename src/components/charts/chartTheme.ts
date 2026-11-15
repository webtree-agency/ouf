"use client";

import { useTheme } from "@/context/ThemeContext";

/**
 * Achsen, Raster und Serien folgen dem Modus. Die Werte sind die aus
 * `globals.css`; ApexCharts nimmt keine Klassen, nur Farben.
 */
export function useChartTheme() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return {
    text: dark ? "#9ea5b0" : "#666f7e",
    grid: dark ? "#182333" : "#eef0f4",
    primary: dark ? "#bbd3f2" : "#4270aa",
    muted: dark ? "#4e5969" : "#ccd1d9",
  };
}
