import { translationFor } from "@/lib/capture/assist";
import { dictationConfigured } from "@/lib/capture/transcribe";
import { withUser } from "@/lib/http/withUser";
import { activeLanguage } from "@/lib/queries/languages";

/** Eine Leseanfrage während des Tippens, deshalb eine Route (wie `api/dubletten`). */
export const GET = withUser(async (request, session) => {
  const text = (new URL(request.url).searchParams.get("text") ?? "")
    .trim()
    .slice(0, 200);
  const { active } = await activeLanguage(session.userId);
  if (!active || text.length < 2 || !dictationConfigured())
    return Response.json({ translation: null });
  return Response.json({
    translation: await translationFor(session.userId, text, active),
  });
});
