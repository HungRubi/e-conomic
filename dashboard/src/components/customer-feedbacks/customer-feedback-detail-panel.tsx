import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ArchiveIcon,
	ArrowLeftIcon,
	CalendarClockIcon,
	ClockIcon,
	CopyIcon,
	HashIcon,
	ImageIcon,
	ListOrderedIcon,
	QuoteIcon,
	RocketIcon,
	StarIcon,
	TextIcon,
	Trash2Icon,
	UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
	archiveCustomerFeedback,
	deleteCustomerFeedback,
	fetchCustomerFeedbackById,
	publishCustomerFeedback,
	updateCustomerFeedback,
	type AdminCustomerFeedbackRow,
	type CustomerFeedbackBullet,
	type CustomerFeedbackWriteBody,
} from '@/api/admin-customer-feedbacks';
import { uploadProductImage } from '@/api/admin-products';
import { AuthApiError } from '@/auth/auth-api';
import { EditableField } from '@/components/common/editable-field';
import { SingleImageUrlDropzone } from '@/components/common/single-image-url-dropzone';
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
import { Textarea } from '@/components/ui/textarea';
import { useEntityCrud } from '@/hooks/use-permission';
import { CONTENT_STATUS_BADGE } from '@/lib/status-styles';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<AdminCustomerFeedbackRow['status'], string> = {
	DRAFT: 'Nháp',
	ACTIVE: 'đã xuất bản',
	ARCHIVED: 'Lưu trữ',
};

function formatDateTime(iso: string | null): string {
	if (!iso) return '—';
	return new Intl.DateTimeFormat('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(iso));
}

function toLocalDateTimeInput(iso: string | null): string {
	if (!iso) return '';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function copyToClipboard(value: string, message: string) {
	try {
		await navigator.clipboard.writeText(value);
		toast.success(message);
	} catch {
		toast.error('Không sao chép được');
	}
}

export function CustomerFeedbackDetailPanel() {
	const params = useParams<{ feedbackId: string }>();
	const feedbackId = params.feedbackId ?? '';

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['admin-customer-feedback', feedbackId],
		queryFn: () => fetchCustomerFeedbackById(feedbackId),
		enabled: feedbackId.length > 0,
	});

	if (!feedbackId) return <NotFoundState />;
	if (isLoading) return <DetailSkeleton />;
	if (error) {
		return (
			<div className='dashboard-fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
				<p className='text-sm font-medium text-destructive'>
					{error instanceof Error ? error.message : 'Không tải được phản hồi'}
				</p>
				<Button asChild type='button' variant='ghost'>
					<Link to='/content/customer-feedbacks'>
						<ArrowLeftIcon className='mr-1 size-4' />
						Về danh sách
					</Link>
				</Button>
			</div>
		);
	}
	if (!data) return <NotFoundState />;

	return <DetailContent feedback={data} onChanged={() => void refetch()} />;
}

