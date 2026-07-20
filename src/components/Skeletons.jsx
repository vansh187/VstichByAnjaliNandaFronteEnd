// Pulsing placeholders shown while catalog data is in flight.
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-sand-dark/60" />
      <div className="mt-4 space-y-2">
        <div className="h-2.5 w-1/3 bg-sand-dark/60" />
        <div className="h-4 w-3/4 bg-sand-dark/60" />
        <div className="h-3.5 w-1/4 bg-sand-dark/60" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryTileSkeleton() {
  return <div className="aspect-[3/4] animate-pulse bg-sand-dark/60" />;
}

export function CategoryGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryTileSkeleton key={i} />
      ))}
    </div>
  );
}
