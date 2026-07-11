import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BellIcon } from 'lucide-react';

import {
	CONTACT_INQUIRY_SOURCE_LABEL,
	fetchContactInquiries,
	fetchContactInquirySummary,
	type AdminContactInquiryRow,
} from '@/api/admin-contact-inquiries';
import { listOrders, type OrderRow } from '@/api/admin-orders';
import { useAuth } from '@/auth/auth-context';
import { hasPermission } from '@/auth/permissions';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePendingOrders } from '@/providers/pending-orders-provider';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'miue_notifications_seen_v1';

type SeenMap = Record<string, string>;

type NotificationKind = 'pending' | 'failed' | 'contact';

type NotificationItem = {
	id: string;
	kind: NotificationKind;
	title: string;
	subtitle: string;
	to: string;
	createdAt: string;
	unseen: boolean;
};

const KIND_LABEL: Record<NotificationKind, string> = {
	pending: 'Đơn mới',
	failed: 'Thanh toán lỗi',
	contact: 'Tin nhắn',
};

function readSeen(): SeenMap {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as unknown;
		return parsed && typeof parsed === 'object' ? (parsed as SeenMap) : {};
	} catch {
		return {};
	}
}

function writeSeen(map: SeenMap): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
	} catch {
		/* quota exceeded */
	}
}

function fmtCurrency(value: number): string {
	return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
		value
	);
}

