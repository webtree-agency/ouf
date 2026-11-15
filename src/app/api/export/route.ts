import { withUser } from "@/lib/http/withUser";
import { activeLanguage } from "@/lib/queries/languages";
import { writeCards } from "@/lib/transfer/cardRows";
import { serializeDelimited } from "@/lib/transfer/delimited";
import { cardsForExport } from "@/lib/transfer/importCards";
import { dayKey } from "@/lib/time/day";

/** Ein Download, deshalb eine Route und keine Aktion (§2). */
export const GET = withUser(async (request, session) => {
  const params = new URL(request.url).searchParams;
  const tsv = params.get("format") === "tsv";
  const deck = params.get("deck");
  const { active } = await activeLanguage(session.userId);
  if (!active)
    return new Response("Es gibt noch keine Sprache.", { status: 404 });

  const cards = await cardsForExport(
    session.userId,
    active.id,
    deck && /^[0-9a-f-]{36}$/i.test(deck) ? deck : undefined,
  );
  // Das BOM sagt Excel, dass die Datei UTF-8 ist; sonst stehen dort keine Akzente.
  const body = "﻿" + serializeDelimited(writeCards(cards), tsv ? "\t" : ",");
  const name = `ouf-${active.code}-${dayKey(new Date())}.${tsv ? "tsv" : "csv"}`;

  return new Response(body, {
    headers: {
      "Content-Type": `${tsv ? "text/tab-separated-values" : "text/csv"}; charset=utf-8`,
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
});
