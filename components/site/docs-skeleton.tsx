"use client";

function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded bg-muted/50 ${className}`}
      {...props}
    />
  );
}

export function DocsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      <Skeleton className="h-32 w-full rounded-lg" />
      
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/4" />
        
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ComponentCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function TOCSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-24" />
      <div className="space-y-2 pl-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-3 w-32" />
        ))}
      </div>
    </div>
  );
}