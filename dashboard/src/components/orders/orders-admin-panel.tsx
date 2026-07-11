import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	ArrowUpRight,
	ChevronLeft,
	ChevronRight,
	DownloadIcon,
	EllipsisVerticalIcon,
	Search,
	XCircleIcon,
} from 'lucide-react';

import {
	bulkUpdateOrderStatus,
	listOrders,
	type BulkUpdateOrderStatusBody,
	type ListOrdersParams,
	type OrderRow,
	type OrderStatus,
	type PaymentMethod,
	type PaymentStatus,
} from '@/api/admin-orders';
import { AuthApiError } from '@/auth/auth-api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DateRangePicker, type DateRangeValue } from '@/components/date-range-picker';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableEmptyStateRow } from '@/components/table-empty-state-row';
import { TableErrorStateRow } from '@/components/table-error-state-row';
import { TableRowsSkeleton } from '@/components/list-skeletons';
import { useHasRole, usePermission } from '@/hooks/use-permission';
import { dateStampForFile, exportToCsv } from '@/lib/csv-export';

import { OrderStatusBadge } from './order-status-badge';
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, canTransitionTo } from './order-status-helpers';
import { PaymentStatusBadge } from './payment-status-badge';

const BULK_TARGETS: OrderStatus[] = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export function OrdersAdminPanel() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const canBulk = usePermission('orders.bulkUpdate');
	const canUpdate = usePermission('orders.update');
	const canExport = usePermission('orders.export');
	useHasRole('ADMIN', 'STAFF');

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [sortBy, setSortBy] = useState<'createdAt' | 'totalVnd' | 'orderNumber'>('createdAt');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [search, setSearch] = useState('');
	const [searchInput, setSearchInput] = useState('');
	const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');
	const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | 'ALL'>('ALL');
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | 'ALL'>('ALL');
	const [dateRange, setDateRange] = useState<DateRangeValue>({ from: null, to: null });
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [bulkTarget, setBulkTarget] = useState<OrderStatus | null>(null);

	// Auto search: debounce searchInput -> search after 400ms idle
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			const trimmed = searchInput.trim();
			if (trimmed !== search) {
				setSearch(trimmed);
				setPage(1);
			}
		}, 400);
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

	const params: ListOrdersParams = {
		page,
		limit: pageSize,
		...(search && { search }),
		...(status !== 'ALL' && { status }),
		...(paymentStatus !== 'ALL' && { paymentStatus }),
		...(paymentMethod !== 'ALL' && { paymentMethod }),
		...(dateRange.from && { fromDate: dateRange.from }),
		...(dateRange.to && { toDate: dateRange.to }),
		sortBy,
		order: sortOrder,
	};

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['admin-orders', params],
		queryFn: () => listOrders(params),
	});

	const handleStatusChange = (value: string) => {
		setStatus(value as OrderStatus | 'ALL');
		setPage(1);
		setSelectedIds(new Set());
	};

	const handlePaymentStatusChange = (value: string) => {
		setPaymentStatus(value as PaymentStatus | 'ALL');
		setPage(1);
		setSelectedIds(new Set());
	};

	const handlePaymentMethodChange = (value: string) => {
		setPaymentMethod(value as PaymentMethod | 'ALL');
		setPage(1);
		setSelectedIds(new Set());
	};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

	const formatDate = (s: string) =>
		new Intl.DateTimeFormat('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		}).format(new Date(s));

	const items = useMemo(() => data?.items ?? [], [data]);
	const pageIds = items.map(o => o.id);
	const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
	const somePageSelected = !allPageSelected && pageIds.some(id => selectedIds.has(id));

	function togglePage(checked: boolean) {
		setSelectedIds(prev => {
			const next = new Set(prev);
			for (const id of pageIds) {
				if (checked) next.add(id);
				else next.delete(id);
			}
			return next;
		});
	}

	function toggleRow(id: string, checked: boolean) {
		setSelectedIds(prev => {
			const next = new Set(prev);
			if (checked) next.add(id);
			else next.delete(id);
			return next;
		});
	}

	const selectedOrders = useMemo(() => items.filter(o => selectedIds.has(o.id)), [items, selectedIds]);

	const eligibleForBulk = useMemo(() => {
		if (!bulkTarget) return [] as OrderRow[];
		return selectedOrders.filter(o => canTransitionTo(o.status, bulkTarget));
	}, [selectedOrders, bulkTarget]);

	const bulkMutation = useMutation({
		mutationFn: (body: BulkUpdateOrderStatusBody) => bulkUpdateOrderStatus(body),
		onSuccess: result => {
			void queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
			void queryClient.invalidateQueries({ queryKey: ['notifications'] });
			if (result.updated > 0) toast.success(`Đã cập nhật ${result.updated} đơn`);
			if (result.skipped > 0) toast.warning(`Bỏ qua ${result.skipped} đơn không hợp lệ`);
			if (result.failed > 0) toast.error(`${result.failed} đơn cập nhật thất bại`);
			setBulkTarget(null);
			setSelectedIds(new Set());
		},
		onError: err => {
			toast.error(err instanceof AuthApiError ? err.message : 'Bulk update thất bại');
			setBulkTarget(null);
		},
	});

	function exportCurrentPage() {
		if (items.length === 0) {
			toast.info('Không có đơn nào để xuất');
			return;
		}
		const target = selectedOrders.length > 0 ? selectedOrders : items;
		exportToCsv(`orders-${dateStampForFile()}`, target, [
			{ header: 'Mã đơn', accessor: (o: OrderRow) => o.orderNumber },
			{ header: 'Khách hàng', accessor: (o: OrderRow) => o.customerName },
			{ header: 'SĐT', accessor: (o: OrderRow) => o.customerPhone },
			{ header: 'Email', accessor: (o: OrderRow) => o.customerEmail ?? '' },
			{ header: 'Tổng tiền (VND)', accessor: (o: OrderRow) => o.totalVnd },
			{ header: 'Trạng thái', accessor: (o: OrderRow) => ORDER_STATUS_LABEL[o.status] },
			{ header: 'Thanh toán', accessor: (o: OrderRow) => o.paymentStatus },
			{ header: 'Phương thức', accessor: (o: OrderRow) => (o.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản') },
			{ header: 'Ngày tạo', accessor: (o: OrderRow) => o.createdAt },
		]);
		toast.success(`Đã xuất ${target.length} đơn ra CSV`);
	}

	const bulkDisabled = bulkMutation.isPending || eligibleForBulk.length === 0;

	return (
		<div className='dashboard-fade-in space-y-4'>
			<div className='flex flex-wrap items-center justify-between gap-2'>
				<h2 className='text-xl font-semibold tracking-tight'>Quản lý đơn hàng</h2>
				<div className='flex items-center gap-2'>
					{canExport ? (
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={exportCurrentPage}
							className='gap-1.5'
						>
							<DownloadIcon className='size-4' />
							Xuất CSV {selectedOrders.length > 0 ? `(${selectedOrders.length})` : ''}
						</Button>
					) : null}
				</div>
			</div>

			{/* Filters - combined row */}
			<div className='flex flex-wrap items-center gap-2'>
				<div className='relative min-w-0 flex-1'>
					<Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						placeholder='Tìm theo mã đơn, tên, SĐT...'
						value={searchInput}
						onChange={e => setSearchInput(e.target.value)}
						className='w-full pl-9'
					/>
				</div>
				<Select value={status} onValueChange={handleStatusChange}>
					<SelectTrigger className='h-8w-35'>
						<SelectValue placeholder='Trạng thái' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='ALL'>Trạng thái đơn hàng</SelectItem>
						<SelectItem value='PENDING'>Chờ xác nhận</SelectItem>
						<SelectItem value='CONFIRMED'>Đã xác nhận</SelectItem>
						<SelectItem value='PROCESSING'>Đang xử lý</SelectItem>
						<SelectItem value='SHIPPED'>Đã giao vận</SelectItem>
						<SelectItem value='DELIVERED'>Đã giao</SelectItem>
						<SelectItem value='CANCELLED'>Đã hủy</SelectItem>
						<SelectItem value='REFUNDED'>Đã hoàn tiền</SelectItem>
					</SelectContent>
				</Select>

				<Select value={paymentStatus} onValueChange={handlePaymentStatusChange}>
					<SelectTrigger className='h-8w-35'>
						<SelectValue placeholder='Thanh toán' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='ALL'>Trạng thái thanh toán</SelectItem>
						<SelectItem value='PENDING'>Chờ thanh toán</SelectItem>
						<SelectItem value='AWAITING_CONFIRMATION'>Chờ xác nhận CK</SelectItem>
						<SelectItem value='PAID'>Đã thanh toán</SelectItem>
						<SelectItem value='FAILED'>Thất bại</SelectItem>
						<SelectItem value='REFUNDED'>Đã hoàn tiền</SelectItem>
					</SelectContent>
				</Select>

				<Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
					<SelectTrigger className='h-8w-35'>
						<SelectValue placeholder='Phương thức' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='ALL'>Phương thức thanh toán</SelectItem>
						<SelectItem value='COD'>COD</SelectItem>
						<SelectItem value='BANKING'>Chuyển khoản</SelectItem>
					</SelectContent>
				</Select>

				<DateRangePicker
					value={dateRange}
					onChange={v => {
						setDateRange(v);
						setPage(1);
						setSelectedIds(new Set());
					}}
					className='h-8gap-1.5 font-normal'
				/>

				<Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
					<SelectTrigger className='h-8w-32'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value='createdAt'>Ngày tạo</SelectItem>
							<SelectItem value='orderNumber'>Mã đơn</SelectItem>
							<SelectItem value='totalVnd'>Tổng tiền</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>

				<Select value={sortOrder} onValueChange={v => setSortOrder(v as typeof sortOrder)}>
					<SelectTrigger className='h-8w-28'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value='desc'>Giảm dần</SelectItem>
							<SelectItem value='asc'>Tăng dần</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>

				<Select
					value={String(pageSize)}
					onValueChange={v => {
						setPageSize(Number(v));
						setPage(1);
						setSelectedIds(new Set());
					}}
				>
					<SelectTrigger className='h-8w-20'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{[10, 20, 50, 100].map(n => (
								<SelectItem key={n} value={String(n)}>
									{n}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>

			<FilterChips
				status={status}
				paymentStatus={paymentStatus}
				paymentMethod={paymentMethod}
				dateRange={dateRange}
				search={search}
				onClearStatus={() => {
					setStatus('ALL');
					setPage(1);
					setSelectedIds(new Set());
				}}
				onClearPaymentStatus={() => {
					setPaymentStatus('ALL');
					setPage(1);
					setSelectedIds(new Set());
				}}
				onClearPaymentMethod={() => {
					setPaymentMethod('ALL');
					setPage(1);
					setSelectedIds(new Set());
				}}
				onClearDate={() => {
					setDateRange({ from: null, to: null });
					setPage(1);
					setSelectedIds(new Set());
				}}
				onClearSearch={() => {
					setSearch('');
					setSearchInput('');
					setPage(1);
				}}
				onClearAll={() => {
					setStatus('ALL');
					setPaymentStatus('ALL');
					setPaymentMethod('ALL');
					setDateRange({ from: null, to: null });
					setSearch('');
					setSearchInput('');
					setPage(1);
					setSelectedIds(new Set());
				}}
			/>

			{/* Bulk action bar */}
			{canBulk && selectedIds.size > 0 ? (
				<div className='flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm'>
					<span className='font-medium'>Đã chọn {selectedIds.size} đơn</span>
					<span className='text-muted-foreground'>·</span>
					<span className='text-muted-foreground'>Chuyển sang:</span>
					<div className='flex flex-wrap gap-1.5'>
						{BULK_TARGETS.map(target => (
							<Button
								key={target}
								type='button'
								variant='outline'
								size='sm'
								onClick={() => setBulkTarget(target)}
								disabled={bulkMutation.isPending}
							>
								{ORDER_STATUS_LABEL[target]}
							</Button>
						))}
					</div>
					<Button
						type='button'
						variant='ghost'
						size='sm'
						onClick={() => setSelectedIds(new Set())}
						className='ml-auto gap-1.5 text-muted-foreground'
					>
						<XCircleIcon className='size-3.5' /> Bỏ chọn
					</Button>
				</div>
			) : null}

			{/* Table */}
			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							{canBulk ? (
								<TableHead className='w-10'>
									<div className='flex items-center justify-center'>
										<Checkbox
											checked={allPageSelected || (somePageSelected ? 'indeterminate' : false)}
											onCheckedChange={v => togglePage(Boolean(v))}
											aria-label='Chọn tất cả đơn trên trang'
										/>
									</div>
								</TableHead>
							) : null}
							<TableHead className='w-36'>Mã đơn</TableHead>
							<TableHead>Khách hàng</TableHead>
							<TableHead className='text-right'>Tổng tiền</TableHead>
							<TableHead>Trạng thái</TableHead>
							<TableHead>Thanh toán</TableHead>
							<TableHead>Phương thức</TableHead>
							<TableHead>Ngày tạo</TableHead>
							<TableHead className='w-16 text-right'>Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRowsSkeleton rows={5} columns={canBulk ? 9 : 8} />
						) : error ? (
							<TableErrorStateRow
								colSpan={canBulk ? 9 : 8}
								message={error instanceof Error ? error.message : 'Không tải được danh sách'}
								onRetry={() => void refetch()}
							/>
						) : !data || data.items.length === 0 ? (
							<TableEmptyStateRow
								colSpan={canBulk ? 9 : 8}
								description='Chưa có đơn hàng nào khớp bộ lọc.'
							/>
						) : (
							data.items.map(order => (
								<TableRow
									key={order.id}
									className='dashboard-row-enter cursor-pointer hover:bg-muted/50'
									onClick={() => navigate(`/orders/${order.id}`)}
									role='button'
									tabIndex={0}
									onKeyDown={e => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											navigate(`/orders/${order.id}`);
										}
									}}
								>
									{canBulk ? (
										<TableCell onClick={e => e.stopPropagation()}>
											<div className='flex items-center justify-center'>
												<Checkbox
													checked={selectedIds.has(order.id)}
													onCheckedChange={v => toggleRow(order.id, Boolean(v))}
													aria-label={`Chọn đơn ${order.orderNumber}`}
												/>
											</div>
										</TableCell>
									) : null}
									<TableCell className='font-medium'>{order.orderNumber}</TableCell>
									<TableCell>
										<div className='flex flex-col'>
											<span className='font-medium'>{order.customerName}</span>
											<span className='text-xs text-muted-foreground'>{order.customerPhone}</span>
										</div>
									</TableCell>
									<TableCell className='text-right font-medium'>
										{formatCurrency(order.totalVnd)}
									</TableCell>
									<TableCell>
										<OrderStatusBadge status={order.status} />
									</TableCell>
									<TableCell>
										<PaymentStatusBadge status={order.paymentStatus} />
									</TableCell>
									<TableCell>
										<span className='text-sm'>
											{order.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}
										</span>
									</TableCell>
									<TableCell className='text-sm text-muted-foreground'>
										{formatDate(order.createdAt)}
									</TableCell>
									<TableCell className='text-right'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													type='button'
													variant='ghost'
													size='icon'
													className='ml-auto size-8 text-muted-foreground data-[state=open]:bg-muted'
													aria-label='Mở thao tác đơn'
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
												<DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
													<ArrowUpRight className='size-4' />
													Mở chi tiết
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{data && data.totalPages > 1 && (
				<div className='flex items-center justify-between'>
					<div className='text-sm text-muted-foreground'>
						Trang {data.page} / {data.totalPages} (Tổng: {data.total} đơn hàng)
					</div>
					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => setPage(p => Math.max(1, p - 1))}
							disabled={page === 1}
						>
							<ChevronLeft className='h-4 w-4' />
							Trước
						</Button>
						<Button
							variant='outline'
							size='sm'
							onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
							disabled={page === data.totalPages}
						>
							Sau
							<ChevronRight className='h-4 w-4' />
						</Button>
					</div>
				</div>
			)}

			<AlertDialog open={bulkTarget !== null} onOpenChange={open => !open && setBulkTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Chuyển {selectedOrders.length} đơn sang {bulkTarget ? ORDER_STATUS_LABEL[bulkTarget] : ''}?
						</AlertDialogTitle>
						<AlertDialogDescription asChild>
							<div className='space-y-2 text-sm'>
								<p>
									{eligibleForBulk.length} / {selectedOrders.length} đơn hợp lệ để chuyển trạng thái
									này. Các đơn không hợp lệ sẽ bị bỏ qua.
								</p>
								{!canUpdate ? (
									<p className='text-destructive'>Bạn không có quyền cập nhật đơn hàng.</p>
								) : null}
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={bulkMutation.isPending}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							disabled={bulkDisabled}
							onClick={() =>
								bulkTarget &&
								bulkMutation.mutate({
									ids: eligibleForBulk.map(o => o.id),
									status: bulkTarget,
								})
							}
						>
							{bulkMutation.isPending ? 'Đang cập nhật…' : 'Xác nhận'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

type FilterChipsProps = {
	status: OrderStatus | 'ALL';
	paymentStatus: PaymentStatus | 'ALL';
	paymentMethod: PaymentMethod | 'ALL';
	dateRange: DateRangeValue;
	search: string;
	onClearStatus: () => void;
	onClearPaymentStatus: () => void;
	onClearPaymentMethod: () => void;
	onClearDate: () => void;
	onClearSearch: () => void;
	onClearAll: () => void;
};

function FilterChips({
	status,
	paymentStatus,
	paymentMethod,
	dateRange,
	search,
	onClearStatus,
	onClearPaymentStatus,
	onClearPaymentMethod,
	onClearDate,
	onClearSearch,
	onClearAll,
}: FilterChipsProps) {
	const chips: Array<{ key: string; label: string; onClear: () => void }> = [];
	if (search) {
		chips.push({ key: 'search', label: `Tìm: "${search}"`, onClear: onClearSearch });
	}
	if (status !== 'ALL') {
		chips.push({ key: 'status', label: `Trạng thái: ${ORDER_STATUS_LABEL[status]}`, onClear: onClearStatus });
	}
	if (paymentStatus !== 'ALL') {
		chips.push({
			key: 'paymentStatus',
			label: `Thanh toán: ${PAYMENT_STATUS_LABEL[paymentStatus]}`,
			onClear: onClearPaymentStatus,
		});
	}
	if (paymentMethod !== 'ALL') {
		chips.push({
			key: 'paymentMethod',
			label: `Phương thức: ${paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}`,
			onClear: onClearPaymentMethod,
		});
	}
	if (dateRange.from || dateRange.to) {
		const from = dateRange.from ? new Date(`${dateRange.from}T00:00:00`).toLocaleDateString('vi-VN') : '—';
		const to = dateRange.to ? new Date(`${dateRange.to}T00:00:00`).toLocaleDateString('vi-VN') : '—';
		chips.push({ key: 'date', label: `${from} → ${to}`, onClear: onClearDate });
	}

	if (chips.length === 0) return null;

	return (
		<div className='flex flex-wrap items-center gap-1.5 rounded-md border border-dashed border-border/60 bg-muted/30 px-3 py-2 text-xs'>
			<span className='text-muted-foreground'>Bộ lọc:</span>
			{chips.map(chip => (
				<span
					key={chip.key}
					className='inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5 ring-1 ring-border'
				>
					{chip.label}
					<button
						type='button'
						aria-label={`Xoá lọc ${chip.label}`}
						className='text-muted-foreground hover:text-destructive'
						onClick={chip.onClear}
					>
						<XCircleIcon className='size-3' />
					</button>
				</span>
			))}
			{chips.length > 1 ? (
				<Button type='button' variant='ghost' size='sm' className='h-6 px-2 text-xs' onClick={onClearAll}>
					Xoá tất cả
				</Button>
			) : null}
		</div>
	);
}
