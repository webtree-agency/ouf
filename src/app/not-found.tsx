import BrandLogo from "@/components/brand/BrandLogo";
import Button from "@/components/ui/button/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
      <BrandLogo className="h-14" />
      <h1 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
        Diese Seite gibt es nicht
      </h1>
      <p className="text-base text-gray-500 dark:text-gray-400">
        Vielleicht gehört sie zu einer anderen Sprache.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/">Zur Übersicht</Button>
        <Button href="/karten" variant="outline">
          Karten
        </Button>
      </div>
    </div>
  );
}
