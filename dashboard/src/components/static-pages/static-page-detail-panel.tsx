import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ArchiveIcon,
	ArrowLeftIcon,
	CalendarClockIcon,
	CopyIcon,
	GlobeIcon,
	HashIcon,
	LanguagesIcon,
	LayoutDashboardIcon,
	ListOrderedIcon,
	RocketIcon,
	SearchCheckIcon,
	TextIcon,
	Trash2Icon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
	archiveStaticPage,
	deleteStaticPage,
	fetchStaticPageById,
	publishStaticPage,
	translateStaticPage,
	updateStaticPage,
	type AdminStaticPageRow,
	type StaticPageWriteBody,
} from '@/api/admin-static-pages';
import { uploadProductImage } from '@/api/admin-products';
import { AuthApiError } from '@/auth/auth-api';
import { EditableField } from '@/components/common/editable-field';
import { SingleImageUrlDropzone } from '@/components/common/single-image-url-dropzone';
import { HomePageEditor } from '@/components/static-pages/home-page-visual-editor';
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
import { useEntityCrud } from '@/hooks/use-permission';
import { CONTENT_STATUS_BADGE } from '@/lib/status-styles';
import {
	parseHomePageContent,
	homeContentToApiRecord,
	defaultHomePageContent,
	type HomeContentV1,
} from '@/lib/home-page-admin';

const STATUS_LABEL: Record<AdminStaticPageRow['status'], string> = {
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

async function copyToClipboard(value: string, message: string) {
	try {
		await navigator.clipboard.writeText(value);
		toast.success(message);
	} catch {
		toast.error('Không sao chép được');
	}
}

export function StaticPageDetailPanel() {
	const params = useParams<{ pageId: string }>();
	const pageId = params.pageId ?? '';

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['admin-static-page', pageId],
		queryFn: () => fetchStaticPageById(pageId),
		enabled: pageId.length > 0,
	});

	if (!pageId) return <NotFoundState />;
	if (isLoading) return <DetailSkeleton />;
	if (error) {
		return (
			<div className='dashboard-fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
				<p className='text-sm font-medium text-destructive'>
					{error instanceof Error ? error.message : 'Không tải được trang tĩnh'}
				</p>
				<Button asChild type='button' variant='ghost'>
					<Link to='/content/pages'>
						<ArrowLeftIcon className='mr-1 size-4' />
						Về danh sách
					</Link>
				</Button>
			</div>
		);
	}
	if (!data) return <NotFoundState />;

	return <DetailContent page={data} onChanged={() => void refetch()} />;
}

