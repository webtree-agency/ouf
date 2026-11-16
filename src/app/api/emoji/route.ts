import data from "emojibase-data/de/compact.json";

import { withUser } from "@/lib/http/withUser";
import { emojiForName, searchEmoji, type EmojiEntry } from "@/lib/emoji/search";

const ENTRIES: EmojiEntry[] = data;

/**
 * Sucht Emojis nach deutschem Namen, während man tippt. Der Katalog bleibt auf
 * dem Server; der Browser bekommt nur die Treffer, nicht 600 kB Daten.
 */
export const GET = withUser(async (request) => {
  const params = new URL(request.url).searchParams;
  const query = (params.get("suche") ?? "").slice(0, 60);
  const name = (params.get("name") ?? "").slice(0, 60);
  const emoji = query
    ? searchEmoji(ENTRIES, query)
    : emojiForName(ENTRIES, name);
  return Response.json({ emoji });
});
