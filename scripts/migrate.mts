/**
 * Spielt die Migrationen ein, bevor der Server startet (Dockerfile). Der
 * Migrator von Drizzle, nicht `drizzle-kit`: der gehört nicht ins Abbild.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  process.stderr.write("DATABASE_URL ist nicht gesetzt.\n");
  process.exit(1);
}

const client = postgres(url, { max: 1 });
await migrate(drizzle(client), { migrationsFolder: "drizzle" });
await client.end();
process.stdout.write("Migrationen eingespielt.\n");
