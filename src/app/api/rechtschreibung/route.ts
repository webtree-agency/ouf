import { checkSpelling } from "@/lib/capture/spelling";
import { withUser } from "@/lib/http/withUser";
import { activeLanguage } from "@/lib/queries/languages";

/** Eine Leseanfrage während des Tippens, deshalb eine Route (wie `api/dubletten`). */
export const GET = withUser(async (request, session) => {
  const text = (new URL(request.url).searchParams.get("text") ?? "")
    .trim()
    .slice(0, 200);
  const { active } = await activeLanguage(session.userId);
  if (!active || !text) return Response.json({ corrections: [] });
  return Response.json({
    corrections: await checkSpelling(text, active.code),
  });
});
