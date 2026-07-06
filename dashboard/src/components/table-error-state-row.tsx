import { tableStateMinHeightClass } from '@/components/table-state-layout';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Info } from 'lucide-react';

export type TableErrorStateRowProps = {
	colSpan: number;
	message: string;
	onRetry?: () => void;
};

export function TableErrorStateRow({ colSpan, message, onRetry }: TableErrorStateRowProps) {
	return (
		<TableRow className='hover:bg-transparent'>
			<TableCell colSpan={colSpan} className='p-0'>
				<div
					className={`flex ${tableStateMinHeightClass} flex-col items-center justify-center gap-3 px-4 py-4 text-center`}
					role='alert'
				>
					<Info className='text-muted-foreground size-4 shrink-0 opacity-50' strokeWidth={1.75} aria-hidden />
					<p className='text-destructive text-sm font-medium'>{message}</p>
					{onRetry ? (
						<Button type='button' variant='outline' size='sm' onClick={onRetry}>
							Thử lại
						</Button>
					) : null}
				</div>
			</TableCell>
		</TableRow>
	);
}
