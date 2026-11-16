import TabBar from "@/components/shell/TabBar";

/**
 * Kopfzeile, Inhalt, am Handy die Leiste unten. Die Breite wird hier einmal
 * begrenzt, nie in einer Seite (§3).
 */
export default function AppShell({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <main className="mx-auto flex w-full max-w-5xl min-w-0 flex-1 flex-col px-4 pt-2 pb-6 md:px-6 md:pt-6">
        {children}
      </main>
      <TabBar />
    </div>
  );
}
