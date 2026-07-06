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
    <div className="card overflow-hidden !p-2.5 rounded-xl border-border/80 bg-surface/90">
      {/* Image area — matches ProductCard aspect-square */}
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <div className="skeleton absolute inset-0" />
      </div>
      {/* Body — matches ProductCard flex-col layout */}
      <div className="flex min-h-[140px] flex-col px-1.5 pb-1 pt-3">
        {/* Title */}
        <div className="skeleton h-4 w-3/4 rounded mb-2" />
        {/* Description */}
        <div className="skeleton h-3 w-full rounded mb-1" />
        <div className="skeleton h-3 w-2/3 rounded mb-2" />
        {/* Star rating */}
        <div className="flex gap-1 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton w-3 h-3 rounded-full" />
          ))}
        </div>
        {/* Price + Buy button */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="space-y-1.5">
            <div className="skeleton h-5 w-20 rounded" />
            <div className="skeleton h-3 w-14 rounded" />
          </div>
          <div className="skeleton h-8 w-24 rounded-full" />
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
    <div className="space-y-3">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface/90 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="skeleton h-5 w-5 rounded-md" />
          <div className="skeleton h-4 w-28 rounded" />
        </div>
        <div className="skeleton h-4 w-24 rounded" />
      </div>

      {/* Shipping progress skeleton */}
      <div className="rounded-xl border border-border/80 bg-surface/90 p-4">
        <div className="flex items-start gap-3">
          <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-72 rounded" />
            <div className="skeleton h-2 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Cart items */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/80 bg-surface/90 shadow-[0_18px_60px_rgba(0,0,0,0.06)]"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="grid grid-cols-[32px_92px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[32px_112px_minmax(0,1fr)] sm:gap-4 sm:p-4">
            {/* Checkbox skeleton */}
            <div className="flex items-start pt-7 sm:pt-9">
              <div className="skeleton h-5 w-5 rounded-md" />
            </div>

            {/* Image skeleton */}
            <div className="aspect-square overflow-hidden rounded-lg">
              <div className="skeleton h-full w-full" />
            </div>

            {/* Content */}
            <div className="min-w-0 space-y-2.5">
              {/* Title + delete */}
              <div className="flex items-start justify-between gap-2">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-7 w-7 shrink-0 rounded-full" />
              </div>

              {/* Variant chip */}
              <div className="skeleton h-6 w-24 rounded-full" />

              {/* Price + Quantity */}
              <div className="flex items-end justify-between gap-2">
                <div className="space-y-1.5">
                  <div className="skeleton h-5 w-20 rounded" />
                  <div className="skeleton h-3 w-14 rounded" />
                </div>
                <div className="skeleton h-8 w-28 rounded-full" />
              </div>

              {/* Tags */}
              <div className="flex gap-1.5">
                <div className="skeleton h-5 w-20 rounded-full" />
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
