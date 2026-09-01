import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-[10px]", className)} aria-hidden />;
}

export function SkeletonCard() {
  return (
    <div className="card-luxury space-y-3 p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="card-luxury p-5">
      <Skeleton className="mb-4 h-4 w-40" />
      <Skeleton className="h-64 w-full rounded-[20px]" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card-luxury space-y-3 overflow-hidden p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}