function fmtRel(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime();
	const minutes = Math.round(diff / 60_000);
	if (minutes < 1) return 'vừa xong';
	if (minutes < 60) return `${minutes}p`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h`;
	const days = Math.round(hours / 24);
	if (days < 7) return `${days}d`;
	const weeks = Math.round(days / 7);
	return `${weeks}w`;
}

export function NotificationBell({ className }: { className?: string }) {
	const { user } = useAuth();
	const canSeeOrders = hasPermission(user?.role, 'orders.read');
	const canSeeContact = hasPermission(user?.role, 'content.read');

	const [seen, setSeen] = React.useState<SeenMap>(() => readSeen());

	const { items: pendingItems } = usePendingOrders();

	const failedQuery = useQuery({
		queryKey: ['notifications', 'failed-payments'],
		queryFn: () => listOrders({ paymentStatus: 'FAILED', limit: 10, page: 1, sortBy: 'createdAt', order: 'desc' }),
		refetchInterval: 60_000,
		enabled: canSeeOrders,
		staleTime: 30_000,
	});

	const contactQuery = useQuery({
		queryKey: ['contact-inquiries', 'notifications'],
		queryFn: () =>
			fetchContactInquiries({ status: 'NEW', limit: 8, offset: 0, sortBy: 'createdAt', sortOrder: 'desc' }),
		refetchInterval: 30_000,
		enabled: canSeeContact,
		staleTime: 15_000,
	});

	useQuery({
		queryKey: ['contact-inquiries-summary'],
		queryFn: fetchContactInquirySummary,
		refetchInterval: 30_000,
		enabled: canSeeContact,
	});

	const failedItems = failedQuery.data?.items ?? [];
	const contactItems = contactQuery.data?.items ?? [];

	const isUnseen = (id: string, kind: NotificationKind) => !seen[`${kind}:${id}`];

	const items = React.useMemo<NotificationItem[]>(() => {
		const merged: NotificationItem[] = [];
		if (canSeeOrders) {
			for (const o of pendingItems) merged.push(buildPendingItem(o, isUnseen(o.id, 'pending')));
			for (const o of failedItems) merged.push(buildFailedItem(o, isUnseen(o.id, 'failed')));
		}
		if (canSeeContact) {
			for (const c of contactItems) merged.push(buildContactItem(c, isUnseen(c.id, 'contact')));
		}
		return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pendingItems, failedItems, contactItems, canSeeOrders, canSeeContact, seen]);

	const unseenTotal = items.filter(item => item.unseen).length;
	const isLoading = (canSeeOrders && failedQuery.isLoading) || (canSeeContact && contactQuery.isLoading);

	if (!canSeeOrders && !canSeeContact) return null;

	function markAllSeen() {
		const next: SeenMap = { ...seen };
		const now = new Date().toISOString();
		for (const item of items) next[`${item.kind}:${item.id}`] = now;
		setSeen(next);
		writeSeen(next);
	}

	function markSeen(id: string, kind: NotificationKind) {
		const next: SeenMap = { ...seen, [`${kind}:${id}`]: new Date().toISOString() };
		setSeen(next);
		writeSeen(next);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type='button'
					variant='ghost'
					size='icon'
					className={cn('relative size-8', className)}
					aria-label={unseenTotal > 0 ? `${unseenTotal} thông báo chưa đọc` : 'Thông báo'}
				>
					<BellIcon className='size-4' />
					{unseenTotal > 0 ? (
						<span className='absolute right-1 top-1 size-1.5 rounded-full bg-destructive' />
					) : null}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' sideOffset={6} className='w-88 overflow-hidden p-0'>
				<header className='flex items-center justify-between gap-2 px-4 pb-2 pt-3'>
					<p className='text-sm font-medium tracking-tight'>Thông báo</p>
					<button
						type='button'
						onClick={markAllSeen}
						disabled={unseenTotal === 0}
						className='text-xs text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted-foreground'
					>
						đã đọc tất cả
					</button>
				</header>

				<NotificationFeed items={items} loading={isLoading} onMarkSeen={markSeen} />

				<footer className='border-t border-border/60'>
					<Link
						to='/orders/pending'
						className='block px-4 py-2.5 text-center text-xs font-medium text-muted-foreground transition hover:bg-muted/40 hover:text-foreground'
					>
						Xem tất cả đơn chờ xử lý
					</Link>
				</footer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function NotificationFeed({
	items,
	loading,
	onMarkSeen,
}: {
	items: NotificationItem[];
	loading: boolean;
	onMarkSeen: (id: string, kind: NotificationKind) => void;
}) {
	if (loading && items.length === 0) {
		return (
			<div className='space-y-3 px-4 py-3'>
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className='space-y-1.5'>
						<div className='h-3 w-3/4 animate-pulse rounded bg-muted' />
						<div className='h-2.5 w-1/2 animate-pulse rounded bg-muted' />
					</div>
				))}
			</div>
		);
	}
	if (items.length === 0) {
		return (
			<div className='px-4 py-10 text-center'>
				<p className='text-xs text-muted-foreground'>Không có thông báo mới</p>
			</div>
		);
	}

	return (
		<ul className='max-h-96 scrollbar-thin divide-y divide-border/40 overflow-y-auto'>
			{items.map(item => (
				<li key={`${item.kind}-${item.id}`}>
					<Link
						to={item.to}
						onClick={() => onMarkSeen(item.id, item.kind)}
						className='group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40'
					>
						<span
							className={cn(
								'mt-1.5 size-1.5 shrink-0 rounded-full',
								item.unseen ? 'bg-destructive' : 'bg-transparent'
							)}
							aria-hidden
						/>
						<div className='min-w-0 flex-1'>
							<div className='flex items-baseline justify-between gap-3'>
								<p
									className={cn(
										'truncate text-sm leading-tight',
										item.unseen ? 'font-medium text-foreground' : 'text-muted-foreground'
									)}
								>
									{item.title}
								</p>
								<span className='shrink-0 whitespace-nowrap text-[11px] tabular-nums text-muted-foreground'>
									{fmtRel(item.createdAt)}
								</span>
							</div>
							<p className='mt-0.5 truncate text-xs text-muted-foreground'>{item.subtitle}</p>
							<p className='mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70'>
								{KIND_LABEL[item.kind]}
							</p>
						</div>
					</Link>
				</li>
			))}
		</ul>
	);
}

function buildPendingItem(order: OrderRow, unseen: boolean): NotificationItem {
	return {
		id: order.id,
		kind: 'pending',
		title: `#${order.orderNumber}`,
		subtitle: `${order.customerName} · ${fmtCurrency(order.totalVnd)}`,
		to: `/orders/${order.id}`,
		createdAt: order.createdAt,
		unseen,
	};
}

function buildFailedItem(order: OrderRow, unseen: boolean): NotificationItem {
	return {
		id: order.id,
		kind: 'failed',
		title: `#${order.orderNumber}`,
		subtitle: `${order.customerName} · ${fmtCurrency(order.totalVnd)}`,
		to: `/orders/${order.id}`,
		createdAt: order.createdAt,
		unseen,
	};
}

function buildContactItem(item: AdminContactInquiryRow, unseen: boolean): NotificationItem {
	const sourceLabel = CONTACT_INQUIRY_SOURCE_LABEL[item.source] ?? item.source;
	const contact = item.email ?? item.phone ?? sourceLabel;
	return {
		id: item.id,
		kind: 'contact',
		title: item.name,
		subtitle: `${sourceLabel} · ${contact}`,
		to: '/content/contact-inquiries',
		createdAt: item.createdAt,
		unseen,
	};
}
