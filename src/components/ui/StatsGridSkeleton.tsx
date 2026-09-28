import StatCardSkeleton from "./StatCardSkeleton";

interface StatsGridSkeletonProps {
  count?: number;
}

// Affiche `count` cartes KPI en squelette, dans la même grille que StatsGrid.
function StatsGridSkeleton({ count = 4 }: StatsGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default StatsGridSkeleton;