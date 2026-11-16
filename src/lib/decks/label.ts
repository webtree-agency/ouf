/** Wie ein Deck in Auswahl und Titel heisst: mit seinem Emoji davor, wenn es eines hat. */
export function deckLabel(deck: {
  name: string;
  emoji: string | null;
}): string {
  return deck.emoji ? `${deck.emoji} ${deck.name}` : deck.name;
}
