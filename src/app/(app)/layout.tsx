import AppHeader from "@/components/shell/AppHeader";
import AppShell from "@/components/shell/AppShell";

async function signOut() {
  "use server";
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      header={
        <AppHeader name="Jann" email="jann@ouf.local" signOut={signOut} />
      }
    >
      {children}
    </AppShell>
  );
}
