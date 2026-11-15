import { createHash } from "node:crypto";

import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { closeDb, getDb } from "./index.ts";

/**
 * **Jede Testdatei bekommt ihre eigene Datenbank**, benannt nach ihrem Pfad.
 * So laufen die Dateien nebeneinander, ohne dass `truncateAll()` der
 * Nachbardatei die Zeilen wegnimmt. Die Datenbank entsteht einmal und wird
 * wiederverwendet; die Migrationen laufen trotzdem jedes Mal.
 */
export function testDbNameFor(file: string): string {
  const kurz = file.split("/").pop()?.replace(/\W+/g, "_") ?? "einzeln";
  const hash = createHash("sha1").update(file).digest("hex").slice(0, 8);
  return `t_${kurz}_${hash}`.slice(0, 63).toLowerCase();
}

/** Die fertig migrierte Vorlage, aus der neue Testdatenbanken kopiert werden. */
export const TEST_TEMPLATE_DB = "t_vorlage";

function testDbName(): string | null {
  // End-to-End: Läufer und Server müssen dieselbe Datenbank lesen.
  if (process.env.TEST_DB_SHARED === "1") return null;
  return testDbNameFor(process.argv[1] ?? "");
}

async function ensureDatabase(
  baseUrl: string,
  name: string | null,
): Promise<string> {
  if (!name) return baseUrl;

  const admin = postgres(baseUrl, { max: 1, onnotice: () => {} });
  try {
    const [vorhanden] =
      await admin`select 1 from pg_database where datname = ${name}`;
    if (!vorhanden) await createDatabase(admin, name);
  } catch (error) {
    // Zwei Dateien können gleichzeitig anlegen wollen; die zweite findet sie dann vor.
    const [nochmal] =
      await admin`select 1 from pg_database where datname = ${name}`;
    if (!nochmal) throw error;
  } finally {
    await admin.end();
  }

  const url = new URL(baseUrl);
  url.pathname = `/${name}`;
  return url.toString();
}

// Postgres weist die Kopie ab, solange eine Verbindung auf der Vorlage steht; dann leer.
async function createDatabase(
  admin: postgres.Sql,
  name: string,
): Promise<void> {
  const [vorlage] =
    await admin`select 1 from pg_database where datname = ${TEST_TEMPLATE_DB}`;
  if (vorlage) {
    try {
      await admin.unsafe(
        `CREATE DATABASE "${name}" TEMPLATE "${TEST_TEMPLATE_DB}"`,
      );
      return;
    } catch {
      // Weiter unten leer anlegen.
    }
  }
  await admin.unsafe(`CREATE DATABASE "${name}"`);
}

export async function setupTestDb() {
  const base = process.env.DATABASE_URL_TEST;
  if (!base) {
    throw new Error(
      "DATABASE_URL_TEST fehlt. Läuft der Test über pnpm test:integration? Sonst: docker compose up -d postgres-test",
    );
  }

  const url = await ensureDatabase(base, testDbName());

  await closeDb();
  process.env.DATABASE_URL = url;
  process.env.APP_URL ??= "http://localhost:3400";
  process.env.IP_HASH_SALT ??= "test-salz";
  process.env.TOTP_ENCRYPTION_KEY ??= "test-schluessel-mit-mehr-als-32-zeichen";

  const db = getDb();
  await migrate(db, { migrationsFolder: "drizzle" });
  await truncateAll();
  return db;
}

/**
 * **Geleert wird nur eine Testdatenbank.** Scheitert `setupTestDb()`, bleibt
 * `DATABASE_URL` aus `.env.local` stehen; im Cockpit leerte das nächste
 * `truncateAll()` so die Entwicklungsdatenbank (Brain, 04.10.2026).
 */
export function assertTestDatabase(name: string): void {
  if (name === "ouf_test" || name.startsWith("t_")) return;
  throw new Error(
    `truncateAll() läuft nur auf einer Testdatenbank, nicht auf "${name}".`,
  );
}

/**
 * DELETE statt TRUNCATE, als Replikat: Das schaltet Fremdschlüssel und den
 * Schutz des Lernprotokolls aus, und ein DELETE auf einer leeren Tabelle kostet
 * nichts. Gefragt wird die Datenbank, nicht eine gepflegte Liste.
 */
export async function truncateAll(): Promise<void> {
  const [aktuelle] = await getDb().execute<{ name: string }>(
    sql`select current_database() as name`,
  );
  assertTestDatabase(aktuelle.name);

  const tables = await getDb().execute<{ name: string }>(sql`
    select table_name as name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
  `);
  if (tables.length === 0) return;

  const deletes = tables.map((table) => `delete from "${table.name}";`);
  await getDb().transaction(async (tx) => {
    await tx.execute(sql`set local session_replication_role = replica`);
    await tx.execute(sql.raw(deletes.join(" ")));
  });
}
