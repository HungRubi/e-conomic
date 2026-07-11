import type { AnalyticsKpi, AnalyticsRange } from '@/api/admin-analytics';

export const ANALYTICS_RANGE_OPTIONS: AnalyticsRange[] = ['7d', '30d', '90d', '12m'];

export const ANALYTICS_RANGE_LABEL: Record<AnalyticsRange, string> = {
	'7d': '7 ngày',
	'30d': '30 ngày',
	'90d': '90 ngày',
	'12m': '12 tháng',
};

export const ANALYTICS_RANGE_HINT: Record<AnalyticsRange, string> = {
	'7d': 'Tuần gần nhất',
	'30d': 'Tháng vừa qua',
	'90d': 'Quý gần nhất',
	'12m': 'Năm gần nhất',
};

const VND_FORMATTER = new Intl.NumberFormat('vi-VN', {
	style: 'currency',
	currency: 'VND',
	maximumFractionDigits: 0,
});

const NUMBER_FORMATTER = new Intl.NumberFormat('vi-VN');

export function formatVnd(value: number): string {
	return VND_FORMATTER.format(value);
}

export function formatNumber(value: number): string {
	return NUMBER_FORMATTER.format(value);
}

export function formatPercent(value: number, fractionDigits = 1): string {
	return `${value.toFixed(fractionDigits)}%`;
}

export function formatVndCompact(value: number): string {
	if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
	if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
	return `${value.toLocaleString('vi-VN')}đ`;
}

export function formatBucketLabel(bucket: string, granularity: 'day' | 'month'): string {
	if (granularity === 'month') {
		const [yearStr, monthStr] = bucket.split('-');
		return `T${parseInt(monthStr, 10)}/${yearStr.slice(2)}`;
	}
	const date = new Date(`${bucket}T00:00:00Z`);
	return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
}

export function formatTooltipLabel(bucket: string, granularity: 'day' | 'month'): string {
	if (granularity === 'month') {
		const [yearStr, monthStr] = bucket.split('-');
		return `Tháng ${parseInt(monthStr, 10)} / ${yearStr}`;
	}
	const date = new Date(`${bucket}T00:00:00Z`);
	return new Intl.DateTimeFormat('vi-VN', {
		weekday: 'short',
		day: '2-digit',
		month: '2-digit',
	}).format(date);
}

export function formatHourLabel(hour: number): string {
	return `${String(hour).padStart(2, '0')}:00`;
}

export function formatDateRange(fromIso: string, toIso: string): string {
	const fmt = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
	return `${fmt.format(new Date(fromIso))} → ${fmt.format(new Date(toIso))}`;
}

export type KpiTone = 'indigo' | 'emerald' | 'sky' | 'amber' | 'rose' | 'violet';

export const KPI_TONE_CLASSES: Record<KpiTone, { tile: string; icon: string; text: string }> = {
	indigo: {
		tile: 'bg-indigo-500/12 ring-indigo-500/20 dark:bg-indigo-500/15',
		icon: 'text-indigo-600 dark:text-indigo-400',
		text: 'text-indigo-600 dark:text-indigo-400',
	},
	emerald: {
		tile: 'bg-emerald-500/12 ring-emerald-500/20 dark:bg-emerald-500/15',
		icon: 'text-emerald-600 dark:text-emerald-400',
		text: 'text-emerald-600 dark:text-emerald-400',
	},
	sky: {
		tile: 'bg-sky-500/12 ring-sky-500/20 dark:bg-sky-500/15',
		icon: 'text-sky-600 dark:text-sky-400',
		text: 'text-sky-600 dark:text-sky-400',
	},
	amber: {
		tile: 'bg-amber-500/12 ring-amber-500/20 dark:bg-amber-500/15',
		icon: 'text-amber-600 dark:text-amber-400',
		text: 'text-amber-600 dark:text-amber-400',
	},
	rose: {
		tile: 'bg-rose-500/12 ring-rose-500/20 dark:bg-rose-500/15',
		icon: 'text-rose-600 dark:text-rose-400',
		text: 'text-rose-600 dark:text-rose-400',
	},
	violet: {
		tile: 'bg-violet-500/12 ring-violet-500/20 dark:bg-violet-500/15',
		icon: 'text-violet-600 dark:text-violet-400',
		text: 'text-violet-600 dark:text-violet-400',
	},
};

/** "Tốt khi tăng" hay "tốt khi giảm" — quyết định màu của trend badge. */
export type KpiDirection = 'up-good' | 'down-good';

export function trendVariant(
	kpi: AnalyticsKpi,
	direction: KpiDirection = 'up-good'
): 'success' | 'destructive' | 'muted' {
	if (kpi.trend === 'flat') return 'muted';
	if (direction === 'up-good') {
		return kpi.trend === 'up' ? 'success' : 'destructive';
	}
	return kpi.trend === 'down' ? 'success' : 'destructive';
}

export function trendLabel(kpi: AnalyticsKpi): string {
	if (kpi.changePct === null) {
		return kpi.trend === 'up' ? 'Mới phát sinh' : 'Chưa có kỳ trước';
	}
	const sign = kpi.changePct > 0 ? '+' : '';
	return `${sign}${kpi.changePct}%`;
}
