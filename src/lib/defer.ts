import { AsyncLocalStorage } from "node:async_hooks";

import { logger } from "./logger.ts";

/**
 * **Was nach dem Speichern kommt, wartet nicht auf die Antwort** (Jann,
 * 18.09.2026 bei den Anfragen, 15.11.2026: „lädt so lange und so komisch“).
 * Mails, ClickUp, Discord, Kalender laufen, wenn die Antwort schon beim
 * Browser ist. Ohne `defer` (Cron, Skripte, Tests) wird gewartet.
 */
export type Defer = (task: () => Promise<void>) => void;

type Task = () => Promise<void>;

/**
 * **Die Weiche sitzt einmal, am Eingang der Aktion** (`runAction`,
 * `withDefer`), statt als Parameter durch jede Kette gereicht zu werden: Am
 * 15.11.2026 warteten rund 40 Knöpfe auf fremde Dienste. Verworfen: `after()`
 * direkt im Fachbereich, das wirft ausserhalb einer Anfrage und kennt Next.
 */
type Weiche = { defer: Defer; queue: Task[] };

const ambient = new AsyncLocalStorage<Weiche>();

export function withDefer<T>(defer: Defer, work: () => Promise<T>): Promise<T> {
  return ambient.run({ defer, queue: [] }, work);
}

/**
 * **Nacheinander, in der Reihenfolge des Aufrufs.** Next führt `after()`-Arbeit
 * gleichzeitig aus; zwei Abgleiche der Discord-Kategorie nebeneinander legten
 * Kanäle doppelt an.
 */
function enqueue(weiche: Weiche, task: Task): void {
  weiche.queue.push(task);
  if (weiche.queue.length > 1) return;
  weiche.defer(() =>
    // Was danach läuft, wartet in sich wieder auf sich: dort gibt es keine
    // Antwort mehr, auf die es warten könnte.
    ambient.exit(async () => {
      for (let i = 0; i < weiche.queue.length; i += 1) {
        await weiche.queue[i]().catch((error: unknown) =>
          logger.error("Arbeit nach der Antwort gescheitert", { error }),
        );
      }
    }),
  );
}

export async function runAfter(
  defer: Defer | undefined,
  task: Task,
): Promise<void> {
  if (defer) {
    defer(() => ambient.exit(task));
    return;
  }
  const weiche = ambient.getStore();
  if (!weiche) return task();
  enqueue(weiche, task);
}

/** Wo die Weiche vom Eingang kommt: in einer Aktion danach, sonst sofort. */
export function afterResponse(task: Task): Promise<void> {
  return runAfter(undefined, task);
}
