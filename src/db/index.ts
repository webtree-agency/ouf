import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema/index.ts";

type Database = ReturnType<typeof drizzle<typeof schema>>;

// Nimmt beides an, damit zusammengehörige Writes gemeinsam fallen.
export type Executor =
  Database | Parameters<Parameters<Database["transaction"]>[0]>[0];

let client: ReturnType<typeof postgres> | null = null;
let database: Database | null = null;

// Erst beim ersten Zugriff verbinden: `next build` lädt jedes Route-Modul ohne DATABASE_URL.
export function getDb(): Database {
  if (database) return database;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ist nicht gesetzt");

  client = postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  });
  database = drizzle(client, { schema });
  return database;
}

export async function closeDb(): Promise<void> {
  if (!client) return;
  const open = client;
  client = null;
  database = null;
  await open.end();
}

export { schema };
