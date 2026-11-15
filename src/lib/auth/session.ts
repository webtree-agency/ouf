import { and, eq, gt, lt, ne, or } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";
import { createToken, hashToken } from "./tokens.ts";

export const SESSION_COOKIE = "ouf_session";

/**
 * Unter https gilt die Sitzung nur auf dem Namen, der sie ausstellt: Mit dem
 * Präfix nimmt der Browser keinen Cookie mit `Domain` an. Lokal über http
 * nimmt er das Präfix nicht an.
 */
export const SECURE_SESSION_COOKIE = `__Host-${SESSION_COOKIE}`;

export function sessionCookieName(secure = isSecureOrigin()): string {
  return secure ? SECURE_SESSION_COOKIE : SESSION_COOKIE;
}

export function isSecureOrigin(): boolean {
  const url = process.env.APP_URL;
  return url ? new URL(url).protocol === "https:" : true;
}

/** Einer ist der Normalfall; der Deckel hält einen Kopf voller Cookies klein. */
const MAX_SESSION_COOKIES = 4;

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

// Gleitend 90 Tage, höchstens ein Jahr (ENTSCHEIDE.md, Block 0).
export const IDLE_LIFETIME_MS = 90 * DAY;
export const ABSOLUTE_LIFETIME_MS = 365 * DAY;
export const FRESH_FACTOR_MS = 15 * MINUTE;

// Ohne diese Bremse schriebe jede Anfrage in die Sitzungstabelle.
const TOUCH_AFTER_MS = MINUTE;

export type Session = {
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  verifiedAt: Date;
  expiresAt: Date;
};

/**
 * Ein Name kann mehrfach im Kopf stehen, und welcher zuerst kommt, entscheidet
 * der Browser. Ein Wert, den `decodeURIComponent` nicht lesen kann, wird
 * übergangen statt geworfen.
 */
export function readCookies(header: string | null, name: string): string[] {
  if (!header) return [];

  const werte: string[] = [];
  for (const part of header.split(";")) {
    if (werte.length === MAX_SESSION_COOKIES) break;

    const separator = part.indexOf("=");
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() !== name) continue;

    try {
      const wert = decodeURIComponent(part.slice(separator + 1).trim());
      if (wert) werte.push(wert);
    } catch {
      continue;
    }
  }
  return werte;
}

export function hasFreshFactor(session: Session, now = new Date()): boolean {
  return now.getTime() - session.verifiedAt.getTime() <= FRESH_FACTOR_MS;
}

export async function createSession(input: {
  userId: string;
  userAgent?: string | null;
  now?: Date;
}): Promise<{ token: string; expiresAt: Date }> {
  const now = input.now ?? new Date();
  const token = createToken();
  const expiresAt = new Date(now.getTime() + IDLE_LIFETIME_MS);

  await getDb()
    .insert(schema.sessions)
    .values({
      tokenHash: hashToken(token),
      userId: input.userId,
      expiresAt,
      absoluteExpiresAt: new Date(now.getTime() + ABSOLUTE_LIFETIME_MS),
      lastSeenAt: now,
      verifiedAt: now,
      userAgent: input.userAgent?.slice(0, 300) ?? null,
    });

  return { token, expiresAt };
}

/** Jeder gleichnamige Cookie kommt dran, bis einer zu einer Sitzung passt. */
export async function sessionFromTokens(
  tokens: readonly string[],
): Promise<Session | null> {
  for (const token of tokens) {
    const session = await getSessionByToken(token);
    if (session) return session;
  }
  return null;
}

export async function getSession(request: Request): Promise<Session | null> {
  return sessionFromTokens(
    readCookies(request.headers.get("cookie"), sessionCookieName()),
  );
}

export async function getSessionByToken(
  token: string,
  now = new Date(),
): Promise<Session | null> {
  const [row] = await getDb()
    .select({
      sessionId: schema.sessions.id,
      lastSeenAt: schema.sessions.lastSeenAt,
      expiresAt: schema.sessions.expiresAt,
      absoluteExpiresAt: schema.sessions.absoluteExpiresAt,
      verifiedAt: schema.sessions.verifiedAt,
      userId: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(
      and(
        eq(schema.sessions.tokenHash, hashToken(token)),
        gt(schema.sessions.expiresAt, now),
        gt(schema.sessions.absoluteExpiresAt, now),
      ),
    )
    .limit(1);

  if (!row) return null;

  return {
    expiresAt: await touchSession({ ...row, now }),
    sessionId: row.sessionId,
    userId: row.userId,
    email: row.email,
    name: row.name,
    verifiedAt: row.verifiedAt,
  };
}

export async function markFactorVerified(
  sessionId: string,
  now = new Date(),
): Promise<void> {
  await getDb()
    .update(schema.sessions)
    .set({ verifiedAt: now })
    .where(eq(schema.sessions.id, sessionId));
}

export async function revokeSession(sessionId: string): Promise<void> {
  await getDb()
    .delete(schema.sessions)
    .where(eq(schema.sessions.id, sessionId));
}

export async function revokeOtherSessions(
  userId: string,
  keep: string,
): Promise<void> {
  await getDb()
    .delete(schema.sessions)
    .where(
      and(eq(schema.sessions.userId, userId), ne(schema.sessions.id, keep)),
    );
}

export async function deleteExpiredSessions(now = new Date()): Promise<void> {
  await getDb()
    .delete(schema.sessions)
    .where(
      or(
        lt(schema.sessions.expiresAt, now),
        lt(schema.sessions.absoluteExpiresAt, now),
      ),
    );
}

/** Gibt zurück, wann die Sitzung jetzt endet, geschrieben oder unverändert. */
async function touchSession(input: {
  sessionId: string;
  lastSeenAt: Date;
  expiresAt: Date;
  absoluteExpiresAt: Date;
  now: Date;
}): Promise<Date> {
  const { now, absoluteExpiresAt } = input;
  if (now.getTime() - input.lastSeenAt.getTime() < TOUCH_AFTER_MS) {
    return input.expiresAt;
  }

  const slid = new Date(now.getTime() + IDLE_LIFETIME_MS);
  const expiresAt = slid < absoluteExpiresAt ? slid : absoluteExpiresAt;

  await getDb()
    .update(schema.sessions)
    .set({ lastSeenAt: now, expiresAt })
    .where(eq(schema.sessions.id, input.sessionId));

  return expiresAt;
}
