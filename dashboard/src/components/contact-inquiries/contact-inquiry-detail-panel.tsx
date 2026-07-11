import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ArchiveIcon,
	ArrowLeftIcon,
	CalendarClockIcon,
	CopyIcon,
	HashIcon,
	MailIcon,
	MessageSquareIcon,
	PhoneIcon,
	Trash2Icon,
	UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
	archiveContactInquiry,
	CONTACT_INQUIRY_SOURCE_LABEL,
	CONTACT_INQUIRY_STATUS_LABEL,
	deleteContactInquiry,
	fetchContactInquiry,
	markContactInquiryRead,
	type AdminContactInquiryRow,
	type ContactInquiryStatus,
} from '@/api/admin-contact-inquiries';
import { AuthApiError } from '@/auth/auth-api';
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
import { Skeleton } from '@/components/ui/skeleton';
import { fmtUserDate } from '@/components/users/user-table-shared';
import { useEntityCrud } from '@/hooks/use-permission';

const STATUS_BADGE: Record<ContactInquiryStatus, 'default' | 'secondary' | 'outline'> = {
	new: 'default',
	read: 'secondary',
	archived: 'outline',
};

async function copyToClipboard(value: string, message: string) {
	try {
		await navigator.clipboard.writeText(value);
		toast.success(message);
	} catch {
		toast.error('Không sao chép được');
	}
}

export function ContactInquiryDetailPanel() {
	const params = useParams<{ inquiryId: string }>();
	const inquiryId = params.inquiryId ?? '';
	const [hasMarkedRead, setHasMarkedRead] = React.useState(false);

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['admin-contact-inquiry', inquiryId],
		queryFn: () => fetchContactInquiry(inquiryId),
		enabled: inquiryId.length > 0,
	});

	React.useEffect(() => {
		if (data && data.status === 'NEW' && !hasMarkedRead) {
			setHasMarkedRead(true);
			markContactInquiryRead(data.id)
				.then(() => void refetch())
				.catch(() => {
					/* keep stale */
				});
		}
	}, [data, hasMarkedRead, refetch]);

	if (!inquiryId) return <NotFoundState />;
	if (isLoading) return <DetailSkeleton />;
	if (error) {
		return (
			<div className='dashboard-fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
				<p className='text-sm font-medium text-destructive'>
					{error instanceof Error ? error.message : 'Không tải được tin nhắn'}
				</p>
				<Button asChild type='button' variant='ghost'>
					<Link to='/content/contact-inquiries'>
						<ArrowLeftIcon className='mr-1 size-4' />
						Về danh sách
					</Link>
				</Button>
			</div>
		);
	}
	if (!data) return <NotFoundState />;

	return <DetailContent inquiry={data} onChanged={() => void refetch()} />;
}

