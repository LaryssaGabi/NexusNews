const SkeletonCard = () => (
  <div className="glass-card overflow-hidden flex flex-col animate-pulse">
    <div className="h-48 bg-secondary shimmer-bg" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-4 bg-secondary rounded w-3/4" />
      <div className="h-3 bg-secondary rounded w-full" />
      <div className="h-3 bg-secondary rounded w-2/3" />
      <div className="flex items-center justify-between pt-2 border-t border-border/30">
        <div className="h-3 bg-secondary rounded w-24" />
        <div className="h-3 bg-secondary rounded w-12" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
