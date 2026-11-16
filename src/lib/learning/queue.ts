/**
 * Welche Karte als Nächstes kommt. Rein, damit ein Unit-Test es festhält.
 *
 * 1. Was in den Lernschritten jetzt fällig ist, zuerst die älteste.
 * 2. Wiederholungen, die heute fällig sind, die längst fällige zuerst.
 * 3. Neue Karten, bis das Tageslimit des Decks erreicht ist.
 * 4. Was in den Lernschritten in den nächsten 20 Minuten fällig wird, damit
 *    man am Ende nicht vor einer leeren Seite wartet (wie Anki).
 */
export const LEARN_AHEAD_MS = 20 * 60 * 1000;

export type QueueItem = { scheduleId: string; deckId: string; dueAt: Date };

export type Queue = {
  learning: QueueItem[];
  reviews: QueueItem[];
  fresh: QueueItem[];
};

export type QueueCounts = { neu: number; lernen: number; faellig: number };

export function pickNext(
  queue: Queue,
  now: Date,
  /** Zufällig statt geplant: Lernschritte bleiben vorn, der Rest wird gemischt. */
  random?: () => number,
): QueueItem | null {
  const learningNow = queue.learning.filter((item) => item.dueAt <= now);
  if (learningNow.length) return earliest(learningNow);
  const rest = [...queue.reviews, ...queue.fresh];
  if (random && rest.length)
    return rest[Math.min(rest.length - 1, Math.floor(random() * rest.length))];
  if (queue.reviews.length) return earliest(queue.reviews);
  if (queue.fresh.length) return queue.fresh[0];

  const soon = queue.learning.filter(
    (item) => item.dueAt.getTime() <= now.getTime() + LEARN_AHEAD_MS,
  );
  return soon.length ? earliest(soon) : null;
}

export function countQueue(queue: Queue): QueueCounts {
  return {
    neu: queue.fresh.length,
    lernen: queue.learning.length,
    faellig: queue.reviews.length,
  };
}

function earliest(items: QueueItem[]): QueueItem {
  return items.reduce((best, item) => (item.dueAt < best.dueAt ? item : best));
}

/**
 * Neue Karten, so viele wie das Deck heute noch erlaubt. `candidates` kommen
 * in der Reihenfolge, in der sie gelernt werden sollen (älteste Karte zuerst).
 */
export function withinNewLimits(
  candidates: QueueItem[],
  remaining: ReadonlyMap<string, number>,
): QueueItem[] {
  const left = new Map(remaining);
  return candidates.filter((item) => {
    const rest = left.get(item.deckId) ?? 0;
    if (rest <= 0) return false;
    left.set(item.deckId, rest - 1);
    return true;
  });
}

/** Was ein Deck heute noch an neuen Karten zulässt; nie unter null. */
export function remainingNew(
  newPerDay: number,
  introducedToday: number,
): number {
  return Math.max(0, newPerDay - introducedToday);
}
