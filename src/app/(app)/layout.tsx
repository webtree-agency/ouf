import AppHeader from "@/components/shell/AppHeader";
import AppShell from "@/components/shell/AppShell";
import { sessionOrLogin } from "@/lib/auth/pageAccess";

import { signOut } from "./konto/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await sessionOrLogin();

  return (
    <AppShell
      header={
        <AppHeader
          name={session.name}
          email={session.email}
          signOut={signOut}
        />
      }
    >
      {children}
    </AppShell>
  );
}
