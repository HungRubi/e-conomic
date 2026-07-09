'use client';

import { StarRating } from '@/components';
import type { Review } from '@/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const initial = review.author.charAt(0).toUpperCase();
  const colors = ['bg-red/10 text-red', 'bg-accent/10 text-accent', 'bg-green/10 text-green', 'bg-purple/10 text-purple', 'bg-teal/10 text-teal'];
  const color = colors[review.author.length % colors.length];

  return (
    <div className="rounded-xl border border-border/50 bg-surface p-4 md:p-5 transition-all duration-200 hover:border-border/80 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${color}`}>
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          {/* Top row: name + date */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-text">{review.author}</span>
            <span className="shrink-0 text-[11px] text-text2/60">{timeAgo(review.createdAt)}</span>
          </div>

          {/* Star rating */}
          <div className="mt-1">
            <StarRating rating={review.rating} size="sm" />
          </div>

          {/* Verified badge */}
          {review.verified && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green/5 px-2 py-0.5 text-[10px] font-medium text-green">
              <span className="h-1 w-1 rounded-full bg-green" />
              Đã mua hàng
            </span>
          )}

          {/* Title */}
          <h4 className="mt-2 text-sm font-semibold text-text leading-snug">{review.title}</h4>

          {/* Body */}
          <p className="mt-1 text-sm leading-relaxed text-text2">{review.body}</p>
        </div>
      </div>
    </div>
  );
}
