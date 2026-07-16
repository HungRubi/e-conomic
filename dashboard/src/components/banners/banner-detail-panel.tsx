import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ArrowLeftIcon,
	CalendarClockIcon,
	CopyIcon,
	HashIcon,
	ImageIcon,
	RocketIcon,
	TagIcon,
	TextIcon,
	Trash2Icon,
	TypeIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
	getBanner,
	updateBanner,
	deleteBanner,
	type AdminBannerRow,
} from '@/api/admin-banners';
import { EditableField } from '@/components/common/editable-field';
import { ProductImagesEditor, type ProductImageEntry } from '@/components/products/product-images-editor';
import { generateId } from '@/lib/generate-id';
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

const TYPE_LABEL: Record<AdminBannerRow['type'], string> = {
	HERO: 'Hero (đầu trang)',
	BANNER: 'Banner (trong trang)',
};

function formatDateTime(iso: string | null): string {
	if (!iso) return '—';
	return new Intl.DateTimeFormat('vi-VN', {
		day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
	}).format(new Date(iso));
}

async function copyToClipboard(value: string, message: string) {
	try { await navigator.clipboard.writeText(value); toast.success(message); }
	catch { toast.error('Không sao chép được'); }
}

export function BannerDetailPanel() {
	const params = useParams<{ bannerId: string }>();
	const bannerId = params.bannerId ?? '';

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['admin-banner', bannerId],
		queryFn: () => getBanner(bannerId),
		enabled: bannerId.length > 0,
	});

	if (!bannerId) return <NotFoundState />;
	if (isLoading) return <BannerDetailSkeleton />;
	if (error) return (
		<div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
			<p className='text-sm font-medium text-destructive'>{error instanceof Error ? error.message : 'Không tải được banner'}</p>
			<div className='flex gap-2'>
				<Button type='button' variant='outline' onClick={() => void refetch()}>Thử lại</Button>
				<Button asChild type='button' variant='ghost'><Link to='/content/banners'><ArrowLeftIcon className='mr-1 size-4' />Về danh sách</Link></Button>
			</div>
		</div>
	);
	if (!data) return <NotFoundState />;

	return <BannerDetailContent banner={data} onChanged={() => void refetch()} />;
}

function NotFoundState() {
	return (
		<div className='flex min-h-[200px] items-center justify-center'>
			<p className='text-sm text-muted-foreground'>Không tìm thấy banner</p>
		</div>
	);
}

function BannerDetailSkeleton() {
	return (
		<div className='space-y-4'>
			<Skeleton className='h-16 rounded-xl' />
			<div className='grid gap-4 lg:grid-cols-[1fr_360px]'>
				<div className='space-y-4'>
					<Skeleton className='h-48 rounded-xl' />
					<Skeleton className='h-32 rounded-xl' />
				</div>
				<Skeleton className='h-64 rounded-xl' />
			</div>
		</div>
	);
}

