"use server";

import { z } from "zod";

import { failed, type ActionResult } from "@/lib/actionResult";
import { runAction } from "@/lib/actions/run";
import { activeLanguage } from "@/lib/queries/languages";
import { createTag, deleteTag, tagInput, updateTag } from "@/lib/tags/tags";
import { fieldMessages } from "@/lib/validation/fields";

type TagForm = { name: string; emoji: string; color: string };

const PRUEFEN = "Bitte die markierten Felder prüfen.";

export async function createTagAction(input: TagForm): Promise<ActionResult> {
  const parsed = tagInput.safeParse(input);
  if (!parsed.success) return failed(PRUEFEN, fieldMessages(parsed.error));
  return runAction({ revalidate: ["/"] }, async (actor) => {
    const { active } = await activeLanguage(actor.id);
    if (!active) return "/sprachen";
    await createTag(actor.id, active.id, parsed.data);
  });
}

export async function updateTagAction(
  tagId: string,
  input: TagForm,
): Promise<ActionResult> {
  const parsed = tagInput.safeParse(input);
  if (!parsed.success) return failed(PRUEFEN, fieldMessages(parsed.error));
  return runAction({ revalidate: ["/"] }, (actor) =>
    updateTag(actor.id, z.uuid().parse(tagId), parsed.data),
  );
}

export async function deleteTagAction(tagId: string): Promise<ActionResult> {
  return runAction({ revalidate: ["/"] }, (actor) =>
    deleteTag(actor.id, z.uuid().parse(tagId)),
  );
}
