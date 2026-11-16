/**
 * Jede Seite kommt beim Öffnen leise herein. Ein Template wird bei jedem
 * Seitenwechsel neu eingehängt, beim Filtern über die Adresse nicht (§3: nichts springt).
 */
export default function AppTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="motion-safe:animate-rise flex flex-1 flex-col">
      {children}
    </div>
  );
}
