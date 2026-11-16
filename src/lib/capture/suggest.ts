import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import { DomainError } from "../domainError.ts";
import type { LanguageProfile } from "../languages/catalog.ts";

/**
 * **Der einzige Ort, der Claude kennt** (§2, Adapter). Aus dem Diktierten wird
 * ein Vorschlag für die Karte; gespeichert wird er erst, wenn man ihn bestätigt.
 */
export const suggestion = z.object({
  front: z.string(),
  back: z.string(),
  gender: z.enum(["m", "f", ""]),
  example: z.string(),
});

export type Suggestion = z.infer<typeof suggestion>;

// Das kleinste Modell reicht für ein Wort und einen Satz (Jann, 16.11.2026).
const MODEL = "claude-haiku-5-5";

export function instructions(language: LanguageProfile): string {
  return [
    `Du füllst eine Karteikarte zum ${language.name}lernen für eine deutschsprachige Person.`,
    `Du bekommst eine Abschrift von Diktiertem. Darin steht ein Wort oder Ausdruck auf ${language.name}, auf Deutsch oder beides, manchmal mit falsch erkannten Wörtern.`,
    `front: der Ausdruck auf ${language.name}, so wie man ihn lernt, ohne Punkt am Ende. Ein Nomen mit bestimmtem Artikel (le, la); nur wo er zu l' wird, mit un oder une, damit das Genus sichtbar bleibt. Steht nur Deutsch da, nimm das Wort, das man im Alltag sagt. Also «le vélo», «la bagnole», «un arbre» (nicht «l'arbre»).`,
    "back: die deutsche Bedeutung, knapp, ohne Punkt am Ende, ein Nomen mit Artikel. Nimm die deutsche Übersetzung aus dem Diktat, wenn sie passt.",
    language.genders
      ? 'gender: "m" oder "f" bei einem Nomen, sonst "".'
      : 'gender: immer "".',
    `example: ein kurzer, alltäglicher Beispielsatz auf ${language.name} mit dem Ausdruck.`,
    "Ist kein Ausdruck zu erkennen, lass alle Felder leer.",
  ].join("\n");
}

export async function suggestCard(
  transcript: string,
  language: LanguageProfile,
): Promise<Suggestion> {
  const client = new Anthropic();
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 1024,
    system: instructions(language),
    messages: [{ role: "user", content: transcript }],
    output_config: { effort: "low", format: zodOutputFormat(suggestion) },
  });
  const parsed = response.parsed_output;
  if (response.stop_reason === "refusal" || !parsed || !parsed.front) {
    throw new DomainError("Daraus liess sich keine Karte machen.");
  }
  return parsed;
}
