import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
	CONTACT_INQUIRY_SOURCE_LABEL,
	CONTACT_INQUIRY_STATUS_LABEL,
	deleteContactInquiry,
	fetchContactInquiries,
	type AdminContactInquiryRow,
	type ContactInquiryStatus,
} from '@/api/admin-contact-inquiries';
import { AuthApiError } from '@/auth/auth-api';
import { TableEmptyStateRow } from '@/components/table-empty-state-row';
import { TableErrorStateRow } from '@/components/table-error-state-row';
import { TableRowsSkeleton } from '@/components/list-skeletons';
import { fmtUserDate } from '@/components/users/user-table-shared';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEntityCrud } from '@/hooks/use-permission';
import {
	ArrowUpRight,
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisVerticalIcon,
	GripVerticalIcon,
	Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const STATUS_BADGE: Record<ContactInquiryStatus, 'default' | 'secondary' | 'outline'> = {
	new: 'default',
	read: 'secondary',
	archived: 'outline',
};

export function ContactInquiriesAdminPanel() {
	const navigate = useNavigate();
	const crud = useEntityCrud('contactInquiries');
	const qc = useQueryClient();

	const [qInput, setQInput] = React.useState('');
	const [statusFilter, setStatusFilter] = React.useState<'all' | ContactInquiryStatus>('new');
	const [pageSize, setPageSize] = React.useState(15);
	const [page, setPage] = React.useState(0);

	const listQuery = useQuery({
		queryKey: ['contact-inquiries', qInput, statusFilter, page, pageSize],
		queryFn: () =>
			fetchContactInquiries({
				q: qInput.trim() || undefined,
				status: statusFilter,
				sortBy: 'createdAt',
				sortOrder: 'desc',
				limit: pageSize,
				offset: page * pageSize,
			}),
		refetchInterval: 30_000,
	});

	const rows = listQuery.data?.items ?? [];
	const total = listQuery.data?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / pageSize));

	const [deleteTarget, setDeleteTarget] = React.useState<AdminContactInquiryRow | null>(null);
	const [deleteBusy, setDeleteBusy] = React.useState(false);
		function openDetail(row: AdminContactInquiryRow) {
		navigate(`/content/contact-inquiries/${row.id}`);
	}

	async function confirmDelete() {
		if (!crud.canDelete || !deleteTarget) return;
		setDeleteBusy(true);
		try {
			await deleteContactInquiry(deleteTarget.id);
			toast.success('đã xóa tin nhắn');
			setDeleteTarget(null);
			void listQuery.refetch();
			void qc.invalidateQueries({ queryKey: ['contact-inquiries-summary'] });
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Xóa thất bại');
		} finally {
			setDeleteBusy(false);
		}
	}

	return (
		<div className='dashboard-fade-in flex min-h-0 flex-1 flex-col gap-4'>
			<div>
				<h1 className='text-lg font-semibold tracking-tight'>Tin nhắn liên hệ</h1>
				<p className='text-muted-foreground text-sm'>
					Click một dòng để mở chi tiết và phản hồi.
					{!listQuery.isLoading ? ` · ${total} tin` : null}
				</p>
			</div>

			<div className='flex flex-wrap gap-2'>
				<Input
					placeholder='Tìm tên, email, nội dung…'
					value={qInput}
					onChange={e => {
						setQInput(e.target.value);
						setPage(0);
					}}
					className='min-w-48 flex-1'
				/>
				<Select
					value={statusFilter}
					onValueChange={v => {
						setStatusFilter(v as typeof statusFilter);
						setPage(0);
					}}
				>
					<SelectTrigger className='w-36'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>Tất cả</SelectItem>
						<SelectItem value='new'>Mới</SelectItem>
						<SelectItem value='read'>đã đọc</SelectItem>
						<SelectItem value='archived'>Lưu trữ</SelectItem>
					</SelectContent>
				</Select>
				<Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
					<SelectTrigger className='w-24'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{[10, 15, 20, 50].map(n => (
							<SelectItem key={n} value={String(n)}>
								{n}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className='overflow-hidden rounded-lg border bg-background'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-10'><span className='sr-only'>Kéo</span></TableHead>
							<TableHead>Khách</TableHead>
							<TableHead className='hidden md:table-cell'>Nguồn</TableHead>
							<TableHead>Trạng thái</TableHead>
							<TableHead className='hidden sm:table-cell'>Thời gian</TableHead>
							<TableHead className='w-16 text-right'>Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{listQuery.isLoading ? (
							<TableRowsSkeleton rows={5} columns={6} />
						) : listQuery.isError ? (
							<TableErrorStateRow
								colSpan={6}
								message='Không tải được danh sách'
								onRetry={() => void listQuery.refetch()}
							/>
						) : rows.length === 0 ? (
							<TableEmptyStateRow
								colSpan={6}
								title='Chưa có tin nhắn'
								description='Tin từ form website sẽ hiện ở đây.'
							/>
						) : (
							rows.map(row => (
								<TableRow
									key={row.id}
									className='dashboard-row-enter cursor-pointer'
									onClick={() => openDetail(row)}
									role='button'
									tabIndex={0}
									onKeyDown={e => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											openDetail(row);
										}
									}}
								>
									<TableCell>
										<div className='flex items-center justify-center'>
											<GripVerticalIcon className='size-4 text-muted-foreground' />
										</div>
									</TableCell>
									<TableCell>
										<div className='font-medium'>{row.name}</div>
										<div className='text-muted-foreground text-xs'>
											{row.email ?? row.phone ?? '—'}
										</div>
									</TableCell>
									<TableCell className='hidden text-xs md:table-cell'>
										{CONTACT_INQUIRY_SOURCE_LABEL[row.source] ?? row.source}
										{row.context ? ` · ${row.context}` : ''}
									</TableCell>
									<TableCell>
										<Badge variant={STATUS_BADGE[row.status]}>
											{CONTACT_INQUIRY_STATUS_LABEL[row.status]}
										</Badge>
									</TableCell>
									<TableCell className='text-muted-foreground hidden text-sm sm:table-cell'>
										{fmtUserDate(row.createdAt)}
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
												<DropdownMenuItem onClick={() => openDetail(row)}>
													<ArrowUpRight className='size-4' />
													Mở chi tiết
												</DropdownMenuItem>
												{crud.canDelete ? (
													<>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															variant='destructive'
															onClick={() => setDeleteTarget(row)}
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

			<div className='text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between'>
				<span>
					Hiển thị {total === 0 ? 0 : page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} / {total}
				</span>
				<div className='flex items-center gap-2'>
					<Button
						type='button'
						variant='outline'
						size='icon'
						className='size-8'
						disabled={page <= 0}
						onClick={() => setPage(p => Math.max(0, p - 1))}
					>
						<ChevronLeftIcon className='size-4' />
					</Button>
					<span>
						Trang {page + 1} / {pageCount}
					</span>
					<Button
						type='button'
						variant='outline'
						size='icon'
						className='size-8'
						disabled={page + 1 >= pageCount}
						onClick={() => setPage(p => p + 1)}
					>
						<ChevronRightIcon className='size-4' />
					</Button>
				</div>
			</div>

			<AlertDialog open={deleteTarget !== null} onOpenChange={open => !open && setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa tin nhắn?</AlertDialogTitle>
						<AlertDialogDescription>Hành động không thể hoàn tác.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteBusy}>Huỷ</AlertDialogCancel>
						<AlertDialogAction disabled={deleteBusy} onClick={() => void confirmDelete()}>
							{deleteBusy ? 'Đang xoá…' : 'Xóa'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
