import { useSidebar } from "@/context/SidebarContext";

/**
 * **Die Stapelung der Hülle steht hier:** Inhalt < Kopfzeile (`z-30`) <
 * Backdrop (`z-40`) < Seitenleiste (`z-50`). Die Kopfzeile lag bis zum
 * 12.08.2026 auf derselben Höhe wie der Backdrop und damit vor ihm — sie blieb
 * hell und anklickbar, während die Leiste offen war (§3).
 */
const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 xl:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
