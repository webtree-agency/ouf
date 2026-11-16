/**
 * Registrieren kann nur, wessen Adresse in `SIGNUP_EMAILS` steht, durch Komma
 * getrennt. Ohne Eintrag ist die Registrierung zu (Jann, 16.11.2026).
 */
export function mayRegister(
  email: string,
  list = process.env.SIGNUP_EMAILS ?? "",
): boolean {
  const wanted = email.trim().toLowerCase();
  if (!wanted) return false;
  return list
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .includes(wanted);
}
