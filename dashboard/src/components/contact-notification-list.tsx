import { Link } from 'react-router-dom';
import { ArrowRightIcon, MailIcon } from 'lucide-react';

import { CONTACT_INQUIRY_SOURCE_LABEL, type AdminContactInquiryRow } from '@/api/admin-contact-inquiries';
import { cn } from '@/lib/utils';

function fmtRel(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime();
	const minutes = Math.round(diff / 60_000);
	if (minutes < 1) return 'vừa xong';
	if (minutes < 60) return `${minutes} phút trước`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours} giờ trước`;
	const days = Math.round(hours / 24);
	return `${days} ngày trước`;
}

export function ContactNotificationList({
	items,
	loading,
	isUnseen,
	onMarkSeen,
}: {
	items: AdminContactInquiryRow[];
	loading: boolean;
	isUnseen: (id: string) => boolean;
	onMarkSeen: (id: string) => void;
}) {
	if (loading) {
		return <div className='p-6 text-center text-xs text-muted-foreground'>Đang tải…</div>;
	}
	if (items.length === 0) {
		return <div className='p-6 text-center text-xs text-muted-foreground'>Không có tin liên hệ mới.</div>;
	}

	return (
		<div className='max-h-80 overflow-y-auto px-2 py-2'>
			<ul className='flex flex-col gap-1'>
				{items.map(item => {
					const unseen = isUnseen(item.id);
					return (
						<li key={item.id}>
							<Link
								to='/content/contact-inquiries'
								onClick={() => onMarkSeen(item.id)}
								className={cn(
									'group flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/40',
									unseen && 'bg-primary/5'
								)}
							>
								<div className='mt-0.5 flex size-8 items-center justify-center rounded-full bg-muted ring-1 ring-border'>
									<MailIcon className='size-4 text-muted-foreground' />
								</div>
								<div className='min-w-0 flex-1'>
									<div className='flex items-center justify-between gap-2'>
										<span className='truncate text-sm font-medium'>{item.name}</span>
										<span className='text-[11px] text-muted-foreground'>
											{fmtRel(item.createdAt)}
										</span>
									</div>
									<p className='truncate text-xs text-muted-foreground'>
										{item.email ?? item.phone ?? '—'}
									</p>
									<p className='mt-0.5 truncate text-xs text-muted-foreground'>
										{CONTACT_INQUIRY_SOURCE_LABEL[item.source] ?? item.source}
									</p>
									{unseen ? (
										<span
											className='mt-1 inline-block size-1.5 rounded-full bg-destructive'
											aria-hidden
										/>
									) : null}
								</div>
								<ArrowRightIcon className='mt-1 size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
