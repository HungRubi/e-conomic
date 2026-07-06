import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type ListSkeletonProps = {
	rows?: number;
	columns?: number;
	className?: string;
};

/**
 * Skeleton hàng cho data tables — dùng chung khắp dashboard để loading state nhất quán.
 * `columns` đếm cả checkbox và cột thao tác. đặt rộng cột nhỏ ở đầu/cuối nếu có checkbox/action.
 */
export function TableRowsSkeleton({ rows = 5, columns = 5, className }: ListSkeletonProps) {
	return (
		<>
			{Array.from({ length: rows }).map((_, rowIdx) => (
				<TableRow key={rowIdx} className={className}>
					{Array.from({ length: columns }).map((__, colIdx) => (
						<TableCell key={colIdx}>
							<Skeleton className={cn('h-4 w-full', colIdx === 0 && 'max-w-[60%]')} />
						</TableCell>
					))}
				</TableRow>
			))}
		</>
	);
}

/** Skeleton list dạng card — dùng ở orders/pending, top products, v.v. */
export function CardListSkeleton({ count = 6, className }: { count?: number; className?: string }) {
	return (
		<div className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-3', className)}>
			{Array.from({ length: count }).map((_, i) => (
				<Skeleton key={i} className='h-28 w-full rounded-xl' />
			))}
		</div>
	);
}

/** Skeleton header có title + meta + 1 hàng filter — dùng cho list pages. */
export function ListHeaderSkeleton() {
	return (
		<div className='space-y-3'>
			<Skeleton className='h-7 w-64' />
			<div className='flex flex-wrap gap-2'>
				<Skeleton className='h-9 w-72' />
				<Skeleton className='h-9 w-32' />
				<Skeleton className='h-9 w-32' />
			</div>
		</div>
	);
}
