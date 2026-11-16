import TabBar from "@/components/shell/TabBar";

/**
 * Kopfzeile, Inhalt, die Leiste unten. Die Breite wird hier einmal
 * begrenzt, nie in einer Seite (§3).
 */
export default function AppShell({
  header,
  barExtras,
  children,
}: {
  header: React.ReactNode;
  /** Sprache und Konto, am Laptop in der Leiste unten. */
  barExtras: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <main className="mx-auto flex w-full max-w-5xl min-w-0 flex-1 flex-col px-4 pt-2 pb-6 md:px-6 md:pt-6">
        {children}
      </main>
      <TabBar extras={barExtras} />
    </div>
  );
}
