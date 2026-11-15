import Link from "next/link";

import BrandLogo from "@/components/brand/BrandLogo";
import SidebarToggleButton from "@/components/shell/SidebarToggleButton";
import UserMenu from "@/components/shell/UserMenu";

export default function AppHeader({
  name,
  email,
  signOut,
  languageSwitcher,
}: {
  name: string;
  email: string;
  signOut: () => Promise<void>;
  languageSwitcher?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between gap-3 border-b border-gray-200 bg-white/90 px-3 py-3 backdrop-blur-md xl:px-6 dark:border-gray-800 dark:bg-gray-900/90">
      <div className="flex items-center gap-3">
        <SidebarToggleButton />
        {/* Unter `xl` liegt die Seitenleiste weggeschoben, also fehlte sonst die Marke. */}
        <Link href="/" aria-label="Zur Übersicht" className="xl:hidden">
          <BrandLogo className="h-9" />
        </Link>
        {languageSwitcher}
      </div>
      <UserMenu name={name} email={email} signOut={signOut} />
    </header>
  );
}
