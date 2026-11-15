"use server";

import { z } from "zod";

import type { ActionResult } from "@/lib/actionResult";
import { runAction } from "@/lib/actions/run";
import {
  addLanguage,
  removeLanguage,
  setActiveLanguage,
} from "@/lib/languages/languages";
import { sectionRoot } from "@/lib/navigation/sectionRoot";

export async function addLanguageAction(code: string): Promise<ActionResult> {
  return runAction({ revalidate: ["/"] }, async (actor) => {
    await addLanguage(actor.id, String(code));
    return "/decks";
  });
}

export async function removeLanguageAction(
  languageId: string,
): Promise<ActionResult> {
  return runAction({ revalidate: ["/"] }, (actor) =>
    removeLanguage(actor.id, z.uuid().parse(languageId)),
  );
}

export async function switchLanguage(
  languageId: string,
  pathname: string,
): Promise<ActionResult> {
  return runAction({ revalidate: ["/"] }, async (actor) => {
    await setActiveLanguage(actor.id, z.uuid().parse(languageId));
    return sectionRoot(String(pathname));
  });
}
