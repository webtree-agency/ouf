import { formatCount } from "./number.ts";

export type Unit = { one: string; many: string };

/** „1 Projekt" statt „1 Projekte" — mit gruppierter Zahl davor. */
export function counted(count: number, unit: Unit): string {
  return `${formatCount(count)} ${count === 1 ? unit.one : unit.many}`;
}
