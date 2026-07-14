import { Skeleton as MedusaSkeleton } from '@medusajs/ui';

interface SkeletonProps {
	className?: string;
	variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'image';
	width?: string | number;
	height?: string | number;
}

export default function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
	const variantClass = {
		text: 'h-4 w-full rounded',
		circular: 'rounded-full',
		rectangular: 'rounded-md',
		card: 'h-48 w-full rounded-lg',
		image: 'aspect-square w-full rounded-lg',
	}[variant];

	return <MedusaSkeleton className={`${variantClass} ${className}`} style={{ width, height }} />;
}

/* ── Pre-composed skeletons (keep as is, just use MedusaSkeleton in base) ── */

export function ProductCardSkeleton() {
	return (
		<div className='card overflow-hidden !p-2.5 rounded-xl border-border-base/80 bg-bg-base/90'>
			<div className='relative aspect-square overflow-hidden rounded-lg'>
				<MedusaSkeleton className='absolute inset-0' />
			</div>
			<div className='flex min-h-[140px] flex-col px-1.5 pb-1 pt-3'>
				<MedusaSkeleton className='mb-2 h-4 w-3/4 rounded' />
				<MedusaSkeleton className='mb-1 h-3 w-full rounded' />
				<MedusaSkeleton className='mb-2 h-3 w-2/3 rounded' />
				<div className='mb-1 flex gap-1'>
					{Array.from({ length: 5 }).map((_, i) => (
						<MedusaSkeleton key={i} className='h-3 w-3 rounded-full' />
					))}
				</div>
				<div className='mt-auto flex items-end justify-between gap-2 pt-3'>
					<div className='space-y-1.5'>
						<MedusaSkeleton className='h-5 w-20 rounded' />
						<MedusaSkeleton className='h-3 w-14 rounded' />
					</div>
					<MedusaSkeleton className='h-8 w-24 rounded-full' />
				</div>
			</div>
		</div>
	);
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
	return (
		<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
			{Array.from({ length: count }).map((_, i) => (
				<ProductCardSkeleton key={i} />
			))}
		</div>
	);
}

export function CartSkeleton() {
	return (
		<div className='space-y-3'>
			<div className='flex items-center justify-between gap-3 rounded-xl border border-border-base/80 bg-bg-base/90 px-4 py-3'>
				<div className='flex items-center gap-3'>
					<MedusaSkeleton className='h-5 w-5 rounded-md' />
					<MedusaSkeleton className='h-4 w-28 rounded' />
				</div>
				<MedusaSkeleton className='h-4 w-24 rounded' />
			</div>

			<div className='rounded-xl border border-border-base/80 bg-bg-base/90 p-4'>
				<div className='flex items-start gap-3'>
					<MedusaSkeleton className='h-10 w-10 shrink-0 rounded-full' />
					<div className='flex-1 space-y-2'>
						<MedusaSkeleton className='h-4 w-72 rounded' />
						<MedusaSkeleton className='h-2 w-full rounded-full' />
					</div>
				</div>
			</div>

			{Array.from({ length: 3 }).map((_, i) => (
				<div
					key={i}
					className='rounded-xl border border-border-base/80 bg-bg-base/90 shadow-[0_18px_60px_rgba(0,0,0,0.06)]'
					style={{ animationDelay: `${i * 80}ms` }}
				>
					<div className='grid grid-cols-[32px_92px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[32px_112px_minmax(0,1fr)] sm:gap-4 sm:p-4'>
						<div className='flex items-start pt-7 sm:pt-9'>
							<MedusaSkeleton className='h-5 w-5 rounded-md' />
						</div>
						<div className='aspect-square overflow-hidden rounded-lg'>
							<MedusaSkeleton className='h-full w-full' />
						</div>
						<div className='min-w-0 space-y-2.5'>
							<div className='flex items-start justify-between gap-2'>
								<MedusaSkeleton className='h-5 w-3/4 rounded' />
								<MedusaSkeleton className='h-7 w-7 shrink-0 rounded-full' />
							</div>
							<MedusaSkeleton className='h-6 w-24 rounded-full' />
							<div className='flex items-end justify-between gap-2'>
								<div className='space-y-1.5'>
									<MedusaSkeleton className='h-5 w-20 rounded' />
									<MedusaSkeleton className='h-3 w-14 rounded' />
								</div>
								<MedusaSkeleton className='h-8 w-28 rounded-full' />
							</div>
							<div className='flex gap-1.5'>
								<MedusaSkeleton className='h-5 w-20 rounded-full' />
								<MedusaSkeleton className='h-5 w-16 rounded-full' />
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
