/**
 * Tage in Folge mit mindestens einer Bewertung. Wer heute noch nicht gelernt
 * hat, verliert die Serie erst um Mitternacht; bis dahin zählt sie bis gestern.
 */
export function streak(days: Iterable<string>, today: string): number {
  const learned = new Set(days);
  let day = learned.has(today) ? today : previous(today);
  let count = 0;
  while (learned.has(day)) {
    count += 1;
    day = previous(day);
  }
  return count;
}

/** Der Kalendertag davor; `YYYY-MM-DD` hat keine Zeitzone. */
function previous(day: string): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
