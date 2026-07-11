import { type AdminPromotionDiscountRow } from '@/api/admin-promotion-discounts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableEmptyStateRow } from '@/components/table-empty-state-row';
import { TableErrorStateRow } from '@/components/table-error-state-row';
import { TableRowsSkeleton } from '@/components/list-skeletons';
import { fmtUserDate } from '@/components/users/user-table-shared';
import { GripVerticalIcon, ArrowUpRight, EllipsisVerticalIcon, Trash2 } from 'lucide-react';

const STATUS_LABEL: Record<AdminPromotionDiscountRow['status'], string> = {
	DRAFT: 'Nháp',
	ACTIVE: 'Hoạt động',
	ARCHIVED: 'Lưu trữ',
};

function formatValue(row: AdminPromotionDiscountRow): string {
	if (row.type === 'PERCENT') {
		return `${row.value}%`;
	}
	return `${row.value.toLocaleString('vi-VN')}đ`;
}

function formatDateRange(row: AdminPromotionDiscountRow): string {
	if (!row.startsAt && !row.endsAt) return '—';
	const start = row.startsAt ? new Date(row.startsAt).toLocaleDateString('vi-VN') : '—';
	const end = row.endsAt ? new Date(row.endsAt).toLocaleDateString('vi-VN') : '—';
	return `${start} → ${end}`;
}

type PromotionDiscountTableProps = {
	rows: AdminPromotionDiscountRow[];
	loading: boolean;
	error: string | null;
	onOpenDetail: (row: AdminPromotionDiscountRow) => void;
	onDelete: (row: AdminPromotionDiscountRow) => void;
	onRetry: () => void;
	canDelete: boolean;
};

export function PromotionDiscountTable({
	rows,
	loading,
	error,
	onOpenDetail,
	onDelete,
	onRetry,
	canDelete,
}: PromotionDiscountTableProps) {
	return (
		<div className='overflow-hidden rounded-lg border bg-background'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className='w-10'>
							<div className='flex items-center justify-center'>
								<GripVerticalIcon className='text-muted-foreground size-4' />
							</div>
						</TableHead>
						<TableHead>Tiêu đề</TableHead>
						<TableHead>Mã</TableHead>
						<TableHead>Giá trị</TableHead>
						<TableHead>Trạng thái</TableHead>
						<TableHead>Thời gian</TableHead>
						<TableHead className='text-muted-foreground hidden md:table-cell'>Cập nhật</TableHead>
						<TableHead className='w-16 text-right'>Thao tác</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableRowsSkeleton rows={5} columns={8} />
					) : error ? (
						<TableErrorStateRow colSpan={8} message={error} onRetry={onRetry} />
					) : rows.length === 0 ? (
						<TableEmptyStateRow colSpan={8} />
					) : (
						rows.map(row => (
							<TableRow
								key={row.id}
								className='dashboard-row-enter cursor-pointer'
								onClick={() => onOpenDetail(row)}
								role='button'
								tabIndex={0}
								onKeyDown={e => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										onOpenDetail(row);
									}
								}}
							>
								<TableCell>
									<div
										className='flex items-center justify-center'
										onClick={e => e.stopPropagation()}
									>
										<GripVerticalIcon className='text-muted-foreground size-4' />
									</div>
								</TableCell>
								<TableCell className='font-medium'>{row.title}</TableCell>
								<TableCell className='font-mono text-sm'>{row.code}</TableCell>
								<TableCell className='text-sm'>{formatValue(row)}</TableCell>
								<TableCell>
									<Badge
										variant={
											row.status === 'ACTIVE'
												? 'success'
												: row.status === 'DRAFT'
													? 'secondary'
													: 'muted'
										}
									>
										{STATUS_LABEL[row.status]}
									</Badge>
								</TableCell>
								<TableCell className='text-muted-foreground text-sm'>{formatDateRange(row)}</TableCell>
								<TableCell className='text-muted-foreground hidden text-sm md:table-cell'>
									{fmtUserDate(row.updatedAt)}
								</TableCell>
								<TableCell className='text-right'>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												type='button'
												variant='ghost'
												size='icon'
												className='ml-auto size-8 text-muted-foreground data-[state=open]:bg-muted'
												aria-label='Mở thao tác'
												onClick={e => e.stopPropagation()}
											>
												<EllipsisVerticalIcon className='size-4' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align='end'
											className='w-44'
											onClick={e => e.stopPropagation()}
										>
											<DropdownMenuItem onClick={() => onOpenDetail(row)}>
												<ArrowUpRight className='size-4' />
												Mở chi tiết
											</DropdownMenuItem>
											{canDelete ? (
												<>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														variant='destructive'
														onClick={() => onDelete(row)}
													>
														<Trash2 className='size-4' />
														Xóa
													</DropdownMenuItem>
												</>
											) : null}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
