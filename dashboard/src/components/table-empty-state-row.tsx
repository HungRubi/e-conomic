import { tableStateMinHeightClass } from '@/components/table-state-layout';
import { TableCell, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';

export type TableEmptyStateRowProps = {
	colSpan: number;
	title?: string;
	description?: string;
};

export function TableEmptyStateRow({
	colSpan,
	title = 'Không có dữ liệu',
	description = 'Thử đổi bộ lọc hoặc từ khóa tìm kiếm.',
}: TableEmptyStateRowProps) {
	return (
		<TableRow className='hover:bg-transparent'>
			<TableCell colSpan={colSpan} className='p-0'>
				<div
					className={`text-muted-foreground flex ${tableStateMinHeightClass} flex-col items-center justify-center gap-2 px-4 py-4 text-center`}
				>
					<Search className='size-4 shrink-0 opacity-50' strokeWidth={1.75} aria-hidden />
					<div className='space-y-1'>
						<p className='text-foreground text-sm font-medium'>{title}</p>
						{description ? <p className='text-sm opacity-90'>{description}</p> : null}
					</div>
				</div>
			</TableCell>
		</TableRow>
	);
}
