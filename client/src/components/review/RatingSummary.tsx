'use client';

import { StarRating } from '@/components';
import { Star } from 'lucide-react';

interface RatingSummaryProps {
  average: number;
  total: number;
  distribution: Record<number, number>;
  selectedRating: number | null;
  onSelectRating: (rating: number | null) => void;
}

export default function RatingSummary({
  average,
  total,
  distribution,
  selectedRating,
  onSelectRating,
}: RatingSummaryProps) {
  return (
    <>
      {/* Desktop: side-by-side */}
      <div className="hidden sm:flex items-center gap-8">
        {/* Big average */}
        <div className="flex flex-col items-center shrink-0 min-w-[100px]">
          <span className="text-4xl md:text-5xl font-bold text-text tracking-tight leading-none">
            {average.toFixed(1)}
          </span>
          <div className="mt-1.5">
            <StarRating rating={average} size="sm" />
          </div>
          <span className="mt-1 text-xs text-text2/70">{total} đánh giá</span>
        </div>

        {/* Star filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectRating(null)}
            className={`h-9 px-3.5 rounded-full text-xs font-medium transition-all ${
              selectedRating === null
                ? 'bg-accent text-bg'
                : 'bg-surface2 text-text2 hover:text-text'
            }`}
          >
            Tất cả
          </button>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] ?? 0;
            const active = selectedRating === star;

            return (
              <button
                key={star}
                onClick={() => onSelectRating(active ? null : star)}
                className={`h-9 px-3.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-accent text-bg'
                    : 'bg-surface2 text-text2 hover:text-text'
                }`}
              >
                <Star className={`h-3 w-3 ${active ? 'fill-current' : ''}`} />
                {star}
                <span className={active ? 'text-bg/70' : 'text-text2/50'}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: stacked */}
      <div className="sm:hidden flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-text">{average.toFixed(1)}</span>
          <div>
            <StarRating rating={average} size="sm" />
            <span className="text-xs text-text2/70 ml-2">{total} đánh giá</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectRating(null)}
            className={`h-8 px-3 rounded-full text-[11px] font-medium transition-all ${
              selectedRating === null
                ? 'bg-accent text-bg'
                : 'bg-surface2 text-text2 hover:text-text'
            }`}
          >
            Tất cả
          </button>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] ?? 0;
            return (
              <button
                key={star}
                onClick={() => onSelectRating(selectedRating === star ? null : star)}
                className={`h-8 px-3 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                  selectedRating === star
                    ? 'bg-accent text-bg'
                    : 'bg-surface2 text-text2 hover:text-text'
                }`}
              >
                {star}★ ({count})
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
