/** Gerundeter Anteil mit Zeichen — „38 %". Ohne Ganzes gibt es keinen Anteil. */
export function percentOf(part: number, whole: number): string {
  if (whole === 0) return "0 %";
  return `${Math.round((part / whole) * 100)} %`;
}
