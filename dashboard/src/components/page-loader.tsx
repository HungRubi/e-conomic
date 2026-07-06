import { Skeleton } from '@/components/ui/skeleton';

/** Skeleton dùng làm Suspense fallback khi lazy-load route con. */
export function PageLoader() {
	return (
		<div className='space-y-4 p-2' role='status' aria-label='Đang tải trang'>
			<Skeleton className='h-9 w-72' />
			<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className='h-28 w-full rounded-xl' />
				))}
			</div>
			<Skeleton className='h-72 w-full rounded-xl' />
		</div>
	);
}
