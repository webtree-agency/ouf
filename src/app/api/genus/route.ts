import { genderFromArticle } from "@/lib/cards/gender";
import { genderFor } from "@/lib/capture/assist";
import { dictationConfigured } from "@/lib/capture/transcribe";
import { withUser } from "@/lib/http/withUser";
import { activeLanguage } from "@/lib/queries/languages";

/** Eine Leseanfrage während des Tippens, deshalb eine Route (wie `api/dubletten`). */
export const GET = withUser(async (request, session) => {
  const text = (new URL(request.url).searchParams.get("text") ?? "")
    .trim()
    .slice(0, 60);
  const { active } = await activeLanguage(session.userId);
  // Was der Artikel sagt, weiss der Browser selbst; gefragt wird nur ohne ihn.
  if (
    !active?.genders ||
    text.length < 2 ||
    genderFromArticle(text) ||
    !dictationConfigured()
  )
    return Response.json({ gender: null });
  return Response.json({
    gender: await genderFor(session.userId, text, active),
  });
});