function DetailContent({ inquiry, onChanged }: { inquiry: AdminContactInquiryRow; onChanged: () => void }) {
	const navigate = useNavigate();
	const crud = useEntityCrud('contactInquiries');

	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const [actionBusy, setActionBusy] = React.useState<'archive' | 'delete' | null>(null);

	async function onArchive() {
		if (!crud.canUpdate) return;
		setActionBusy('archive');
		try {
			await archiveContactInquiry(inquiry.id);
			toast.success('đã lưu trữ');
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không lưu trữ được');
		} finally {
			setActionBusy(null);
		}
	}

	async function onDelete() {
		setActionBusy('delete');
		try {
			await deleteContactInquiry(inquiry.id);
			toast.success('đã xoá tin nhắn');
			navigate('/content/contact-inquiries');
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không xoá được');
			setActionBusy(null);
		}
	}

	const sourceLabel = CONTACT_INQUIRY_SOURCE_LABEL[inquiry.source] ?? inquiry.source;
	const replyHref = inquiry.email ? `mailto:${inquiry.email}` : null;
	const callHref = inquiry.phone ? `tel:${inquiry.phone}` : null;

	return (
		<div className='dashboard-fade-in space-y-4'>
			<header className='flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between'>
				<div className='flex min-w-0 items-start gap-3'>
					<Button
						type='button'
						variant='ghost'
						size='icon'
						className='shrink-0'
						onClick={() => navigate('/content/contact-inquiries')}
						aria-label='Quay lại danh sách'
					>
						<ArrowLeftIcon className='size-4' />
					</Button>
					<div className='min-w-0'>
						<p className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
							Tin nhắn liên hệ
						</p>
						<div className='mt-1 flex items-center gap-2'>
							<h1 className='truncate text-lg font-semibold tracking-tight'>{inquiry.name}</h1>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='size-7 text-muted-foreground'
								onClick={() => copyToClipboard(inquiry.id, 'đã sao chép ID')}
								aria-label='Sao chép ID'
							>
								<CopyIcon className='size-3.5' />
							</Button>
						</div>
						<div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
							<span className='inline-flex items-center gap-1 font-mono' translate='no'>
								<HashIcon className='size-3' aria-hidden />
								{inquiry.id.slice(0, 8)}…
							</span>
							<span aria-hidden>·</span>
							<span className='inline-flex items-center gap-1'>
								<CalendarClockIcon className='size-3.5' aria-hidden />
								{fmtUserDate(inquiry.createdAt)}
							</span>
							<span aria-hidden>·</span>
							<span>{sourceLabel}</span>
							{inquiry.context ? <span>· {inquiry.context}</span> : null}
						</div>
					</div>
				</div>
				<div className='flex flex-wrap items-center gap-2'>
					<Badge variant={STATUS_BADGE[inquiry.status]}>{CONTACT_INQUIRY_STATUS_LABEL[inquiry.status]}</Badge>
				</div>
			</header>

			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'>
				<div className='min-w-0 space-y-4'>
					<section className='dashboard-slide-up rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={MessageSquareIcon} title='Nội dung tin nhắn' />
						{inquiry.subject ? (
							<p className='mt-3 text-sm font-medium text-foreground'>{inquiry.subject}</p>
						) : null}
						<div className='mt-3 whitespace-pre-wrap rounded-lg border border-border/40 bg-muted/30 p-4 text-sm leading-relaxed'>
							{inquiry.message}
						</div>
					</section>

					<section className='dashboard-slide-up dashboard-stagger-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={UserIcon} title='Thông tin người gửi' />
						<dl className='mt-3 grid gap-3 sm:grid-cols-2'>
							<div>
								<dt className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
									Họ tên
								</dt>
								<dd className='mt-0.5 text-sm font-medium'>{inquiry.name}</dd>
							</div>
							<div>
								<dt className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
									Email
								</dt>
								<dd className='mt-0.5 text-sm font-medium'>{inquiry.email ?? '—'}</dd>
							</div>
							<div>
								<dt className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
									Điện thoại
								</dt>
								<dd className='mt-0.5 text-sm font-medium'>{inquiry.phone ?? '—'}</dd>
							</div>
							<div>
								<dt className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
									Nguồn
								</dt>
								<dd className='mt-0.5 text-sm font-medium'>{sourceLabel}</dd>
							</div>
						</dl>
					</section>
				</div>

				<aside className='lg:sticky lg:top-4 lg:self-start'>
					<div className='space-y-4'>
						<section className='dashboard-slide-up overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10'>
							<div className='border-b border-border/60 p-4'>
								<SectionHeading icon={MailIcon} title='Phản hồi nhanh' />
							</div>
							<div className='flex flex-col gap-2 p-4'>
								{replyHref ? (
									<Button asChild type='button' className='justify-start'>
										<a href={replyHref}>
											<MailIcon className='mr-1.5 size-4' />
											Trả lời qua email
										</a>
									</Button>
								) : null}
								{callHref ? (
									<Button asChild type='button' variant='outline' className='justify-start'>
										<a href={callHref}>
											<PhoneIcon className='mr-1.5 size-4' />
											Gọi điện
										</a>
									</Button>
								) : null}
								{crud.canUpdate && inquiry.status !== 'ARCHIVED' ? (
									<Button
										type='button'
										variant='outline'
										onClick={() => void onArchive()}
										disabled={actionBusy !== null}
										className='justify-start'
									>
										<ArchiveIcon className='mr-1.5 size-4' />
										Lưu trữ
									</Button>
								) : null}
								{crud.canDelete ? (
									<Button
										type='button'
										variant='ghost'
										className='justify-start text-destructive hover:bg-destructive/10 hover:text-destructive'
										onClick={() => setConfirmDelete(true)}
										disabled={actionBusy !== null}
									>
										<Trash2Icon className='mr-1.5 size-4' />
										Xoá tin nhắn
									</Button>
								) : null}
							</div>
						</section>
					</div>
				</aside>
			</div>

			<AlertDialog open={confirmDelete} onOpenChange={open => !actionBusy && setConfirmDelete(open)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xoá tin nhắn này?</AlertDialogTitle>
						<AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={actionBusy === 'delete'}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => void onDelete()}
							disabled={actionBusy === 'delete'}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							{actionBusy === 'delete' ? 'Đang xoá…' : 'Xoá'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function SectionHeading({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
	return (
		<div className='flex items-start gap-2'>
			<Icon className='mt-0.5 size-4 shrink-0 text-muted-foreground' aria-hidden />
			<h3 className='text-sm font-semibold tracking-tight'>{title}</h3>
		</div>
	);
}

function NotFoundState() {
	return (
		<div className='dashboard-fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-10 text-center'>
			<p className='text-sm font-medium'>Không tìm thấy tin nhắn</p>
			<Button asChild type='button' variant='outline'>
				<Link to='/content/contact-inquiries'>
					<ArrowLeftIcon className='mr-1 size-4' />
					Về danh sách
				</Link>
			</Button>
		</div>
	);
}

function DetailSkeleton() {
	return (
		<div className='dashboard-fade-in space-y-4'>
			<div className='flex items-center gap-3 border-b border-border/60 pb-4'>
				<Skeleton className='size-9 rounded-md' />
				<div className='space-y-2'>
					<Skeleton className='h-3 w-24' />
					<Skeleton className='h-5 w-48' />
				</div>
			</div>
			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]'>
				<div className='space-y-4'>
					<Skeleton className='h-48 w-full rounded-xl' />
					<Skeleton className='h-32 w-full rounded-xl' />
				</div>
				<div className='space-y-4'>
					<Skeleton className='h-40 w-full rounded-xl' />
				</div>
			</div>
		</div>
	);
}
