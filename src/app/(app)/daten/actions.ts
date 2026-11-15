"use server";

import { failed, okWith, type ActionResult } from "@/lib/actionResult";
import { runActionWith } from "@/lib/actions/run";
import { DomainError } from "@/lib/domainError";
import { activeLanguage } from "@/lib/queries/languages";
import { readCards } from "@/lib/transfer/cardRows";
import { detectDelimiter, parseDelimited } from "@/lib/transfer/delimited";
import { importCards, type ImportResult } from "@/lib/transfer/importCards";
import { counted } from "@/lib/format/plural";

const MAX_BYTES = 2 * 1024 * 1024;

export async function importAction(formData: FormData): Promise<ActionResult> {
  const file = formData.get("datei");
  const deckId = String(formData.get("deck") ?? "");
  if (!(file instanceof File) || file.size === 0)
    return failed("Bitte eine Datei wählen.", {
      datei: "Bitte eine Datei wählen.",
    });
  if (file.size > MAX_BYTES)
    return failed("Die Datei ist grösser als 2 MB.", {
      datei: "Die Datei ist grösser als 2 MB.",
    });

  const text = await file.text();
  const result = await runActionWith<ImportResult>({}, async (actor) => {
    const { active } = await activeLanguage(actor.id);
    if (!active) throw new DomainError("Es gibt noch keine Sprache.");
    const cards = readCards(parseDelimited(text, detectDelimiter(text)));
    if (cards.length === 0)
      throw new DomainError("In der Datei steht keine Karte.", "datei");
    return importCards({
      userId: actor.id,
      languageId: active.id,
      fallbackDeckId: deckId,
      cards,
    });
  });
  if (!result.ok) return result;
  return okWith(summary(result.data));
}

function summary(result: ImportResult): string {
  const teile = [
    `${counted(result.imported, { one: "Karte", many: "Karten" })} importiert`,
  ];
  if (result.duplicates) teile.push(`${result.duplicates} gab es schon`);
  if (result.rejected.length) {
    const zeilen = result.rejected
      .slice(0, 5)
      .map((entry) => `Zeile ${entry.line}: ${entry.message}`);
    teile.push(
      `${result.rejected.length} nicht übernommen (${zeilen.join("; ")}${result.rejected.length > 5 ? " …" : ""})`,
    );
  }
  return `${teile.join(", ")}.`;
}
