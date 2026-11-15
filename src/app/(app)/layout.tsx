import LanguageSwitcher from "@/components/languages/LanguageSwitcher";
import AppHeader from "@/components/shell/AppHeader";
import AppShell from "@/components/shell/AppShell";
import { sessionOrLogin } from "@/lib/auth/pageAccess";
import { activeLanguage } from "@/lib/queries/languages";

import { signOut } from "./konto/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await sessionOrLogin();
  const { active, all } = await activeLanguage(session.userId);

  return (
    <AppShell
      header={
        <AppHeader
          name={session.name}
          email={session.email}
          signOut={signOut}
          languageSwitcher={
            <LanguageSwitcher
              languages={all.map(({ id, name }) => ({ id, name }))}
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
