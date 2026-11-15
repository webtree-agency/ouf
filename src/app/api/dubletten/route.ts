import { frontKey } from "@/lib/cards/frontKey";
import { withUser } from "@/lib/http/withUser";
import { findDuplicates } from "@/lib/queries/cards";
import { activeLanguage } from "@/lib/queries/languages";

/**
 * Eine Leseanfrage während des Tippens, deshalb eine Route und keine Aktion:
 * Next schickt Aktionen eine nach der anderen, und jeder Tastendruck wartete
 * auf den vorherigen (CLAUDE.md §2).
 */
export const GET = withUser(async (request, session) => {
  const params = new URL(request.url).searchParams;
  const key = frontKey((params.get("vorderseite") ?? "").slice(0, 200));
  const ausser = params.get("ausser");
  const { active } = await activeLanguage(session.userId);
  if (!active || !key) return Response.json({ duplicates: [] });

  const duplicates = await findDuplicates(
    session.userId,
    active.id,
    key,
    ausser && /^[0-9a-f-]{36}$/i.test(ausser) ? ausser : undefined,
  );
  return Response.json({ duplicates });
});
