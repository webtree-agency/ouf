import Link from "next/link";

import BrandLogo from "@/components/brand/BrandLogo";
import NavLinks from "@/components/shell/NavLinks";
import StreakBadge from "@/components/shell/StreakBadge";
import UserMenu from "@/components/shell/UserMenu";

export default function AppHeader({
  name,
  email,
  streak,
  signOut,
  languageSwitcher,
}: {
  name: string;
  email: string;
  streak: number;
  signOut: () => Promise<void>;
  languageSwitcher?: React.ReactNode;
}) {
  return (
    <header className="bg-canvas/90 sticky top-0 z-30 w-full backdrop-blur-md dark:bg-gray-950/90">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 md:h-20 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label="Zur Übersicht">
            <BrandLogo className="h-12 md:h-14" />
          </Link>
          <NavLinks />
        </div>
        <div className="flex items-center gap-1">
          {languageSwitcher}
          <StreakBadge days={streak} />
          <UserMenu name={name} email={email} signOut={signOut} />
        </div>
      </div>
    </header>
  );
}
