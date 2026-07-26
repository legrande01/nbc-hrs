import { Skeleton } from "@/components/ui/skeleton";

/**
 * Layout-preserving skeleton for the horizontal hotel result card.
 */
export function HotelResultSkeleton() {
  return (
    <div className="grid overflow-hidden rounded-xl border border-border/70 bg-card shadow-card md:grid-cols-[18rem_minmax(0,1fr)] lg:grid-cols-[22rem_minmax(0,1fr)]">
      <Skeleton className="aspect-4/3 rounded-none md:aspect-auto md:h-full md:min-h-56" />
      <div className="flex min-w-0 flex-col gap-5 p-6 lg:p-7">
        <div className="grid gap-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-28 rounded-full" />
          ))}
        </div>
        <div className="mt-auto grid gap-4 border-t border-border pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="grid gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HotelResultsSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <HotelResultSkeleton key={index} />
      ))}
    </div>
  );
}
