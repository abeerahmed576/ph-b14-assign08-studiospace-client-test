export function StudioCardSkeleton() {
  return (
    <div className="h-full flex flex-col rounded-2xl border border-border bg-card shadow-xs overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[4/3] w-full bg-secondary" />

      {/* Content Skeleton */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4">
        <div className="space-y-3">
          <div className="h-5 bg-secondary rounded-md w-3/4" />
          <div className="h-3.5 bg-secondary rounded-md w-1/2" />
          <div className="flex gap-2 pt-1">
            <div className="h-4 bg-secondary rounded-md w-16" />
            <div className="h-4 bg-secondary rounded-md w-14" />
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="h-10 bg-secondary rounded-full w-full mt-2" />
      </div>
    </div>
  );
}

export function StudioGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <StudioCardSkeleton key={i} />
      ))}
    </div>
  );
}

