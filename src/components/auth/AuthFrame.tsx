import BrandLogo from "@/components/brand/BrandLogo";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

/** Anmelden und Registrieren: ein Blatt in der Mitte, sonst nichts. */
export default function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandLogo className="h-10" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-900">
          {children}
        </div>
      </div>
      <div className="fixed right-4 bottom-4">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
