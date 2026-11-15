import { eq } from "drizzle-orm";

import { getDb, schema } from "../../db/index.ts";

export type Account = {
  id: string;
  email: string;
  name: string;
  lockedUntil: Date | null;
};

const COLUMNS = {
  id: schema.users.id,
  email: schema.users.email,
  name: schema.users.name,
  lockedUntil: schema.users.lockedUntil,
};

export async function findAccountByEmail(
  email: string,
): Promise<Account | null> {
  const [row] = await getDb()
    .select(COLUMNS)
    .from(schema.users)
    .where(eq(schema.users.email, email.trim().toLowerCase()))
    .limit(1);
  return row ?? null;
}

export async function findAccountById(id: string): Promise<Account | null> {
  const [row] = await getDb()
    .select(COLUMNS)
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return row ?? null;
}

export async function updateAccountName(
  id: string,
  name: string,
): Promise<void> {
  await getDb()
    .update(schema.users)
    .set({ name })
    .where(eq(schema.users.id, id));
}
