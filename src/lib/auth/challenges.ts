import { and, eq, gt, lt } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";

/** So lange, wie ein Mensch für einen Fingerabdruck braucht. */
const CHALLENGE_LIFETIME_MS = 5 * 60 * 1000;

export type ChallengePurpose = "signup" | "register" | "login";

export type Signup = { userId: string; email: string; name: string };

export async function storeChallenge(input: {
  purpose: ChallengePurpose;
  challenge: string;
  userId?: string | null;
  signup?: Signup;
  now?: Date;
}): Promise<void> {
  const now = input.now ?? new Date();

  await getDb()
    .insert(schema.authChallenges)
    .values({
      purpose: input.purpose,
      challenge: input.challenge,
      userId: input.userId ?? null,
      signupUserId: input.signup?.userId ?? null,
      signupEmail: input.signup?.email ?? null,
      signupName: input.signup?.name ?? null,
      expiresAt: new Date(now.getTime() + CHALLENGE_LIFETIME_MS),
    });
}

export type ConsumedChallenge = {
  userId: string | null;
  signup: Signup | null;
};

// Löschen und zurückgeben in einem Schritt: eine Challenge gilt genau einmal.
export async function consumeChallenge(input: {
  purpose: ChallengePurpose;
  challenge: string;
  now?: Date;
}): Promise<ConsumedChallenge | null> {
  const now = input.now ?? new Date();

  const [row] = await getDb()
    .delete(schema.authChallenges)
    .where(
      and(
        eq(schema.authChallenges.challenge, input.challenge),
        eq(schema.authChallenges.purpose, input.purpose),
        gt(schema.authChallenges.expiresAt, now),
      ),
    )
    .returning({
      userId: schema.authChallenges.userId,
      signupUserId: schema.authChallenges.signupUserId,
      signupEmail: schema.authChallenges.signupEmail,
      signupName: schema.authChallenges.signupName,
    });

  if (!row) return null;
  const signup =
    row.signupUserId && row.signupEmail && row.signupName
      ? {
          userId: row.signupUserId,
          email: row.signupEmail,
          name: row.signupName,
        }
      : null;
  return { userId: row.userId, signup };
}

export async function deleteExpiredChallenges(now = new Date()): Promise<void> {
  await getDb()
    .delete(schema.authChallenges)
    .where(lt(schema.authChallenges.expiresAt, now));
}
