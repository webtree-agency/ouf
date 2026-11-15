/**
 * Welche Tage unter dem Diagramm beschriftet werden. Bei 30 Balken passen
 * nicht alle Namen, und überlappende blendet ApexCharts nur unzuverlässig aus;
 * die Zahlen stehen ohnehin daneben.
 */
export function thinLabels(labels: readonly string[]): string[] {
  const step = labels.length > 20 ? 7 : labels.length > 10 ? 2 : 1;
  const last = labels.length - 1;
  return labels.map((label, index) =>
    (last - index) % step === 0 ? label : "",
  );
}
