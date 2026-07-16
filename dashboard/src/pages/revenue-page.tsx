'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon, RefreshCwIcon, TrendingUpIcon } from 'lucide-react';
import { getDashboardOverview, type DashboardRange } from '@/api/admin-dashboard';
import { getAnalytics, type AnalyticsResponse } from '@/api/admin-analytics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	formatNumber,
	formatVnd,
	formatVndCompact,
	formatPercent,
	formatBucketLabel,
	formatTooltipLabel,
	formatDateRange,
} from '@/components/analytics/analytics-shared';
import { cn } from '@/lib/utils';

const RANGE_LABEL: Record<DashboardRange, string> = {
	'7d': '7 ngày',
	'30d': '30 ngày',
	'90d': '90 ngày',
	'12m': '12 tháng',
};
const RANGE_OPTS: DashboardRange[] = ['7d', '30d', '90d', '12m'];

export default function RevenuePage() {
	const [range, setRange] = React.useState<DashboardRange>('30d');
	const dq = useQuery({
		queryKey: ['dashboard-overview', range],
		queryFn: () => getDashboardOverview({ range }),
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

	return (
		<div className='space-y-6 rounded-2xl border border-border/60 bg-background p-4 sm:p-5 lg:p-6'>
			{/* Header */}
			<header className='flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-end sm:justify-between'>
				<div>
					<h1 className='text-lg font-semibold tracking-tight'>Doanh thu</h1>
					<p className='mt-0.5 text-xs text-muted-foreground'>
						{d?.meta ? formatDateRange(d.meta.fromDate, d.meta.toDate) : ''}
						{' · '}Phân tích doanh thu, chi tiêu, xu hướng
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<Tabs value={range} onValueChange={v => setRange(v as DashboardRange)}>
						<TabsList>
							{RANGE_OPTS.map(v => (
								<TabsTrigger key={v} value={v} className='px-3'>
									{RANGE_LABEL[v]}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
					<Button variant='outline' size='icon' onClick={() => { dq.refetch(); aq.refetch(); }} disabled={loading}>
						<RefreshCwIcon className={cn('size-4', loading && 'animate-spin')} />
					</Button>
				</div>
			</header>

			{err ? (
				<div className='flex flex-col items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
					<p className='text-sm font-medium text-destructive'>{err instanceof Error ? err.message : 'Lỗi tải dữ liệu'}</p>
					<Button variant='outline' onClick={() => { dq.refetch(); aq.refetch(); }}>
						<RefreshCwIcon className='mr-1.5 size-4' /> Thử lại
					</Button>
				</div>
			) : loading || !d || !a ? (
				<div className='space-y-4'>
					<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className='h-28 w-full rounded-xl' />
						))}
					</div>
					<Skeleton className='h-72 w-full rounded-xl' />
					<Skeleton className='h-56 w-full rounded-xl' />
				</div>
			) : (
				<>
					{/* 4 KPI tài chính */}
					<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
						<KpiCard
							label='Doanh thu thuần'
							value={formatVnd(d.kpis.revenue.current)}
							kpi={d.kpis.revenue}
						/>
						<KpiCard
							label='Đơn hàng'
							value={formatNumber(d.kpis.orders.current)}
							kpi={d.kpis.orders}
						/>
						<KpiCard
							label='Giá trị đơn TB'
							value={formatVnd(d.kpis.averageOrderValue.current)}
							kpi={d.kpis.averageOrderValue}
						/>
						<KpiCard
							label='Khách mới'
							value={formatNumber(d.kpis.newCustomers.current)}
							kpi={d.kpis.newCustomers}
						/>
					</div>

					{/* Biểu đồ doanh thu — full width */}
					<RevenueChart data={a} />

					{/* 2 cột: Payment health + Top sản phẩm */}
					<div className='grid gap-4 xl:grid-cols-2'>
						<PaymentHealthCard data={a} />
						<TopRevenueProducts data={a.topProducts} />
					</div>
				</>
			)}
		</div>
	);
}

function KpiCard({ label, value, kpi }: { label: string; value: string; kpi: { current: number; previous: number; changePct?: number; trend: string } }) {
	const TrendIcon = kpi.trend === 'up' ? ArrowUpRightIcon : kpi.trend === 'down' ? ArrowDownRightIcon : MinusIcon;
	const variant = kpi.trend === 'up' ? 'success' : kpi.trend === 'down' ? 'destructive' : 'muted';
	const trendLabel = kpi.changePct == null ? (kpi.trend === 'up' ? 'Mới' : 'Kỳ đầu') : `${kpi.changePct > 0 ? '+' : ''}${kpi.changePct}%`;
	return (
		<Card>
			<div className='px-4 pt-4'>
				<p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>{label}</p>
				<p className='mt-1 text-2xl font-semibold tabular-nums'>{value}</p>
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

const RC: ChartConfig = {
	netRevenue: { label: 'Doanh thu thuần', color: 'hsl(243 75% 59%)' },
	grossRevenue: { label: 'Doanh thu gộp', color: 'hsl(199 89% 48%)' },
};

function RevenueChart({ data }: { data: AnalyticsResponse }) {
	const [m, setM] = React.useState<'netRevenue' | 'grossRevenue'>('netRevenue');
	const g = data.meta.granularity;
	const total = data.trend.reduce((s, p) => s + p[m], 0);
	const empty = data.trend.reduce((p, c) => Math.max(p, c[m]), 0) === 0;
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
				<div className='flex items-center gap-1 rounded-lg bg-muted/50 p-0.5'>
					{([
						{ key: 'netRevenue' as const, label: 'Thuần' },
						{ key: 'grossRevenue' as const, label: 'Gộp' },
					] as const).map(({ key, label }) => (
						<button
							key={key}
							type='button'
							onClick={() => setM(key)}
							className={cn(
								'rounded-md px-3 py-1 text-xs transition-colors',
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
					<div className='flex h-64 items-center justify-center rounded-md border border-dashed bg-muted/20'>
						<TrendingUpIcon className='size-5 text-muted-foreground' />
						<p className='ml-2 text-sm text-muted-foreground'>Chưa có dữ liệu</p>
					</div>
				) : (
					<ChartContainer config={RC} className='h-64 w-full'>
						<AreaChart data={data.trend} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
							<defs>
								<linearGradient id='rg' x1='0' x2='0' y1='0' y2='1'>
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
							<Area dataKey={m} type='monotone' stroke={`var(--color-${m})`} strokeWidth={2} fill='url(#rg)' activeDot={{ r: 4 }} />
						</AreaChart>
					</ChartContainer>
				)}
			</div>
		</Card>
	);
}

function PaymentHealthCard({ data }: { data: AnalyticsResponse }) {
	return (
		<Card className='gap-0 py-0'>
			<div className='border-b border-border/60 px-4 py-3'>
				<p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Sức khỏe thanh toán</p>
			</div>
			<div className='space-y-4 p-4'>
				<MiniBar label='Giao thành công' value={formatPercent(data.paymentHealth.fulfillmentRate)} pct={data.paymentHealth.fulfillmentRate} color='bg-emerald-500' />
				<MiniBar label='Bị hủy' value={formatPercent(data.paymentHealth.cancellationRate)} pct={data.paymentHealth.cancellationRate} color='bg-rose-500' />
				<MiniBar label='Hoàn tiền' value={formatPercent(data.paymentHealth.refundRate)} pct={data.paymentHealth.refundRate} color='bg-amber-500' />
				<div className='flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm'>
					<span className='text-muted-foreground'>Chờ thanh toán</span>
					<span className='font-semibold tabular-nums'>{formatNumber(data.paymentHealth.pendingPaymentOrders)}</span>
				</div>
			</div>
		</Card>
	);
}

function MiniBar({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
	return (
		<div>
			<div className='mb-0.5 flex items-center justify-between text-sm'>
				<span className='text-muted-foreground'>{label}</span>
				<span className='font-semibold tabular-nums'>{value}</span>
			</div>
			<div className='h-2 overflow-hidden rounded-full bg-muted/60'>
				<div className={cn('h-full rounded-full', color)} style={{ width: Math.min(Math.max(pct, 0), 100) + '%' }} />
			</div>
		</div>
	);
}

function TopRevenueProducts({ top }: { top: AnalyticsResponse['topProducts'] }) {
	return (
		<Card className='flex h-full flex-col gap-0 py-0'>
			<div className='border-b border-border/60 px-4 py-3'>
				<p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Sản phẩm mang lại doanh thu cao nhất</p>
			</div>
			<div className='flex-1 divide-y divide-border/60 overflow-y-auto'>
				{!top?.length ? (
					<div className='p-6 text-center text-sm text-muted-foreground'>Chưa có dữ liệu</div>
				) : (
					top.slice(0, 5).map((p, i) => (
						<div key={p.productId} className='flex items-center gap-3 px-4 py-3'>
							<div className='flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/50 ring-1 ring-foreground/10'>
								{p.image ? (
									<img src={p.image} alt={p.name} className='size-full object-cover' loading='lazy' />
								) : (
									<span className='text-xs font-bold text-muted-foreground'>#{i + 1}</span>
								)}
							</div>
							<div className='min-w-0 flex-1'>
								<p className='truncate text-sm font-medium'>{p.name}</p>
								<p className='text-xs text-muted-foreground'>{formatNumber(p.soldQuantity)} đã bán</p>
							</div>
							<div className='shrink-0 text-right'>
								<p className='text-sm font-semibold tabular-nums'>{formatVndCompact(p.revenueVnd)}</p>
								<div className='mt-0.5 h-1 w-16 overflow-hidden rounded-full bg-muted/60 ml-auto'>
									<div
										className='h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500'
										style={{ width: Math.max(p.revenueShare, 2) + '%' }}
									/>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</Card>
	);
}
