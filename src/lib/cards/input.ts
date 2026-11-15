import { z } from "zod";

import {
  requiredTextField,
  tagsField,
  textField,
} from "../validation/fields.ts";

export const cardInput = z.object({
  deckId: z.uuid("Bitte ein Deck wählen."),
  front: requiredTextField(200),
  back: requiredTextField(500),
  example: textField(500),
  note: textField(1000),
  gender: z
    .enum(["m", "f", ""])
    .transform((value) => (value === "" ? null : value)),
  tags: tagsField(),
  reverse: z.boolean(),
});

export type CardInput = z.infer<typeof cardInput>;
/** Was ein Formular schickt, bevor es geprüft ist. */
export type CardDraft = z.input<typeof cardInput>;
