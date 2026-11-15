import Skeleton, {
  CARD,
  CardSkeleton,
  FiltersSkeleton,
  TableSkeleton,
  TilesSkeleton,
} from "./Skeleton";

/**
 * **Jede Seite hat ein `loading.tsx` in ihrem eigenen Segment**, das eine
 * dieser Formen zeigt. Eines in der Gruppe darüber zeigt der Router beim
 * Wechsel zwischen Geschwistern nie (im Cockpit gemessen: 1'200 ms nichts
 * gegen 60 ms Skelett). `loading.test.ts` zählt das nach.
 */
function Heading() {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-11 w-32" />
    </div>
  );
}

function Busy({ children }: { children: React.ReactNode }) {
  return (
    <div aria-busy>
      <span className="sr-only">Wird geladen</span>
      {children}
    </div>
  );
}

export function ListPageSkeleton() {
  return (
    <Busy>
      <Heading />
      <div className="space-y-6">
        <FiltersSkeleton />
        <TableSkeleton />
      </div>
    </Busy>
  );
}

export function OverviewPageSkeleton() {
  return (
    <Busy>
      <Heading />
      <div className="space-y-6">
        <TilesSkeleton />
        <TableSkeleton rows={4} />
      </div>
    </Busy>
  );
}

export function FormPageSkeleton() {
  return (
    <Busy>
      <Heading />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardSkeleton lines={6} />
        <CardSkeleton lines={4} />
      </div>
    </Busy>
  );
}

/** Die Lernkarte: ein Blatt in der Mitte, darunter die Knöpfe. */
export function LearnPageSkeleton() {
  return (
    <Busy>
      <div className="flex flex-1 flex-col items-center gap-6 pt-6">
        <Skeleton className="h-4 w-40" />
        <div
          className={`${CARD} flex h-72 w-full items-center justify-center lg:w-2/3`}
        >
          <Skeleton className="h-12 w-48" />
        </div>
        <Skeleton className="h-14 w-full sm:w-80" />
      </div>
    </Busy>
  );
}
