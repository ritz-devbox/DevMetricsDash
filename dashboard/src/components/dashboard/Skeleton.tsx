interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-7 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

export function ChartCardSkeleton({ height = 'h-[300px]' }: { height?: string }) {
  return (
    <div className="glass-card p-5">
      <Skeleton className="h-4 w-36 mb-1" />
      <Skeleton className="h-3 w-52 mb-4" />
      <Skeleton className={`w-full rounded-lg ${height}`} />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-dark-600/10">
      <Skeleton className="h-5 w-5 rounded-full" />
      <Skeleton className="h-3 flex-1 max-w-xs" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-14 rounded-full" />
      <Skeleton className="h-3 w-20 ml-auto" />
    </div>
  );
}

export function ContributorCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-4 mb-5">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-dark-700/30 rounded-lg p-2">
            <Skeleton className="h-4 w-8 mx-auto mb-1" />
            <Skeleton className="h-2 w-12 mx-auto" />
          </div>
        ))}
      </div>
      <Skeleton className="h-36 w-full rounded-lg" />
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="min-h-screen lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCardSkeleton />
        <ChartCardSkeleton height="h-[200px]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCardSkeleton height="h-[200px]" />
        <ChartCardSkeleton height="h-[200px]" />
        <ChartCardSkeleton height="h-[200px]" />
      </div>
    </div>
  );
}
