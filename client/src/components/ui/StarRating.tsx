import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeMap = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export default function StarRating({
  rating,
  max = 5,
  size = 'sm',
  showValue,
  reviewCount,
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = rating >= i + 1;
        const half = !filled && rating >= i + 0.5;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={
              interactive
                ? 'cursor-pointer hover:-translate-y-px transition-transform'
                : 'cursor-default'
            }
            aria-label={`${i + 1} star${interactive ? '' : ''}`}
          >
            <Star
              className={`
                ${sizeMap[size]}
                ${filled ? 'fill-orange text-orange' : half ? 'fill-orange/50 text-orange' : 'text-border'}
                transition-colors
              `.trim()}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1.5 text-sm text-text2">
          {rating.toFixed(1)}
          {reviewCount !== undefined && ` (${reviewCount})`}
        </span>
      )}
    </div>
  );
}
