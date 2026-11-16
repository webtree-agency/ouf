import LanguageSwitcher from "@/components/languages/LanguageSwitcher";
import AppHeader from "@/components/shell/AppHeader";
import AppShell from "@/components/shell/AppShell";
import UserMenu from "@/components/shell/UserMenu";
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
  const languages = all.map(({ id, name, code }) => ({ id, name, code }));

  // Am Handy oben, am Laptop in der Leiste unten (Jann, 16.11.2026).
  const personal = (inBar: boolean) => (
    <>
      <LanguageSwitcher
        languages={languages}
        activeId={active?.id ?? null}
        inBar={inBar}
      />
      <UserMenu
        name={session.name}
        email={session.email}
        signOut={signOut}
        inBar={inBar}
      />
    </>
  );

  return (
    <AppShell
      header={<AppHeader streak={streak} personal={personal(false)} />}
      barExtras={personal(true)}
    >
      {children}
    </AppShell>
  );
}