function DetailContent({
	feedback,
	onChanged,
}: {
	feedback: AdminCustomerFeedbackRow;
	onChanged: () => void;
}) {
	const navigate = useNavigate();
	const crud = useEntityCrud('customerFeedbacks');

	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const [actionBusy, setActionBusy] = React.useState<'publish' | 'archive' | 'delete' | null>(null);

	async function patch(body: Partial<CustomerFeedbackWriteBody>) {
		if (!crud.canUpdate) throw new Error('Bạn không có quyền chỉnh sửa');
		await updateCustomerFeedback(feedback.id, body);
		onChanged();
	}

	async function onPublish() {
		setActionBusy('publish');
		try {
			await publishCustomerFeedback(feedback.id);
			toast.success('đã xuất bản phản hồi');
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không xuất bản được');
		} finally {
			setActionBusy(null);
		}
	}

	async function onArchive() {
		setActionBusy('archive');
		try {
			await archiveCustomerFeedback(feedback.id);
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
			await deleteCustomerFeedback(feedback.id);
			toast.success('đã xoá phản hồi');
			navigate('/content/customer-feedbacks');
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không xoá được');
			setActionBusy(null);
		}
	}

	return (
		<div className='dashboard-fade-in space-y-4'>
			<header className='rounded-xl bg-card p-4 sm:p-5 lg:p-6 ring-1 ring-foreground/10'>
				<div className='flex items-start justify-between gap-4'>
					<div className='min-w-0 flex-1'>
						<div className='flex items-center gap-1'>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='-ml-1.5 size-7 shrink-0 text-muted-foreground'
								onClick={() => navigate('/content/customer-feedbacks')}
								aria-label='Quay lại danh sách phản hồi'
							>
								<ArrowLeftIcon className='size-4' />
							</Button>
							<h1 className='min-w-0 flex-1 truncate text-lg font-semibold tracking-tight' title={feedback.title}>{feedback.title}</h1>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='size-7 text-muted-foreground'
								onClick={() => copyToClipboard(feedback.slug, 'đã sao chép slug')}
								aria-label='Sao chép slug'
							>
								<CopyIcon className='size-3.5' />
							</Button>
						</div>
						<div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
							<span className='inline-flex items-center gap-1 font-mono' translate='no'>
								<HashIcon className='size-3' aria-hidden />
								{feedback.slug}
							</span>
							<span aria-hidden>·</span>
							<span className='inline-flex items-center gap-1'>
								<CalendarClockIcon className='size-3.5' aria-hidden />
								Tạo {formatDateTime(feedback.createdAt)}
							</span>
							{feedback.updatedAt !== feedback.createdAt ? (
								<>
									<span aria-hidden>·</span>
									<span>Cập nhật {formatDateTime(feedback.updatedAt)}</span>
								</>
							) : null}
						</div>
					</div>
					<div className='flex shrink-0 flex-wrap items-center gap-2'>
						<Badge variant={CONTENT_STATUS_BADGE[feedback.status]}>{STATUS_LABEL[feedback.status]}</Badge>
						{feedback.publishedAt ? (
							<Badge variant='outline' className='gap-1'>
								<ClockIcon className='size-3' aria-hidden />
								{formatDateTime(feedback.publishedAt)}
							</Badge>
						) : null}
						{feedback.rating != null ? <RatingBadge rating={feedback.rating} /> : null}
					</div>
				</div>
			</header>

			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'>
				<div className='min-w-0 space-y-4'>
					<ImageSection feedback={feedback} canUpdate={crud.canUpdate} onChanged={onChanged} />

					<section className='dashboard-slide-up dashboard-stagger-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={TextIcon} title='Thông tin chính' />
						<div className='mt-3 space-y-1'>
							<EditableField
								label='Tiêu đề'
								type='text'
								value={feedback.title}
								disabled={!crud.canUpdate}
								onSave={v => patch({ title: v })}
								validate={v => (v.trim() ? null : 'Tiêu đề không được trống')}
							/>
							<EditableField
								label='Slug (URL)'
								type='text'
								value={feedback.slug}
								disabled={!crud.canUpdate}
								onSave={v => patch({ slug: v })}
								validate={v =>
									/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.trim()) ? null : 'Slug chỉ gồm a-z, 0-9 và dấu -'
								}
								displayClassName='font-mono text-xs'
							/>
							<EditableField
								label='Tóm tắt'
								type='textarea'
								rows={4}
								value={feedback.excerpt ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ excerpt: v.trim() ? v : null })}
								emptyHint='Chưa có tóm tắt — click để thêm'
							/>
						</div>
					</section>

					<section className='dashboard-slide-up dashboard-stagger-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={UserIcon} title='Khách hàng' />
						<div className='mt-3 grid gap-1 sm:grid-cols-2'>
							<EditableField
								label='Tên khách hàng'
								type='text'
								value={feedback.customerName ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ customerName: v.trim() ? v : null })}
								emptyHint='Ẩn danh'
							/>
							<EditableField
								label='Khu vực'
								type='text'
								value={feedback.customerLocation ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ customerLocation: v.trim() ? v : null })}
								emptyHint='Ví dụ: TP. HCM'
							/>
							<EditableField
								containerClassName='sm:col-span-2'
								label='Đánh giá (1-5)'
								type='number'
								value={feedback.rating ?? null}
								disabled={!crud.canUpdate}
								onSave={v => patch({ rating: v })}
								min={1}
								max={5}
								suffix='sao'
								emptyHint='Chưa có đánh giá'
							/>
						</div>
					</section>

					<BulletsSection feedback={feedback} canUpdate={crud.canUpdate} onChanged={onChanged} />
				</div>

				<aside className='lg:sticky lg:top-4 lg:self-start'>
					<div className='space-y-4'>
						<section className='dashboard-slide-up overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10'>
							<div className='border-b border-border/60 p-4'>
								<SectionHeading icon={RocketIcon} title='Thao tác nhanh' />
							</div>
							<div className='flex flex-col gap-2 p-4'>
								<div className='flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2 text-sm'>
									<span className='text-muted-foreground'>Trạng thái</span>
									<Badge variant={CONTENT_STATUS_BADGE[feedback.status]}>
										{STATUS_LABEL[feedback.status]}
									</Badge>
								</div>
								{crud.canUpdate && feedback.status !== 'ACTIVE' ? (
									<Button
										type='button'
										onClick={() => void onPublish()}
										disabled={actionBusy !== null}
										className='justify-start'
									>
										<RocketIcon className='mr-1.5 size-4' />
										Xuất bản
									</Button>
								) : null}
								{crud.canUpdate && feedback.status !== 'ARCHIVED' ? (
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
										Xoá vĩnh viễn
									</Button>
								) : null}
							</div>
						</section>

						<section className='dashboard-slide-up dashboard-stagger-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={ListOrderedIcon} title='Hiển thị & lịch xuất bản' />
							<div className='mt-3 space-y-1'>
								<EditableField
									label='Thứ tự hiển thị'
									type='number'
									value={feedback.sortOrder}
									disabled={!crud.canUpdate}
									onSave={v => patch({ sortOrder: v ?? 0 })}
									min={0}
								/>
								<PublishedAtField feedback={feedback} canUpdate={crud.canUpdate} onChanged={onChanged} />
							</div>
						</section>
					</div>
				</aside>
			</div>

			<AlertDialog open={confirmDelete} onOpenChange={open => !actionBusy && setConfirmDelete(open)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xoá phản hồi này?</AlertDialogTitle>
						<AlertDialogDescription>
							<span className='font-medium text-foreground'>{feedback.title}</span> sẽ bị xoá vĩnh viễn.
						</AlertDialogDescription>
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

function ImageSection({
	feedback,
	canUpdate,
	onChanged,
}: {
	feedback: AdminCustomerFeedbackRow;
	canUpdate: boolean;
	onChanged: () => void;
}) {
	const [busy, setBusy] = React.useState(false);
	const [uploadBusy, setUploadBusy] = React.useState(false);

	async function setImage(url: string | null) {
		setBusy(true);
		try {
			await updateCustomerFeedback(feedback.id, { imageUrl: url });
			toast.success(url ? 'đã cập nhật ảnh' : 'đã gỡ ảnh');
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không cập nhật được');
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className='dashboard-slide-up rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading icon={ImageIcon} title='Ảnh đại diện' hint='Hiển thị trong card phản hồi.' />
			<div className='mt-3'>
				<SingleImageUrlDropzone
					label={feedback.imageUrl ? 'Kéo thả hoặc bấm để thay ảnh' : 'Kéo thả hoặc bấm để chọn ảnh'}
					hint='JPEG, PNG, WebP'
					url={feedback.imageUrl ?? ''}
					disabled={busy || !canUpdate}
					uploadBusy={uploadBusy}
					onUploadFile={async file => {
						setUploadBusy(true);
						try {
							const { url } = await uploadProductImage(file);
							await setImage(url);
						} catch (e) {
							toast.error(e instanceof AuthApiError ? e.message : 'Tải ảnh thất bại');
						} finally {
							setUploadBusy(false);
						}
					}}
				/>
				{feedback.imageUrl && canUpdate ? (
					<div className='mt-3 flex justify-end'>
						<Button type='button' variant='ghost' size='sm' onClick={() => void setImage(null)} disabled={busy}>
							Gỡ ảnh
						</Button>
					</div>
				) : null}
			</div>
		</section>
	);
}

function BulletsSection({
	feedback,
	canUpdate,
	onChanged,
}: {
	feedback: AdminCustomerFeedbackRow;
	canUpdate: boolean;
	onChanged: () => void;
}) {
	const [editing, setEditing] = React.useState(false);
	const [draft, setDraft] = React.useState<CustomerFeedbackBullet[]>(feedback.bullets);
	const [busy, setBusy] = React.useState(false);

	const dirty = JSON.stringify(draft) !== JSON.stringify(feedback.bullets);

	function start() {
		setDraft(feedback.bullets);
		setEditing(true);
	}

	function cancel() {
		setDraft(feedback.bullets);
		setEditing(false);
	}

	async function save() {
		setBusy(true);
		try {
			await updateCustomerFeedback(feedback.id, {
				bullets: draft.filter(b => b.title.trim() || b.text.trim()),
			});
			toast.success('đã cập nhật bullets');
			setEditing(false);
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không cập nhật được');
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className='dashboard-slide-up dashboard-stagger-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading
				icon={QuoteIcon}
				title='Highlight (bullets)'
				hint='Mỗi bullet là 1 ý chính khách hàng nhấn mạnh.'
				action={
					!editing && canUpdate ? (
						<Button type='button' variant='ghost' size='sm' onClick={start}>
							Sửa
						</Button>
					) : null
				}
			/>
			<div className='mt-3 space-y-3'>
				{!editing ? (
					feedback.bullets.length === 0 ? (
						<p className='italic text-sm text-muted-foreground'>Chưa có bullet nào.</p>
					) : (
						<ul className='space-y-2'>
							{feedback.bullets.map((b, i) => (
								<li key={i} className='rounded-md border border-border/60 bg-muted/20 p-3'>
									<p className='text-sm font-semibold'>{b.title}</p>
									<p className='mt-1 text-sm text-muted-foreground'>{b.text}</p>
								</li>
							))}
						</ul>
					)
				) : (
					<div className='space-y-3'>
						{draft.map((b, i) => (
							<div key={i} className='space-y-1.5 rounded-md border border-border/60 p-3'>
								<input
									type='text'
									placeholder='Tiêu đề bullet'
									value={b.title}
									onChange={e => {
										const next = [...draft];
										next[i] = { ...next[i], title: e.target.value };
										setDraft(next);
									}}
									disabled={busy}
									className='h-8 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30'
								/>
								<Textarea
									placeholder='Nội dung'
									value={b.text}
									onChange={e => {
										const next = [...draft];
										next[i] = { ...next[i], text: e.target.value };
										setDraft(next);
									}}
									disabled={busy}
									rows={2}
									className='resize-none'
								/>
								<div className='flex justify-end'>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={() => setDraft(draft.filter((_, idx) => idx !== i))}
										disabled={busy}
									>
										Xoá bullet
									</Button>
								</div>
							</div>
						))}
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={() => setDraft([...draft, { title: '', text: '' }])}
							disabled={busy}
						>
							Thêm bullet
						</Button>
						<div className='flex justify-end gap-2'>
							<Button type='button' variant='ghost' size='sm' onClick={cancel} disabled={busy}>
								Hủy
							</Button>
							<Button type='button' size='sm' onClick={() => void save()} disabled={busy || !dirty}>
								{busy ? 'Đang lưu…' : 'Lưu bullets'}
							</Button>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}

function PublishedAtField({
	feedback,
	canUpdate,
	onChanged,
}: {
	feedback: AdminCustomerFeedbackRow;
	canUpdate: boolean;
	onChanged: () => void;
}) {
	const [editing, setEditing] = React.useState(false);
	const [draft, setDraft] = React.useState(toLocalDateTimeInput(feedback.publishedAt));
	const [busy, setBusy] = React.useState(false);

	async function commit() {
		setBusy(true);
		try {
			const value = draft.trim() === '' ? null : new Date(draft).toISOString();
			await updateCustomerFeedback(feedback.id, { publishedAt: value });
			toast.success('đã cập nhật lịch xuất bản');
			setEditing(false);
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không cập nhật được');
		} finally {
			setBusy(false);
		}
	}

	if (!editing) {
		return (
			<button
				type='button'
				disabled={!canUpdate}
				onClick={() => {
					setDraft(toLocalDateTimeInput(feedback.publishedAt));
					setEditing(true);
				}}
				className={cn(
					'group relative -mx-2 w-full rounded-md px-2 py-1.5 text-left transition-colors',
					canUpdate ? 'cursor-text hover:bg-muted/50' : 'cursor-default opacity-80'
				)}
			>
				<p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
					Ngày giờ xuất bản
				</p>
				<p className='mt-0.5 text-sm'>
					{feedback.publishedAt ? (
						formatDateTime(feedback.publishedAt)
					) : (
						<span className='italic text-muted-foreground'>Chưa lên lịch — click để chọn</span>
					)}
				</p>
			</button>
		);
	}

	return (
		<div className='-mx-2 space-y-1.5 rounded-md px-2 py-1.5'>
			<p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
				Ngày giờ xuất bản
			</p>
			<input
				type='datetime-local'
				autoFocus
				value={draft}
				onChange={e => setDraft(e.target.value)}
				disabled={busy}
				className='h-8 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30'
			/>
			<div className='flex justify-end gap-2'>
				<Button type='button' variant='ghost' size='sm' onClick={() => setEditing(false)} disabled={busy}>
					Hủy
				</Button>
				<Button type='button' size='sm' onClick={() => void commit()} disabled={busy}>
					{busy ? 'Đang lưu…' : 'Lưu'}
				</Button>
			</div>
		</div>
	);
}

function RatingBadge({ rating }: { rating: number }) {
	return (
		<span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'>
			<StarIcon className='size-3 fill-current' aria-hidden />
			{rating.toFixed(1)}
		</span>
	);
}

function SectionHeading({
	icon: Icon,
	title,
	hint,
	action,
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	hint?: string;
	action?: React.ReactNode;
}) {
	return (
		<div className='flex items-start justify-between gap-3'>
			<div className='flex items-start gap-2'>
				<Icon className='mt-0.5 size-4 shrink-0 text-muted-foreground' aria-hidden />
				<div>
					<h3 className='text-sm font-semibold tracking-tight'>{title}</h3>
					{hint ? <p className='mt-0.5 text-xs text-muted-foreground'>{hint}</p> : null}
				</div>
			</div>
			{action ? <div className='shrink-0'>{action}</div> : null}
		</div>
	);
}

function NotFoundState() {
	return (
		<div className='dashboard-fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-10 text-center'>
			<p className='text-sm font-medium'>Không tìm thấy phản hồi</p>
			<p className='text-xs text-muted-foreground'>Có thể đã bị xoá hoặc URL không đúng.</p>
			<Button asChild type='button' variant='outline'>
				<Link to='/content/customer-feedbacks'>
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
					<Skeleton className='h-40 w-full rounded-xl' />
					<Skeleton className='h-32 w-full rounded-xl' />
					<Skeleton className='h-48 w-full rounded-xl' />
				</div>
				<div className='space-y-4'>
					<Skeleton className='h-48 w-full rounded-xl' />
					<Skeleton className='h-32 w-full rounded-xl' />
				</div>
			</div>
		</div>
	);
}
