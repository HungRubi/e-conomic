'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquareText } from 'lucide-react';
import ReviewCard from './ReviewCard';
import RatingSummary from './RatingSummary';
import { getProductReviews, getReviewDistribution } from '@/lib/reviews';
import type { Review } from '@/types';

const PER_PAGE = 4;

interface ReviewSectionProps {
	productId: string;
	rating: number;
	reviewCount: number;
}

export default function ReviewSection({ productId, rating, reviewCount }: ReviewSectionProps) {
	const [allReviews, setAllReviews] = useState<Review[]>([]);
	const [distribution, setDistribution] = useState<Record<number, number>>({});
	const [loading, setLoading] = useState(true);
	const [selectedRating, setSelectedRating] = useState<number | null>(null);
	const [sort, setSort] = useState('newest');
	const [visibleCount, setVisibleCount] = useState(PER_PAGE);

	useEffect(() => {
		setLoading(true);
		setVisibleCount(PER_PAGE);

		Promise.all([
			getProductReviews(productId, {
				rating: selectedRating !== null ? [selectedRating] : undefined,
				sort,
			}),
			getReviewDistribution(productId),
		]).then(([reviews, dist]) => {
			setAllReviews(reviews);
			setDistribution(dist);
			setLoading(false);
		});
	}, [productId, selectedRating, sort]);

	const visibleReviews = allReviews.slice(0, visibleCount);
	const hasMore = visibleCount < allReviews.length;

	return (
		<section className='mt-12 md:mt-16'>
			<div className='flex items-center gap-3 mb-6'>
				<div className='h-px w-8 bg-accent/50' />
				<span className='text-xs font-semibold uppercase tracking-[0.15em] text-text2'>Đánh giá</span>
			</div>

			{/* ── Summary + filter ── */}
			<div className='rounded-2xl border border-border/50 bg-surface p-5 md:p-6 mb-6'>
				<RatingSummary
					average={rating}
					total={reviewCount}
					distribution={distribution}
					selectedRating={selectedRating}
					onSelectRating={setSelectedRating}
				/>
			</div>

			{loading ? (
				<div className='space-y-3'>
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className='rounded-xl border border-border/50 bg-surface p-4 md:p-5'>
							<div className='flex items-start gap-3'>
								<div className='skeleton h-9 w-9 rounded-full shrink-0' />
								<div className='flex-1 space-y-2'>
									<div className='skeleton h-4 w-32 rounded' />
									<div className='skeleton h-3 w-24 rounded' />
									<div className='skeleton h-3 w-full rounded' />
									<div className='skeleton h-3 w-3/4 rounded' />
								</div>
							</div>
						</div>
					))}
				</div>
			) : allReviews.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					className='flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border/50 bg-surface/50'
				>
					<div className='flex h-14 w-14 items-center justify-center rounded-xl bg-surface2 text-text2 mb-4'>
						<MessageSquareText className='h-6 w-6' />
					</div>
					<h3 className='text-base font-semibold text-text mb-1'>Chưa có đánh giá</h3>
					<p className='text-sm text-text2 max-w-xs'>
						{selectedRating
							? 'Không có đánh giá nào với mức sao này.'
							: 'Hãy là người đầu tiên đánh giá sản phẩm này.'}
					</p>
				</motion.div>
			) : (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
					className='space-y-3'
				>
					{visibleReviews.map((review, i) => (
						<motion.div
							key={review.id}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.04, duration: 0.3 }}
						>
							<ReviewCard review={review} />
						</motion.div>
					))}

					{hasMore && (
						<div className='flex justify-center pt-2'>
							<button
								onClick={() => setVisibleCount(c => c + PER_PAGE)}
								className='inline-flex h-10 items-center gap-1.5 rounded-full border border-border/50 bg-surface px-5 text-xs font-semibold text-text2 hover:text-text hover:border-text/30 transition-colors'
							>
								Xem thêm {Math.min(PER_PAGE, allReviews.length - visibleCount)} đánh giá
							</button>
						</div>
					)}
				</motion.div>
			)}
		</section>
	);
}
