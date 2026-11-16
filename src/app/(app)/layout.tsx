import LanguageSwitcher from "@/components/languages/LanguageSwitcher";
import AppHeader from "@/components/shell/AppHeader";
import AppShell from "@/components/shell/AppShell";
import { sessionOrLogin } from "@/lib/auth/pageAccess";
import { activeLanguage } from "@/lib/queries/languages";
import { learningStreak } from "@/lib/queries/stats";

import { signOut } from "./konto/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await sessionOrLogin();
  const [{ active, all }, streak] = await Promise.all([
    activeLanguage(session.userId),
    learningStreak(session.userId),
  ]);

  return (
    <AppShell
      header={
        <AppHeader
          name={session.name}
          email={session.email}
          streak={streak}
          signOut={signOut}
          languageSwitcher={
            <LanguageSwitcher
              languages={all.map(({ id, name, code }) => ({ id, name, code }))}
              activeId={active?.id ?? null}
            />
          }
        />
      }
    >
      {children}
    </AppShell>
  );
}
