import { Link, useNavigate } from 'react-router-dom';
import { GripVerticalIcon, ArrowUpRight, ChevronLeftIcon, ChevronRightIcon, ClockIcon, EllipsisVerticalIcon, RefreshCwIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

import { listOrders } from '@/api/admin-orders';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { PaymentStatusBadge } from '@/components/orders/payment-status-badge';
import { TableErrorStateRow } from '@/components/table-error-state-row';
import { TableRowsSkeleton } from '@/components/list-skeletons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const fmt = (n: number) =>
	new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
		maximumFractionDigits: 0,
	}).format(n);

const fmtDate = (iso: string) =>
	new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));

export default function OrdersPendingPage() {
	const navigate = useNavigate();
	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(20);

	const { data, isLoading, isFetching, error, refetch } = useQuery({
		queryKey: ['admin-orders', { status: 'PENDING', page, limit: pageSize }],
		queryFn: () =>
			listOrders({
				status: 'PENDING',
				limit: pageSize,
				page,
				sortBy: 'createdAt',
				order: 'asc',
			}),
		staleTime: 30_000,
	});

	const items = data?.items ?? [];
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	function openDetail(id: string) {
		navigate(`/orders/${id}`);
	}

	return (
		<div className='dashboard-fade-in space-y-4'>
			<header className='flex flex-col gap-2 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-lg font-semibold tracking-tight'>Đơn chờ xử lý</h1>
					<p className='text-xs text-muted-foreground'>
						Danh sách đơn ở trạng thái <span className='font-medium'>PENDING</span> — sắp xếp theo thời gian
						để đội xử lý không bỏ sót.
						{!isLoading ? ` · ${total} đơn` : null}
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<Select
						value={String(pageSize)}
						onValueChange={v => {
							setPageSize(Number(v));
							setPage(1);
						}}
					>
						<SelectTrigger className='w-24'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{[10, 20, 50].map(n => (
									<SelectItem key={n} value={String(n)}>
										{n}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
					<Button type='button' variant='outline' size='sm' onClick={() => void refetch()} disabled={isFetching}>
						<RefreshCwIcon className={cn('mr-1.5 size-4', isFetching && 'animate-spin')} aria-hidden /> Làm mới
					</Button>
				</div>
			</header>

			<Card className='gap-0 overflow-hidden p-0'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-10'>
								<div className='flex items-center justify-center'>
								</div>
							</TableHead>
							<TableHead className='w-35'>Mã đơn</TableHead>
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
							<TableRowsSkeleton rows={5} columns={9} />
						) : error ? (
							<TableErrorStateRow
								colSpan={9}
								message={error instanceof Error ? error.message : 'Không tải được dữ liệu'}
								onRetry={() => void refetch()}
							/>
						) : items.length === 0 ? (
							<TableRow>
								<TableCell colSpan={9} className='py-12 text-center'>
									<div className='flex flex-col items-center gap-2'>
										<ClockIcon className='size-6 text-muted-foreground' aria-hidden />
										<p className='text-sm text-muted-foreground'>
											Tuyệt vời — không còn đơn nào chờ xử lý.
										</p>
										<Button asChild type='button' variant='outline' size='sm' className='mt-2'>
											<Link to='/orders'>Xem tất cả đơn</Link>
										</Button>
									</div>
								</TableCell>
							</TableRow>
						) : (
							items.map(order => (
								<TableRow
									key={order.id}
									className='dashboard-row-enter cursor-pointer hover:bg-muted/50'
									onClick={() => openDetail(order.id)}
									role='button'
									tabIndex={0}
									onKeyDown={e => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											openDetail(order.id);
										}
									}}
								>
									<TableCell onClick={e => e.stopPropagation()}>
										<div className='flex items-center justify-center'>
											<GripVerticalIcon className='text-muted-foreground size-4' />
										</div>
									</TableCell>
									<TableCell className='font-medium'>{order.orderNumber}</TableCell>
									<TableCell>
										<div className='flex flex-col'>
											<span className='font-medium'>{order.customerName}</span>
											<span className='text-xs text-muted-foreground'>{order.customerPhone}</span>
										</div>
									</TableCell>
									<TableCell className='text-right font-medium'>{fmt(order.totalVnd)}</TableCell>
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
									<TableCell className='text-sm text-muted-foreground'>{fmtDate(order.createdAt)}</TableCell>
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
											<DropdownMenuContent align='end' className='w-44' onClick={e => e.stopPropagation()}>
												<DropdownMenuItem onClick={() => openDetail(order.id)}>
													<ArrowUpRight className='size-4' />
													Xử lý ngay
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Card>

			{totalPages > 1 ? (
				<div className='text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between'>
					<span>
						Hiển thị {total === 0 ? 0 : (page - 1) * pageSize + 1}–
						{Math.min(page * pageSize, total)} / {total}
					</span>
					<div className='flex items-center gap-2'>
						<Button
							type='button'
							variant='outline'
							size='icon'
							className='size-8'
							disabled={page <= 1}
							onClick={() => setPage(p => Math.max(1, p - 1))}
						>
							<ChevronLeftIcon className='size-4' />
						</Button>
						<span>
							Trang {page} / {totalPages}
						</span>
						<Button
							type='button'
							variant='outline'
							size='icon'
							className='size-8'
							disabled={page >= totalPages}
							onClick={() => setPage(p => Math.min(totalPages, p + 1))}
						>
							<ChevronRightIcon className='size-4' />
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
}
