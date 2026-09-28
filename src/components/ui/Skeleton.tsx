interface SkeletonProps {
  className?: string;
}

// Bloc gris animé, base de tous les skeletons.
function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
}

export default Skeleton;