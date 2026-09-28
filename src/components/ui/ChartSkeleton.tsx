import Skeleton from "./Skeleton";

interface ChartSkeletonProps {
  height?: number;
}

function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 h-4 w-32" />

      <div className="mt-6" style={{ height }}>
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}

export default ChartSkeleton;