import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Unveränderte Kopie aus maplibre-gl, geprüft in mapWorker.test.ts.
    "public/vendor/**",
  ]),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  // Nur der eigene Code — die noch ungenutzten Template-Komponenten protokollieren
  // ihre Demo-Eingaben auf die Konsole und werden erst angefasst, wenn sie drankommen.
  {
    files: ["src/app/**/*.{ts,tsx}", "src/lib/**/*.ts", "src/db/**/*.ts"],
    rules: { "no-console": "error" },
  },
  {
    files: ["src/lib/logger.ts"],
    rules: { "no-console": "off" },
  },
]);

export default eslintConfig;
