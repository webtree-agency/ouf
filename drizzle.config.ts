import { defineConfig } from "drizzle-kit";

// drizzle-kit startet ausserhalb von Next und liest .env.local nicht von selbst.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Keine .env.local (etwa im CI) — dann zählt, was in der Umgebung steht.
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
