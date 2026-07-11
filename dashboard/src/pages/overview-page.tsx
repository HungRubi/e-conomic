'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
	ActivityIcon,
	ArrowDownRightIcon,
	ArrowUpRightIcon,
	BoxIcon,
	ChevronRightIcon,
	CircleDollarSignIcon,
	FileTextIcon,
	LayersIcon,
	MegaphoneIcon,
	MinusIcon,
	PackageIcon,
	RefreshCwIcon,
	ShoppingBagIcon,
	TrendingUpIcon,
	UsersIcon,
} from 'lucide-react';
import {
	getDashboardOverview,
	type DashboardKpi,
	type DashboardOverviewResponse,
	type DashboardRange,
} from '@/api/admin-dashboard';
import { getAnalytics, type AnalyticsResponse } from '@/api/admin-analytics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ORDER_STATUS_BADGE } from '@/lib/status-styles';
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from '@/components/orders/order-status-helpers';
import {
	formatNumber,
	formatVnd,
	formatVndCompact,
	formatPercent,
	formatBucketLabel,
	formatTooltipLabel,
	formatHourLabel,
	formatDateRange,
} from '@/components/analytics/analytics-shared';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RANGE_LABEL: Record<DashboardRange, string> = {
	'7d': '7 ngày',
	'30d': '30 ngày',
	'90d': '90 ngày',
	'12m': '12 tháng',
};
const RANGE_OPTS: DashboardRange[] = ['7d', '30d', '90d', '12m'];
const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function OverviewPage() {
	const [range, setRange] = React.useState<DashboardRange>('30d');
	const dq = useQuery({
		queryKey: ['dashboard-overview', range],
		queryFn: () => getDashboardOverview({ range, recentLimit: 5, topProductsLimit: 5 }),
		staleTime: 60_000,
	});
	const aq = useQuery({
		queryKey: ['admin-analytics', range],
		queryFn: () => getAnalytics(range),
		staleTime: 60_000,
	});
	const loading = dq.isLoading || aq.isLoading;
	const err = dq.error || aq.error;
	const d = dq.data;
	const a = aq.data;
	const ref = () => {
		dq.refetch();
		aq.refetch();
	};

	return (
		<div className='space-y-6 rounded-2xl border border-border/60 bg-background p-4 sm:p-5 lg:p-6'>
			<Header range={range} onChange={setRange} loading={loading} meta={d?.meta} onRefresh={ref} />
			{err ? (
				<Err msg={err instanceof Error ? err.message : 'Lỗi'} onRetry={ref} />
			) : loading || !d || !a ? (
				<Skel />
			) : (
				<>
					{/* 4 KPI */}
					<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
						<KpiCard
							icon={CircleDollarSignIcon}
							label='Doanh thu'
							value={formatVnd(d.kpis.revenue.current)}
							kpi={d.kpis.revenue}
						/>
						<KpiCard
							icon={ShoppingBagIcon}
							label='Đơn hàng'
							value={formatNumber(d.kpis.orders.current)}
							kpi={d.kpis.orders}
						/>
						<KpiCard
							icon={UsersIcon}
							label='Khách mới'
							value={formatNumber(d.kpis.newCustomers.current)}
							kpi={d.kpis.newCustomers}
						/>
						<KpiCard
							icon={ActivityIcon}
							label='Giá trị đơn TB'
							value={formatVnd(d.kpis.averageOrderValue.current)}
							kpi={d.kpis.averageOrderValue}
						/>
					</div>

					{/* Xu hướng doanh thu — full width */}
					<RevenueChart data={a} />

					{/* Đơn hàng & thanh toán — full width */}
					<OrderAndPayment d={d} a={a} />

					{/* 2 cột: Đơn mới + Sản phẩm bán chạy */}
					<div className='grid gap-4 xl:grid-cols-2'>
						<RecentOrders data={d} />
						<TopProducts top={a.topProducts} />
					</div>

					{/* 2 cột: Bar chart + Tài sản */}
					<div className='grid gap-4 xl:grid-cols-2'>
						<HourlyBarChart data={a.hourlyPattern} />
						<CatalogSummary data={d} />
					</div>
				</>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function Header({
	range,
	onChange,
	loading,
	meta,
	onRefresh,
}: {
	range: DashboardRange;
	onChange: (r: DashboardRange) => void;
	loading: boolean;
	meta?: DashboardOverviewResponse['meta'];
	onRefresh: () => void;
}) {
	const l = meta ? formatDateRange(meta.fromDate, meta.toDate) : null;
	return (
		<header className='flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-end sm:justify-between'>
			<div>
				<div className='flex items-center gap-2'>
					<h1 className='text-lg font-semibold tracking-tight'>Tổng quan</h1>
				</div>
				<p className='mt-0.5 text-xs text-muted-foreground'>
					{l ? `${l} · ` : ''}Doanh thu, đơn hàng, khách hàng
				</p>
			</div>
			<div className='flex items-center gap-2'>
				<Tabs value={range} onValueChange={v => onChange(v as DashboardRange)}>
					<TabsList>
						{RANGE_OPTS.map(v => (
							<TabsTrigger key={v} value={v} className='px-3'>
								{RANGE_LABEL[v]}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
				<Button variant='outline' size='icon' onClick={onRefresh} disabled={loading}>
					<RefreshCwIcon className={cn('size-4', loading && 'animate-spin')} />
				</Button>
			</div>
		</header>
	);
}

// ---------------------------------------------------------------------------
// KPI
// ---------------------------------------------------------------------------

function KpiCard({
	icon: I,
	label,
	value,
	kpi,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: string;
	kpi: DashboardKpi;
}) {
	const TrendIcon = kpi.trend === 'up' ? ArrowUpRightIcon : kpi.trend === 'down' ? ArrowDownRightIcon : MinusIcon;
	const variant = kpi.trend === 'up' ? 'success' : kpi.trend === 'down' ? 'destructive' : 'muted';
	const trendLabel =
		kpi.changePct == null
			? kpi.trend === 'up'
				? 'Mới'
				: 'Kỳ đầu'
			: `${kpi.changePct > 0 ? '+' : ''}${kpi.changePct}%`;
	return (
		<Card>
			<div className='flex items-start justify-between gap-2 px-4 pt-4'>
				<div>
					<p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>{label}</p>
					<p className='mt-1 text-2xl font-semibold tabular-nums'>{value}</p>
				</div>
				<I className='size-4 text-muted-foreground' />
			</div>
			<div className='flex items-center gap-2 px-4 pb-4 pt-2'>
				<Badge variant={variant}>
					<TrendIcon className='size-3' />
					{trendLabel}
				</Badge>
			</div>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Error / Loading
// ---------------------------------------------------------------------------

function Err({ msg, onRetry }: { msg: string; onRetry: () => void }) {
	return (
		<div className='flex flex-col items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
			<p className='text-sm font-medium text-destructive'>{msg}</p>
			<Button variant='outline' onClick={onRetry}>
				<RefreshCwIcon className='mr-1.5 size-4' /> Thử lại
			</Button>
		</div>
	);
}

function Skel() {
	return (
		<div className='space-y-4'>
			<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className='h-28 w-full rounded-xl' />
				))}
			</div>
			<Skeleton className='h-72 w-full rounded-xl' />
			<Skeleton className='h-56 w-full rounded-xl' />
			<div className='grid gap-4 xl:grid-cols-2'>
				<Skeleton className='h-64 w-full rounded-xl' />
				<Skeleton className='h-64 w-full rounded-xl' />
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Chart 1: Area — Xu hướng doanh thu
// ---------------------------------------------------------------------------

const RC: ChartConfig = {
	netRevenue: { label: 'Doanh thu thuần', color: 'hsl(243 75% 59%)' },
	grossRevenue: { label: 'Doanh thu gộp', color: 'hsl(199 89% 48%)' },
};

function RevenueChart({ data }: { data: AnalyticsResponse }) {
	const [m, setM] = React.useState<'netRevenue' | 'grossRevenue'>('netRevenue');
	const g = data.meta.granularity;
	const trend = data.trend;
	const total = React.useMemo(() => trend.reduce((s, p) => s + p[m], 0), [trend, m]);
	const empty = React.useMemo(() => trend.reduce((p, c) => Math.max(p, c[m]), 0) === 0, [trend, m]);
	return (
		<Card className='gap-0 py-0'>
			<div className='flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3'>
				<div>
					<p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
						Xu hướng doanh thu
					</p>
					<p className='text-sm text-muted-foreground'>
						Tổng: <strong className='tabular-nums text-foreground'>{formatVnd(total)}</strong>
					</p>
				</div>
				<div className='flex items-center gap-1 bg-muted/50 rounded-lg p-0.5'>
					{[
						{ key: 'netRevenue' as const, label: 'Thuần' },
						{ key: 'grossRevenue' as const, label: 'Gộp' },
					].map(({ key, label }) => (
						<button
							key={key}
							type='button'
							onClick={() => setM(key)}
							className={cn(
								'px-3 py-1 text-xs rounded-md transition-colors',
								m === key
									? 'bg-background text-foreground font-semibold shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							)}
						>
							{label}
						</button>
					))}
				</div>
			</div>
			<div className='p-4'>
				{empty ? (
					<div className='h-64 flex items-center justify-center rounded-md border border-dashed bg-muted/20'>
						<TrendingUpIcon className='size-5 text-muted-foreground' />
						<p className='ml-2 text-sm text-muted-foreground'>Chưa có dữ liệu</p>
					</div>
				) : (
					<ChartContainer config={RC} className='h-64 w-full'>
						<AreaChart data={trend} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
							<defs>
								<linearGradient id='rf' x1='0' x2='0' y1='0' y2='1'>
									<stop offset='5%' stopColor={`var(--color-${m})`} stopOpacity={0.5} />
									<stop offset='95%' stopColor={`var(--color-${m})`} stopOpacity={0.05} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray='3 3' vertical={false} />
							<XAxis
								dataKey='bucket'
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								minTickGap={32}
								tickFormatter={(v: string) => formatBucketLabel(v, g)}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								width={56}
								tickFormatter={(v: number) => formatVndCompact(v)}
							/>
							<ChartTooltip
								cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
								content={
									<ChartTooltipContent
										labelFormatter={l => formatTooltipLabel(String(l), g)}
										formatter={(v: unknown) => formatVnd(Number(v ?? 0))}
									/>
								}
							/>
							<Area
								dataKey={m}
								type='monotone'
								stroke={`var(--color-${m})`}
								strokeWidth={2}
								fill='url(#rf)'
								activeDot={{ r: 4 }}
							/>
						</AreaChart>
					</ChartContainer>
				)}
			</div>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Đơn hàng & thanh toán
// ---------------------------------------------------------------------------

function OrderAndPayment({ d, a }: { d: DashboardOverviewResponse; a: AnalyticsResponse }) {
	const payTotal = d.paymentMethodBreakdown.reduce((s, x) => s + x.count, 0);
	return (
		<Card className='gap-0 py-0'>
			<div className='border-b border-border/60 px-4 py-3'>
				<p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
					Đơn hàng & thanh toán
				</p>
			</div>
			<div className='grid gap-6 p-4 sm:grid-cols-3'>
				<div>
					<p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-3'>
						Trạng thái đơn
					</p>
					<div className='space-y-2.5'>
						{STATUSES.map(s => {
							const b = d.statusBreakdown.find(x => x.status === s);
							if (!b || b.count === 0) return null;
							const dot = {
								PENDING: 'bg-amber-500',
								CONFIRMED: 'bg-sky-500',
								PROCESSING: 'bg-indigo-500',
								SHIPPED: 'bg-violet-500',
								DELIVERED: 'bg-emerald-500',
								CANCELLED: 'bg-rose-500',
								REFUNDED: 'bg-slate-400',
							}[s];
							return (
								<div key={s}>
									<div className='flex items-center justify-between text-xs'>
										<span className='inline-flex items-center gap-1.5'>
											<span className={cn('size-1.5 rounded-full', dot)} />
											<span className='font-medium'>
												{ORDER_STATUS_LABEL[s as keyof typeof ORDER_STATUS_LABEL] ?? s}
											</span>
										</span>
										<span className='tabular-nums text-muted-foreground'>
											{formatNumber(b.count)} ({b.percentage}%)
										</span>
									</div>
									<div className='mt-0.5 h-1 overflow-hidden rounded-full bg-muted/60'>
										<div
											className={cn('h-full rounded-full', dot)}
											style={{ width: Math.max(b.percentage, 2) + '%' }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</div>
				<div>
					<p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-3'>
						Phương thức thanh toán
					</p>
					<div className='space-y-2'>
						{d.paymentMethodBreakdown.map(b => {
							const pct = payTotal > 0 ? Math.round((b.count / payTotal) * 100) : 0;
							return (
								<div key={b.status}>
									<div className='flex items-center justify-between text-xs mb-0.5'>
										<span className='text-muted-foreground'>
											{b.status === 'BANKING' ? 'Chuyển khoản' : 'COD'}
										</span>
										<span className='font-semibold tabular-nums'>{pct}%</span>
									</div>
									<div className='h-1 overflow-hidden rounded-full bg-muted/60'>
										<div
											className={cn(
												'h-full rounded-full',
												b.status === 'BANKING' ? 'bg-emerald-500' : 'bg-sky-500'
											)}
											style={{ width: Math.max(pct, 2) + '%' }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</div>
				<div>
					<p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-3'>
						Sức khỏe đơn hàng
					</p>
					<div className='space-y-3'>
						<MiniBar
							label='Giao thành công'
							value={formatPercent(a.paymentHealth.fulfillmentRate)}
							pct={a.paymentHealth.fulfillmentRate}
							color='bg-emerald-500'
						/>
						<MiniBar
							label='Bị hủy'
							value={formatPercent(a.paymentHealth.cancellationRate)}
							pct={a.paymentHealth.cancellationRate}
							color='bg-rose-500'
						/>
						<MiniBar
							label='Hoàn tiền'
							value={formatPercent(a.paymentHealth.refundRate)}
							pct={a.paymentHealth.refundRate}
							color='bg-amber-500'
						/>
						<div className='flex items-center justify-between rounded border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs'>
							<span className='text-muted-foreground'>Chờ thanh toán</span>
							<span className='font-semibold tabular-nums'>
								{formatNumber(a.paymentHealth.pendingPaymentOrders)}
							</span>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}

function MiniBar({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
	return (
		<div>
			<div className='flex items-center justify-between text-xs mb-0.5'>
				<span className='text-muted-foreground'>{label}</span>
				<span className='font-semibold tabular-nums'>{value}</span>
			</div>
			<div className='h-1 overflow-hidden rounded-full bg-muted/60'>
				<div
					className={cn('h-full rounded-full', color)}
					style={{ width: Math.min(Math.max(pct, 0), 100) + '%' }}
				/>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Đơn mới nhất
// ---------------------------------------------------------------------------

function RecentOrders({ data }: { data: DashboardOverviewResponse }) {
	return (
		<Card className='flex h-full flex-col gap-0 py-0'>
			<div className='flex items-center justify-between border-b border-border/60 px-4 py-3'>
				<p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Đơn mới nhất</p>
				<Button asChild variant='outline' size='sm' className='h-7 text-xs'>
					<Link to='/orders'>
						Tất cả <ChevronRightIcon className='ml-1 size-3.5' />
					</Link>
				</Button>
			</div>
			<div className='flex-1 overflow-y-auto scrollbar-thin divide-y divide-border/60'>
				{data.recentOrders.length === 0 ? (
					<div className='flex flex-col items-center gap-2 py-8 text-center'>
						<ShoppingBagIcon className='size-5 text-muted-foreground' />
						<p className='text-xs text-muted-foreground'>Chưa có đơn</p>
					</div>
				) : (
					data.recentOrders.map(o => (
						<Link
							key={o.id}
							to={'/orders/' + o.id}
							className='flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors'
						>
							<div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 ring-1 ring-foreground/10'>
								<ShoppingBagIcon className='size-3.5 text-muted-foreground' />
							</div>
							<div className='min-w-0 flex-1'>
								<div className='flex items-center gap-2'>
									<p className='truncate text-xs font-semibold'>{o.orderNumber}</p>
									<Badge
										variant={ORDER_STATUS_BADGE[o.status]}
										className='shrink-0 text-[9px] h-4 px-1'
									>
										{ORDER_STATUS_LABEL[o.status]}
									</Badge>
								</div>
								<p className='text-[10px] text-muted-foreground truncate'>
									<span className='font-medium'>{o.customerName}</span>
									<span className='mx-1'>·</span>
									{o.itemsSummary}
								</p>
							</div>
							<div className='shrink-0 text-right'>
								<p className='text-xs font-semibold tabular-nums'>{formatVnd(o.totalVnd)}</p>
								<p className='text-[9px] text-muted-foreground'>
									{PAYMENT_STATUS_LABEL[o.paymentStatus]}
								</p>
							</div>
						</Link>
					))
				)}
			</div>
		</Card>
	);
}

function TopProducts({ top }: { top: AnalyticsResponse['topProducts'] }) {
	return (
		<Card className='flex h-full flex-col gap-0 py-0'>
			<div className='flex items-center justify-between border-b border-border/60 px-4 py-3'>
				<p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Sản phẩm bán chạy</p>
				<Button asChild variant='ghost' size='sm' className='h-7 text-xs'>
					<Link to='/products'>
						<PackageIcon className='mr-1 size-3.5' /> Xem
					</Link>
				</Button>
			</div>
			<div className='flex-1 overflow-y-auto scrollbar-thin divide-y divide-border/60'>
				{top.length === 0 ? (
					<div className='p-4 text-xs text-muted-foreground'>Chưa có</div>
				) : (
					top.slice(0, 5).map((p, i) => (
						<Link
							key={p.productId}
							to={'/products/' + p.productId}
							className='flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors'
						>
							<div className='flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/50 ring-1 ring-foreground/10'>
								{p.image ? (
									<img src={p.image} alt={p.name} className='size-full object-cover' loading='lazy' />
								) : (
									<BoxIcon className='size-3.5 text-muted-foreground' />
								)}
							</div>
							<div className='min-w-0 flex-1'>
								<p className='truncate text-xs font-medium'>
									<span className='text-muted-foreground'>#{i + 1}</span> {p.name}
								</p>
								<div className='mt-1 h-1 overflow-hidden rounded-full bg-muted/60'>
									<div
										className='h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500'
										style={{ width: Math.max(p.revenueShare, 4) + '%' }}
									/>
								</div>
								<p className='text-[10px] text-muted-foreground mt-0.5'>
									{formatNumber(p.soldQuantity)} đã bán
								</p>
							</div>
							<div className='shrink-0 text-right'>
								<p className='text-xs font-semibold tabular-nums'>{formatVndCompact(p.revenueVnd)}</p>
							</div>
						</Link>
					))
				)}
			</div>
		</Card>
	);
}
// Chart 2: Bar — Đơn theo giờ
// ---------------------------------------------------------------------------

const HC: ChartConfig = { orders: { label: 'Đơn hàng', color: 'hsl(243 75% 59%)' } };

function HourlyBarChart({ data }: { data: AnalyticsResponse['hourlyPattern'] }) {
	const has = data.some(h => h.orders > 0);
	return (
		<Card className='gap-0 py-0'>
			<div className='border-b border-border/60 px-4 py-3'>
				<p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Đơn hàng theo giờ</p>
			</div>
			<div className='p-4'>
				{has ? (
					<ChartContainer config={HC} className='h-52 w-full'>
						<BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
							<CartesianGrid strokeDasharray='3 3' vertical={false} />
							<XAxis
								dataKey='hour'
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								interval={2}
								tickFormatter={(v: number) => formatHourLabel(v)}
							/>
							<YAxis tickLine={false} axisLine={false} tickMargin={8} width={28} allowDecimals={false} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<Bar dataKey='orders' fill='var(--color-orders)' radius={[4, 4, 0, 0]} />
						</BarChart>
					</ChartContainer>
				) : (
					<div className='flex h-52 items-center justify-center'>
						<p className='text-xs text-muted-foreground'>Chưa có dữ liệu</p>
					</div>
				)}
			</div>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Tài sản nội dung
// ---------------------------------------------------------------------------

function CatalogSummary({ data }: { data: DashboardOverviewResponse }) {
	const c = data.catalog;
	const tiles = [
		{
			icon: PackageIcon,
			label: 'Sản phẩm',
			value: c.totalProducts,
			hint: `${c.activeProducts} đang bán`,
			to: '/products',
		},
		{
			icon: LayersIcon,
			label: 'Danh mục',
			value: c.totalCategories,
			hint: 'Phân nhóm',
			to: '/products/categories',
		},
		{
			icon: FileTextIcon,
			label: 'Bài viết',
			value: c.totalArticles,
			hint: `${c.publishedArticles} đã xuất bản`,
			to: '/content/articles',
		},
		{ icon: MegaphoneIcon, label: 'Khuyến mãi', value: c.activePromotions, hint: 'Đang chạy', to: '/promotions' },
	];
	return (
		<Card className='gap-0 py-0'>
			<div className='border-b border-border/60 px-4 py-3'>
				<p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Tài sản nội dung</p>
			</div>
			<div className='grid grid-cols-2 gap-3 p-4'>
				{' '}
				{tiles.map(t => (
					<Link
						key={t.label}
						to={t.to}
						className='rounded-lg bg-muted/30 p-3 hover:bg-muted/50 transition-colors'
					>
						<t.icon className='size-5 text-muted-foreground mb-1.5' />
						<p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
							{t.label}
						</p>
						<p className='text-xl font-semibold tabular-nums'>{formatNumber(t.value)}</p>
						<p className='text-[10px] text-muted-foreground'>{t.hint}</p>
					</Link>
				))}
			</div>
		</Card>
	);
}