function BannerDetailContent({ banner, onChanged }: { banner: AdminBannerRow; onChanged: () => void }) {
	const navigate = useNavigate();
	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const [deleteBusy, setDeleteBusy] = React.useState(false);

	async function patch(body: Parameters<typeof updateBanner>[1]) {
		await updateBanner(banner.id, body);
		onChanged();
	}

	async function handleDelete() {
		setDeleteBusy(true);
		try {
			await deleteBanner(banner.id);
			toast.success('Đã xóa banner');
			navigate('/content/banners');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Không xóa được');
		} finally {
			setDeleteBusy(false);
		}
	}

	return (
		<div className='space-y-4'>
			{/* Header */}
			<header className='rounded-xl bg-card p-4 sm:p-5 lg:p-6 ring-1 ring-foreground/10'>
				<div className='flex items-start justify-between gap-4'>
					<div className='min-w-0 flex-1'>
						<div className='flex items-center gap-2'>
							<Button asChild variant='ghost' size='icon' className='size-7 shrink-0'>
								<Link to='/content/banners'><ArrowLeftIcon className='size-4' /></Link>
							</Button>
							<h1 className='truncate text-lg font-semibold tracking-tight'>
								{banner.altText || 'Banner'}
							</h1>
						</div>
						<div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
							<span className='inline-flex items-center gap-1'>
								<CalendarClockIcon className='size-3.5' aria-hidden />Tạo {formatDateTime(banner.createdAt)}
							</span>
							{banner.updatedAt !== banner.createdAt ? (
								<><span aria-hidden>·</span><span>Cập nhật {formatDateTime(banner.updatedAt)}</span></>
							) : null}
						</div>
					</div>
					<div className='flex shrink-0 flex-wrap items-center gap-2'>
						{banner.active ? (
							<Badge variant='success'>Đang hiển thị</Badge>
						) : (
							<Badge variant='secondary'>Ẩn</Badge>
						)}
						<Badge variant='default'>{TYPE_LABEL[banner.type]}</Badge>
					</div>
				</div>
			</header>

			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'>
				{/* Main column */}
				<div className='min-w-0 space-y-4'>
					{/* Image section */}
					<ImagesSection banner={banner} onChanged={onChanged} />

					{/* Info section */}
					<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={TextIcon} title='Thông tin banner' />
						<div className='mt-3 space-y-1'>
							<EditableField label='Alt text' type='text' value={banner.altText ?? ''}
								onSave={v => patch({ altText: v })} emptyHint='Chưa có mô tả' />
							<EditableField label='Link URL' type='text' value={banner.linkUrl ?? ''}
								onSave={v => patch({ linkUrl: v })} emptyHint='Không có link'
								displayClassName='font-mono text-xs' />
						</div>
					</section>

					{/* Image URL section */}
					<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={HashIcon} title='URL ảnh' hint='Đường dẫn đến file ảnh banner.' />
						<div className='mt-3 space-y-1'>
							<EditableField label='Image URL' type='text' value={banner.imageUrl}
								onSave={v => patch({ imageUrl: v })} displayClassName='font-mono text-xs' />
						</div>
					</section>
				</div>

				{/* Sidebar */}
				<aside className='lg:sticky lg:top-4 lg:self-start'>
					<div className='space-y-4'>
						{/* Quick actions */}
						<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={RocketIcon} title='Thao tác nhanh' />
							<div className='flex flex-col gap-2 mt-3'>
								<div className='flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2 text-sm'>
									<span className='text-muted-foreground'>Hiển thị</span>
									{banner.active ? (
										<Badge variant='success'>Đang hiển thị</Badge>
									) : (
										<Badge variant='secondary'>Ẩn</Badge>
									)}
								</div>
								<Button type='button' variant={banner.active ? 'secondary' : 'default'}
									onClick={() => patch({ active: !banner.active })} className='justify-start'>
									<RocketIcon className='mr-1.5 size-4' />
									{banner.active ? 'Tạm ẩn' : 'Hiển thị'}
								</Button>
								<Button type='button' variant='ghost' className='justify-start text-destructive hover:bg-destructive/10 hover:text-destructive'
									onClick={() => setConfirmDelete(true)} disabled={deleteBusy}>
									<Trash2Icon className='mr-1.5 size-4' />Xóa banner
								</Button>
							</div>
						</section>

						{/* Type & order */}
						<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={TagIcon} title='Phân loại' />
							<div className='mt-3 space-y-1'>
								<EditableField label='Loại' type='select' value={banner.type}
									onSave={v => patch({ type: v as 'HERO' | 'BANNER' })}
									options={[
										{ value: 'HERO', label: 'Hero (đầu trang)' },
										{ value: 'BANNER', label: 'Banner (trong trang)' },
									]} />
								<EditableField label='Thứ tự' type='number' value={banner.sortOrder}
									onSave={v => patch({ sortOrder: v ?? 0 })} min={0} />
								<EditableField label='Trạng thái' type='select' value={banner.active ? 'active' : 'hidden'}
									onSave={v => patch({ active: v === 'active' })}
									options={[
										{ value: 'active', label: 'Đang hiển thị' },
										{ value: 'hidden', label: 'Ẩn' },
									]} />
							</div>
						</section>
					</div>
				</aside>
			</div>

			{/* Delete dialog */}
			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa banner này?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteBusy}>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={() => void handleDelete()} disabled={deleteBusy}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
							{deleteBusy ? 'Đang xóa...' : 'Xóa'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

/* ─── ImagesSection: auto-save on change ─── */
function ImagesSection({ banner, onChanged }: { banner: AdminBannerRow; onChanged: () => void }) {
	const initial = React.useMemo<ProductImageEntry[]>(() => {
		return banner.imageUrl ? [{ id: generateId(), url: banner.imageUrl }] : [];
	}, [banner.imageUrl]);

	const [media, setMedia] = React.useState<ProductImageEntry[]>(initial);
	const [busy, setBusy] = React.useState(false);
	const saveTimerRef = React.useRef<ReturnType<typeof setTimeout>>();

	const dirty = React.useMemo(() => {
		const a = media.map(m => m.url.trim()).filter(Boolean);
		if (a.length === 0) return false;
		return a[0] !== banner.imageUrl;
	}, [media, banner.imageUrl]);

	React.useEffect(() => {
		if (!dirty) return;
		if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
		saveTimerRef.current = setTimeout(() => {
			const url = media[0]?.url.trim();
			if (!url) return;
			setBusy(true);
			updateBanner(banner.id, { imageUrl: url })
				.then(() => { onChanged(); })
				.catch(e => toast.error(e instanceof Error ? e.message : 'Không lưu ảnh được'))
				.finally(() => setBusy(false));
		}, 800);
		return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
	}, [media, dirty, banner.id, onChanged]);

	return (
		<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading icon={ImageIcon} title='Ảnh banner'
				action={busy ? <span className='text-xs text-muted-foreground'>Đang lưu...</span> : dirty ? <span className='text-xs text-amber-500'>Chưa lưu</span> : undefined}
			/>
			<div className='mt-3'>
				<ProductImagesEditor entries={media} onEntriesChange={setMedia} disabled={busy} />
			</div>
		</section>
	);
}

/* ─── SectionHeading ─── */
function SectionHeading({ icon: Icon, title, hint, action }: {
	icon?: React.ComponentType<{ className?: string }>;
	title: string;
	hint?: string;
	action?: React.ReactNode;
}) {
	return (
		<div className='flex items-center justify-between gap-2'>
			<div className='flex items-center gap-2 min-w-0'>
				{Icon ? (
					<div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-muted'>
						<Icon className='size-4 text-muted-foreground' />
					</div>
				) : null}
				<div className='min-w-0'>
					<h3 className='text-sm font-semibold tracking-tight'>{title}</h3>
					{hint ? <p className='text-xs text-muted-foreground'>{hint}</p> : null}
				</div>
			</div>
			{action ? <div className='shrink-0'>{action}</div> : null}
		</div>
	);
}
