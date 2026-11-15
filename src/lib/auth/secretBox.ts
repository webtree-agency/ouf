import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const SALT = "ouf-totp";

// TOTP muss zurücklesbar sein, ein Hash geht nicht; deshalb verschlüsselt mit
// einem Schlüssel aus der Umgebung.
export function encryptSecret(plain: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);

  return [
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptSecret(stored: string): string {
  const [iv, tag, ciphertext] = stored.split(".");
  if (!iv || !tag || !ciphertext) {
    throw new Error("Verschlüsseltes Geheimnis ist unvollständig");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    encryptionKey(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function encryptionKey(): Buffer {
  const key = process.env.TOTP_ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error(
      "TOTP_ENCRYPTION_KEY fehlt oder ist zu kurz (mindestens 32 Zeichen)",
    );
  }
  // Fester Salzwert: der Schlüssel muss über Neustarts hinweg derselbe bleiben.
  return scryptSync(key, SALT, 32);
}
