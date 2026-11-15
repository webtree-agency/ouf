import { getSession, type Session } from "../auth/session.ts";

/** Jede API-Route läuft hier durch (§2): ohne Sitzung 401, sonst die Sitzung. */
export function withUser(
  handler: (request: Request, session: Session) => Promise<Response>,
) {
  return async (request: Request): Promise<Response> => {
    const session = await getSession(request);
    if (!session) {
      return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
    }
    return handler(request, session);
  };
}
