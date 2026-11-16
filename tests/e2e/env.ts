/**
 * Läufer und Server benutzen dieselben Werte: Der Läufer legt Daten in die
 * Test-DB, der Server liest sie wieder. Port 3401, damit ein laufender
 * Entwicklungsserver auf 3400 nie geprüft wird.
 */
export const E2E_ENV = {
  DATABASE_URL:
    process.env.DATABASE_URL_TEST ??
    "postgres://ouf:ouf@127.0.0.1:5441/ouf_test",
  APP_URL: "http://localhost:3401",
  PORT: "3401",
  IP_HASH_SALT: "e2e-salz",
  TOTP_ENCRYPTION_KEY: "e2e-schluessel-mit-mehr-als-32-zeichen",
  DEV_LOGIN_EMAIL: "",
  SIGNUP_EMAILS: "jann@ouf.local",
};

export function applyE2eEnv(): void {
  process.env.TEST_DB_SHARED = "1";
  process.env.DATABASE_URL_TEST = E2E_ENV.DATABASE_URL;
  process.env.APP_URL = E2E_ENV.APP_URL;
  process.env.IP_HASH_SALT = E2E_ENV.IP_HASH_SALT;
  process.env.TOTP_ENCRYPTION_KEY = E2E_ENV.TOTP_ENCRYPTION_KEY;
}