function DetailContent({ page, onChanged }: { page: AdminStaticPageRow; onChanged: () => void }) {
	const navigate = useNavigate();
	const crud = useEntityCrud('staticPages');

	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const [actionBusy, setActionBusy] = React.useState<'publish' | 'archive' | 'delete' | null>(null);
	const [translating, setTranslating] = React.useState(false);

	async function patch(body: Partial<StaticPageWriteBody>) {
		if (!crud.canUpdate) throw new Error('Bạn không có quyền chỉnh sửa');
		await updateStaticPage(page.id, body);
		onChanged();
	}

	async function onPublish() {
		setActionBusy('publish');
		try {
			await publishStaticPage(page.id);
			toast.success('đã xuất bản trang');
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
			await archiveStaticPage(page.id);
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
			await deleteStaticPage(page.id);
			toast.success('đã xoá trang');
			navigate('/content/pages');
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
							<h1 className='min-w-0 flex-1 truncate text-lg font-semibold tracking-tight' title={page.title}>{page.title}</h1>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='size-7 text-muted-foreground'
								onClick={() => copyToClipboard(page.slug, 'đã sao chép slug')}
								aria-label='Sao chép slug'
							>
								<CopyIcon className='size-3.5' />
							</Button>
						</div>
						<div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
							<span className='inline-flex items-center gap-1 font-mono' translate='no'>
								<HashIcon className='size-3' aria-hidden />
								{page.slug}
							</span>
							<span aria-hidden>·</span>
							<span className='inline-flex items-center gap-1'>
								<GlobeIcon className='size-3.5' aria-hidden />
								{page.language}
							</span>
							<span aria-hidden>·</span>
							<span className='inline-flex items-center gap-1'>
								<CalendarClockIcon className='size-3.5' aria-hidden />
								Cập nhật {formatDateTime(page.updatedAt)}
							</span>
						</div>
					</div>
					<div className='flex shrink-0 flex-wrap items-center gap-2'>
						<Badge variant={CONTENT_STATUS_BADGE[page.status]}>{STATUS_LABEL[page.status]}</Badge>
						<Badge variant='outline'>{page.language.toUpperCase()}</Badge>
					</div>
				</div>
			</header>

			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_480px]'>
				<div className='min-w-0 space-y-4'>
					<SeoSection page={page} canUpdate={crud.canUpdate} onChanged={onChanged} />

					<HomeContentSection page={page} canUpdate={crud.canUpdate} onChanged={onChanged} />
				</div>

				<aside className='lg:sticky lg:top-4 lg:self-start'>
					<div className='space-y-4'>
						<section className='dashboard-slide-up dashboard-stagger-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={TextIcon} title='Thông tin chính' />
							<div className='mt-3 space-y-1'>
								<EditableField
									label='Tiêu đề'
									type='text'
									value={page.title}
									disabled={!crud.canUpdate}
									onSave={v => patch({ title: v })}
									validate={v => (v.trim() ? null : 'Tiêu đề không được trống')}
								/>
								<EditableField
									label='Slug (URL)'
									type='text'
									value={page.slug}
									disabled={!crud.canUpdate}
									onSave={v => patch({ slug: v })}
									validate={v =>
										/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.trim()) ? null : 'Slug chỉ gồm a-z, 0-9 và dấu -'
									}
									displayClassName='font-mono text-xs'
								/>
								<EditableField
									label='Ngôn ngữ'
									type='select'
									value={page.language}
									options={[
										{ value: 'vi', label: 'Tiếng Việt' },
										{ value: 'en', label: 'English' },
									]}
									disabled={!crud.canUpdate}
									onSave={v => patch({ language: v })}
								/>
								<EditableField
									label='Mô tả'
									type='textarea'
									rows={3}
									value={page.description ?? ''}
									disabled={!crud.canUpdate}
									onSave={v => patch({ description: v.trim() ? v : null })}
									emptyHint='Chưa có mô tả'
								/>
							</div>
						</section>

						<section className='dashboard-slide-up dashboard-stagger-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={ListOrderedIcon} title='Hiển thị' />
							<div className='mt-3 space-y-1'>
								<EditableField
									label='Thứ tự hiển thị'
									type='number'
									value={page.sortOrder}
									disabled={!crud.canUpdate}
									onSave={v => patch({ sortOrder: v ?? 0 })}
									min={0}
								/>
							</div>
						</section>

						<section className='dashboard-slide-up overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10'>
							<div className='border-b border-border/60 p-4'>
								<SectionHeading icon={RocketIcon} title='Thao tác nhanh' />
							</div>
							<div className='flex flex-col gap-2 p-4'>
								<div className='flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2 text-sm'>
									<span className='text-muted-foreground'>Trạng thái</span>
									<Badge variant={CONTENT_STATUS_BADGE[page.status]}>{STATUS_LABEL[page.status]}</Badge>
								</div>
								{crud.canUpdate && page.status !== 'ACTIVE' ? (
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
								{crud.canUpdate && page.status !== 'ARCHIVED' ? (
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
								{crud.canUpdate && page.language === 'vi' ? (
									<Button
										type='button'
										variant='outline'
										onClick={async () => {
											setTranslating(true);
											try {
												await translateStaticPage(page.id);
												toast.success('Đã dịch sang tiếng Anh!');
												onChanged();
											} catch (e) {
												toast.error(e instanceof AuthApiError ? e.message : 'Dịch thất bại');
											} finally {
												setTranslating(false);
											}
										}}
										disabled={translating}
										className='justify-start'
									>
										<LanguagesIcon className='mr-1.5 size-4' />
										{translating ? 'Đang dịch...' : 'Dịch sang tiếng Anh'}
									</Button>
								) : null}
								{crud.canDelete && !['home', 'about'].includes(page.slug) ? (
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
					</div>
				</aside>
			</div>

			<AlertDialog open={confirmDelete} onOpenChange={open => !actionBusy && setConfirmDelete(open)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xoá trang này?</AlertDialogTitle>
						<AlertDialogDescription>
							<span className='font-medium text-foreground'>{page.title}</span> sẽ bị xoá vĩnh viễn.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={actionBusy === 'delete'}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => void onDelete()}
							disabled={actionBusy === 'delete'}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							{actionBusy === 'delete' ? 'Đang xoá...' : 'Xoá'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function SeoSection({
	page,
	canUpdate,
	onChanged,
}: {
	page: AdminStaticPageRow;
	canUpdate: boolean;
	onChanged: () => void;
}) {
	const [busy, setBusy] = React.useState(false);
	const [uploadBusy, setUploadBusy] = React.useState(false);

	async function patch(body: Partial<StaticPageWriteBody>) {
		if (!canUpdate) throw new Error('Bạn không có quyền chỉnh sửa');
		setBusy(true);
		try {
			await updateStaticPage(page.id, body);
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không cập nhật được');
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className='dashboard-slide-up rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading icon={SearchCheckIcon} title='SEO' hint='Tiêu đề & mô tả hiển thị trên Google, ảnh OG hiển thị khi share Zalo / Facebook.' />
			<div className='mt-3 grid gap-4 sm:grid-cols-2'>
				<EditableField
					label='SEO title'
					type='text'
					value={page.seoTitle ?? ''}
					disabled={busy || !canUpdate}
					onSave={v => patch({ seoTitle: v.trim() ? v : null })}
					emptyHint='Để trống dùng tiêu đề'
				/>
				<EditableField
					containerClassName='sm:col-span-2'
					label='SEO description'
					type='textarea'
					rows={2}
					value={page.seoDescription ?? ''}
					disabled={busy || !canUpdate}
					onSave={v => patch({ seoDescription: v.trim() ? v : null })}
					emptyHint='Mô tả hiển thị trên Google'
				/>
				<div className='sm:col-span-2 space-y-2'>
					<p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>Ảnh OG</p>
					<SingleImageUrlDropzone
						label={page.ogImageUrl ? 'Thay ảnh OG' : 'Chọn ảnh OG'}
						hint='Khi share Zalo / Facebook. 1200x630 khuyến nghị.'
						url={page.ogImageUrl ?? ''}
						disabled={busy || !canUpdate}
						uploadBusy={uploadBusy}
						onUploadFile={async file => {
							setUploadBusy(true);
							try {
								const { url } = await uploadProductImage(file);
								await updateStaticPage(page.id, { ogImageUrl: url });
								toast.success('đã cập nhật ảnh OG');
								onChanged();
							} catch (e) {
								toast.error(e instanceof AuthApiError ? e.message : 'Tải ảnh thất bại');
							} finally {
								setUploadBusy(false);
							}
						}}
					/>
					{page.ogImageUrl && canUpdate ? (
						<Button
							type='button'
							variant='ghost'
							size='sm'
							onClick={async () => {
								setBusy(true);
								try {
									await updateStaticPage(page.id, { ogImageUrl: null });
									toast.success('đã gỡ ảnh OG');
									onChanged();
								} finally {
									setBusy(false);
								}
							}}
							disabled={busy}
						>
							Gỡ
						</Button>
					) : null}
				</div>
			</div>
		</section>
	);
}

function HomeContentSection({
	page,
	canUpdate,
	onChanged,
}: {
	page: AdminStaticPageRow;
	canUpdate: boolean;
	onChanged: () => void;
}) {
	const parsed = React.useMemo(() => parseHomePageContent(page.content), [page.content]);
	const [homeDraft, setHomeDraft] = React.useState<HomeContentV1 | null>(parsed);
	const [busy, setBusy] = React.useState(false);

	const valid = homeDraft !== null;
	async function saveVisual() {
		if (!homeDraft) return;
		setBusy(true);
		try {
			await updateStaticPage(page.id, { content: homeContentToApiRecord(homeDraft) });
			// Gửi revalidate tới website để flush cache
			try {
				await fetch(import.meta.env.VITE_WEBSITE_URL + '/api/revalidate', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': import.meta.env.VITE_REVALIDATE_SECRET ?? '' },
					body: JSON.stringify({ tags: ['static-pages', 'home-page'] }),
				});
			} catch { /* silent */ }
			toast.success('đã cập nhật nội dung trang chủ');
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không cập nhật được');
		} finally {
			setBusy(false);
		}
	}


	return (
		<section className='dashboard-slide-up dashboard-stagger-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading icon={LayoutDashboardIcon} title='Nội dung trang chủ' />
			<div className='mt-3'>
				{!valid ? (
					<div className='flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center'>
						<p className='text-sm text-destructive'>
							Nội dung trang chủ không đúng định dạng. Bấm "Khởi tạo mặc định" để tạo lại.
						</p>
						<Button
							type='button'
							variant='outline'
							size='sm'
							disabled={busy}
							onClick={() => {
								const d = defaultHomePageContent();
								setHomeDraft(d);
								toast.success('đã khởi tạo nội dung mặc định');
							}}
						>
							Khởi tạo mặc định
						</Button>
					</div>
				) : (
					<div className='flex flex-col gap-4'>
						<HomePageEditor
							value={homeDraft}
							onChange={setHomeDraft}
							disabled={!canUpdate || busy}
						/>
						{canUpdate ? (
							<div className='flex justify-end gap-2 border-t pt-4'>
								<Button
									type='button'
									onClick={() => void saveVisual()}
									disabled={busy || !homeDraft}
								>
									{busy ? 'Đang lưu...' : 'Lưu nội dung trang chủ'}
								</Button>
							</div>
						) : null}
					</div>
				)}
			</div>
		</section>
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
			<p className='text-sm font-medium'>Không tìm thấy trang</p>
			<Button asChild type='button' variant='outline'>
				<Link to='/content/pages'>
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
					<Skeleton className='h-40 w-full rounded-xl' />
					<Skeleton className='h-64 w-full rounded-xl' />
				</div>
				<div className='space-y-4'>
					<Skeleton className='h-48 w-full rounded-xl' />
					<Skeleton className='h-32 w-full rounded-xl' />
				</div>
			</div>
		</div>
	);
}
