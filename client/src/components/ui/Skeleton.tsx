interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'image';
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const base = 'skeleton';

  const variantClass = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-radius-sm',
    card: 'h-48 w-full rounded-radius-card',
    image: 'aspect-square w-full rounded-radius-card',
  }[variant];

  return (
    <div
      className={`${base} ${variantClass} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

// Pre-composed skeletons
export function ProductCardSkeleton() {
  return (
    <div className="card p-0 overflow-hidden">
      <Skeleton variant="image" />
      <div className="p-3 space-y-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/3 h-3" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="w-3 h-3 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 card">
          <Skeleton variant="image" className="w-20 h-20 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-2/3" />
            <Skeleton variant="text" className="w-1/4 h-3" />
            <Skeleton variant="text" className="w-16 h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}
