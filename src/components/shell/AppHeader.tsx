import Link from "next/link";

import BrandLogo from "@/components/brand/BrandLogo";
import StreakBadge from "@/components/shell/StreakBadge";

/** Logo und Serie; Sprache und Konto nur am Handy, am Laptop liegen sie unten. */
export default function AppHeader({
  streak,
  personal,
}: {
  streak: number;
  personal: React.ReactNode;
}) {
  return (
    <header className="bg-canvas/90 sticky top-0 z-30 w-full backdrop-blur-md dark:bg-gray-950/90">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 md:h-20 md:px-6">
        <Link href="/" aria-label="Zur Übersicht">
          <BrandLogo className="h-7 md:h-8" />
        </Link>
        <div className="flex items-center gap-1">
          <StreakBadge days={streak} />
          <div className="flex items-center gap-1 md:hidden">{personal}</div>
        </div>
      </div>
    </header>
  );
}
