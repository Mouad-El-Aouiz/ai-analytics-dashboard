import Skeleton from "./Skeleton";

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <Skeleton className="h-4 w-24" />

      <div className="mt-3 flex items-end justify-between">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>

      <Skeleton className="mt-2 h-3 w-28" />
    </div>
  );
}

export default StatCardSkeleton;