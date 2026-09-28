import Skeleton from "./Skeleton";

interface TableSkeletonProps {
  rows?: number;
}

function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-2 h-4 w-40" />
      </div>

      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableSkeleton;