import { CheckIcon, CircleDashedIcon, CircleIcon, XIcon } from 'lucide-react';

import type { OrderStatus, OrderStatusHistory } from '@/api/admin-orders';
import { cn } from '@/lib/utils';

import { ORDER_PROGRESS_STEPS, ORDER_STATUS_LABEL, isOrderTerminal, progressIndex } from './order-status-helpers';

type OrderTimelineProps = {
	status: OrderStatus;
	history?: OrderStatusHistory[];
};

const TERMINAL_LABEL: Partial<Record<OrderStatus, string>> = {
	CANCELLED: 'Đơn đã được hủy',
	REFUNDED: 'Đơn đã hoàn tiền cho khách',
};

function formatDateTime(iso: string): string {
	return new Intl.DateTimeFormat('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(iso));
}

export function OrderTimeline({ status, history }: OrderTimelineProps) {
	const sortedHistory = [...(history ?? [])].sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
	);

	const stepEvents = new Map<OrderStatus, OrderStatusHistory>();
	for (const event of sortedHistory) {
		stepEvents.set(event.toStatus, event);
	}

	const currentIndex = progressIndex(status);
	const terminal = isOrderTerminal(status);

	return (
		<ol className='space-y-2.5'>
			{ORDER_PROGRESS_STEPS.map((step, idx) => {
				const event = stepEvents.get(step);
				const isPast = currentIndex > idx && !terminal;
				const isCurrent = currentIndex === idx && !terminal;
				const reached = isPast || isCurrent;
				const isLast = idx === ORDER_PROGRESS_STEPS.length - 1;

				return (
					<li key={step} className='relative flex items-start gap-2.5'>
						<div className='flex flex-col items-center'>
							<span
								className={cn(
									'flex size-5 shrink-0 items-center justify-center rounded-full text-[0]',
									isPast && 'bg-emerald-500 text-white',
									isCurrent &&
										'bg-foreground text-background ring-2 ring-foreground/15 ring-offset-2 ring-offset-background',
									!reached && 'border border-border bg-background'
								)}
								aria-hidden
							>
								{isPast ? (
									<CheckIcon className='size-3' strokeWidth={3} />
								) : isCurrent ? (
									<CircleDashedIcon className='size-3' />
								) : (
									<CircleIcon className='size-1.5 fill-muted-foreground/40 stroke-none' />
								)}
							</span>
							{!isLast ? (
								<span
									className={cn(
										'mt-1 h-7 w-px',
										idx < currentIndex && !terminal ? 'bg-emerald-500/50' : 'bg-border'
									)}
									aria-hidden
								/>
							) : null}
						</div>
						<div className='min-w-0 flex-1 pb-1'>
							<p
								className={cn(
									'text-sm leading-tight',
									reached ? 'font-medium text-foreground' : 'text-muted-foreground'
								)}
							>
								{ORDER_STATUS_LABEL[step]}
							</p>
							{event ? (
								<p className='mt-0.5 text-xs text-muted-foreground tabular-nums'>
									{formatDateTime(event.createdAt)}
									{event.note ? ` · ${event.note}` : null}
								</p>
							) : null}
						</div>
					</li>
				);
			})}

			{terminal ? (
				<li className='relative mt-3 flex items-start gap-2.5 border-t border-border/60 pt-3'>
					<span
						className={cn(
							'flex size-5 shrink-0 items-center justify-center rounded-full text-[0]',
							status === 'CANCELLED' ? 'bg-destructive text-white' : 'bg-amber-500 text-white'
						)}
						aria-hidden
					>
						{status === 'CANCELLED' ? (
							<XIcon className='size-3' strokeWidth={3} />
						) : (
							<CheckIcon className='size-3' strokeWidth={3} />
						)}
					</span>
					<div className='min-w-0 flex-1'>
						<p className='text-sm font-medium leading-tight'>
							{TERMINAL_LABEL[status] ?? ORDER_STATUS_LABEL[status]}
						</p>
						{stepEvents.get(status) ? (
							<p className='mt-0.5 text-xs text-muted-foreground tabular-nums'>
								{formatDateTime(stepEvents.get(status)!.createdAt)}
								{stepEvents.get(status)!.note ? ` · ${stepEvents.get(status)!.note}` : null}
							</p>
						) : null}
					</div>
				</li>
			) : null}
		</ol>
	);
}
