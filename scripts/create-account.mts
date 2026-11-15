/**
 * Legt lokal ein Konto an, ohne Passkey: für den Kurzweg „Lokal anmelden als …"
 * (CLAUDE.md §9). In der Produktion entsteht ein Konto nur über die
 * Registrierung.
 *
 *     pnpm dev:konto jann@ouf.local "Jann"
 */
import { closeDb, getDb, schema } from "../src/db/index.ts";

const [email, name] = process.argv.slice(2);
if (!email || !name) {
  console.error('So: pnpm dev:konto <e-mail> "<Name>"');
  process.exit(1);
}

const [user] = await getDb()
  .insert(schema.users)
  .values({ email: email.trim().toLowerCase(), name: name.trim() })
  .onConflictDoUpdate({
    target: schema.users.email,
    set: { name: name.trim() },
  })
  .returning({ id: schema.users.id, email: schema.users.email });

await closeDb();
console.log(
  `Konto bereit: ${user.email}. In .env.local: DEV_LOGIN_EMAIL=${user.email}`,
);
