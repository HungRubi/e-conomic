import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ArchiveIcon,
	ArrowLeftIcon,
	CalendarClockIcon,
	ClockIcon,
	CopyIcon,
	FileTextIcon,
	HashIcon,
	ImageIcon,
	ListOrderedIcon,
	LanguagesIcon,
	RocketIcon,
	SearchCheckIcon,
	TextIcon,
	Trash2Icon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
	archiveArticle,
	deleteArticle,
	fetchArticleById,
	publishArticle,
	translateArticle,
	updateArticle,
	type AdminArticleRow,
	type ArticleWriteBody,
} from '@/api/admin-articles';
import { uploadProductImage } from '@/api/admin-products';
import { AuthApiError } from '@/auth/auth-api';
import { EditableField } from '@/components/common/editable-field';
import { SingleImageUrlDropzone } from '@/components/common/single-image-url-dropzone';
import { HomePageEditor } from '@/components/static-pages/home-page-visual-editor';
import { type HomeContentV1 } from '@/lib/home-page-admin';
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
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<AdminArticleRow['status'], string> = {
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

function parseArticleContent(raw: any): any[] | null {
	if (!raw) return null;
	try {
		const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
		// Support both { sections: [...] } and raw [...]
		if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sections)) return parsed.sections;
		if (Array.isArray(parsed)) return parsed;
		return null;
	} catch {
		return null;
	}
}

function articleContentToApiRecord(sections: any[]): string {
	return JSON.stringify({ sections });
}

export function ArticleDetailPanel() {
	const params = useParams<{ articleId: string }>();
	const articleId = params.articleId ?? '';

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['admin-article', articleId],
		queryFn: () => fetchArticleById(articleId),
		enabled: articleId.length > 0,
	});

	if (!articleId) return <NotFoundState />;
	if (isLoading) return <DetailSkeleton />;
	if (error) {
		return (
			<div className='dashboard-fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
				<p className='text-sm font-medium text-destructive'>
					{error instanceof Error ? error.message : 'Không tải được bài viết'}
				</p>
				<div className='flex gap-2'>
					<Button type='button' variant='outline' onClick={() => void refetch()}>
						Thử lại
					</Button>
					<Button asChild type='button' variant='ghost'>
						<Link to='/content/articles'>
							<ArrowLeftIcon className='mr-1 size-4' />
							Về danh sách
						</Link>
					</Button>
				</div>
			</div>
		);
	}
	if (!data) return <NotFoundState />;

	return <DetailContent article={data} onChanged={() => void refetch()} />;
}

function DetailContent({ article, onChanged }: { article: AdminArticleRow; onChanged: () => void }) {
	const navigate = useNavigate();
	const crud = useEntityCrud('articles');

	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const [actionBusy, setActionBusy] = React.useState<'publish' | 'archive' | 'delete' | null>(null);
	const [translating, setTranslating] = React.useState(false);

	const rawContent = React.useMemo(() => parseArticleContent(article.content), [article.content]);
	const [contentBlocks, setContentBlocks] = React.useState<any[] | null>(rawContent);
	const [contentDirty, setContentDirty] = React.useState(false);

	// Sync when article loads
	React.useEffect(() => {
		const parsed = parseArticleContent(article.content);
		setContentBlocks(parsed);
		setContentDirty(false);
	}, [article.content]);

	async function patch(body: Partial<ArticleWriteBody>) {
		if (!crud.canUpdate) {
			throw new Error('Bạn không có quyền chỉnh sửa');
		}
		await updateArticle(article.id, body);
		onChanged();
	}

	async function saveContent() {
		if (!contentBlocks || !crud.canUpdate) return;
		try {
			await updateArticle(article.id, { content: articleContentToApiRecord(contentBlocks) });
			toast.success('đã lưu nội dung');
			setContentDirty(false);
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Lưu thất bại');
		}
	}

	async function onPublish() {
		setActionBusy('publish');
		try {
			await publishArticle(article.id);
			toast.success('đã xuất bản bài viết');
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
			await archiveArticle(article.id);
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
			await deleteArticle(article.id);
			toast.success('đã xoá bài viết');
			navigate('/content/articles');
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không xoá được');
			setActionBusy(null);
		}
	}

	return (
		<div className='dashboard-fade-in space-y-4'>
			{/* Header — card style giống promotion detail */}
			<header className='rounded-xl bg-card p-4 sm:p-5 lg:p-6 ring-1 ring-foreground/10'>
				<div className='flex items-start justify-between gap-4'>
					<div className='min-w-0 flex-1'>
						<p className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
							Bài viết
						</p>
						<div className='mt-1 flex items-center gap-2'>
							<h1 className='truncate text-lg font-semibold tracking-tight'>{article.title}</h1>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='size-7 text-muted-foreground'
								onClick={() => copyToClipboard(article.slug, 'đã sao chép slug')}
								aria-label='Sao chép slug'
							>
								<CopyIcon className='size-3.5' />
							</Button>
						</div>
						<div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
							<span className='inline-flex items-center gap-1 font-mono' translate='no'>
								<HashIcon className='size-3' aria-hidden />
								{article.slug}
							</span>
							<span aria-hidden>·</span>
							<span className='inline-flex items-center gap-1'>
								<CalendarClockIcon className='size-3.5' aria-hidden />
								Tạo {formatDateTime(article.createdAt)}
							</span>
							{article.updatedAt !== article.createdAt ? (
								<>
									<span aria-hidden>·</span>
									<span>Cập nhật {formatDateTime(article.updatedAt)}</span>
								</>
							) : null}
						</div>
					</div>
					<div className='flex shrink-0 flex-wrap items-center gap-2'>
						<Badge variant={CONTENT_STATUS_BADGE[article.status]}>{STATUS_LABEL[article.status]}</Badge>
						{article.publishedAt ? (
							<Badge variant='outline' className='gap-1'>
								<ClockIcon className='size-3' aria-hidden />
								{formatDateTime(article.publishedAt)}
							</Badge>
						) : null}
					</div>
				</div>
			</header>

			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'>
				<div className='min-w-0 space-y-4'>
					<CoverImageSection article={article} canUpdate={crud.canUpdate} onChanged={onChanged} />

					<section className='dashboard-slide-up dashboard-stagger-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={TextIcon} title='Thông tin chính' />
						<div className='mt-3 space-y-1'>
							<EditableField
								label='Tiêu đề'
								type='text'
								value={article.title}
								disabled={!crud.canUpdate}
								onSave={v => patch({ title: v })}
								validate={v => (v.trim() ? null : 'Tiêu đề không được trống')}
							/>
							<EditableField
								label='Slug (URL)'
								type='text'
								value={article.slug}
								disabled={!crud.canUpdate}
								onSave={v => patch({ slug: v })}
								validate={v =>
									/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.trim())
										? null
										: 'Slug chỉ gồm a-z, 0-9 và dấu -'
								}
								displayClassName='font-mono text-xs'
							/>
							<EditableField
								label='Tóm tắt (excerpt)'
								type='textarea'
								rows={3}
								value={article.excerpt ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ excerpt: v.trim() ? v : null })}
								emptyHint='Chưa có tóm tắt — click để thêm'
							/>
						</div>
					</section>

					{/* Nội dung chính — visual editor */}
					<section className='dashboard-slide-up dashboard-stagger-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading
							icon={FileTextIcon}
							title='Nội dung chính'
							hint='Kéo thả section để sắp xếp bố cục bài viết.'
							action={
								contentDirty ? (
									<Button size='sm' onClick={() => void saveContent()} disabled={!crud.canUpdate}>
										Lưu nội dung
									</Button>
								) : null
							}
						/>
						<div className='mt-3'>
							{contentBlocks ? (
								<HomePageEditor
									value={{ sections: contentBlocks ?? [], fonts: {}, version: 1 } as HomeContentV1}
									onChange={full => {
										setContentBlocks(full.sections);
										setContentDirty(true);
									}}
									disabled={!crud.canUpdate}
								/>
							) : (
								<div className='flex flex-col items-center gap-3 rounded-md border border-dashed border-border/60 py-10 text-center'>
									<p className='text-sm text-muted-foreground'>
										Nội dung hiện tại là văn bản thô (Markdown/HTML). Chuyển sang soạn thảo trực
										quan?
									</p>
									<Button
										size='sm'
										variant='outline'
										disabled={!crud.canUpdate}
										onClick={() => {
											setContentBlocks([]);
											setContentDirty(true);
										}}
									>
										Khởi tạo bố cục trực quan
									</Button>
									{/* Also show the raw text as fallback */}
									<div className='mt-4 w-full max-w-lg'>
										<EditableField
											type='textarea'
											rows={10}
											value={article.content}
											disabled={!crud.canUpdate}
											onSave={v => patch({ content: v })}
											displayClassName='whitespace-pre-wrap font-mono text-xs leading-relaxed text-left'
										/>
									</div>
								</div>
							)}
						</div>
					</section>

					<section className='dashboard-slide-up dashboard-stagger-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={SearchCheckIcon} title='SEO & metadata' />
						<div className='mt-3 grid gap-1 sm:grid-cols-2'>
							<EditableField
								label='Meta title'
								type='text'
								value={article.metaTitle ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ metaTitle: v.trim() ? v : null })}
								emptyHint='Để trống để dùng tiêu đề'
							/>
							<EditableField
								label='Meta keywords'
								type='text'
								value={article.metaKeywords ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ metaKeywords: v.trim() ? v : null })}
								emptyHint='Cách nhau bằng dấu phẩy'
							/>
							<EditableField
								containerClassName='sm:col-span-2'
								label='Meta description'
								type='textarea'
								rows={2}
								value={article.metaDescription ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ metaDescription: v.trim() ? v : null })}
								emptyHint='Mô tả hiển thị trên SERP'
							/>
							<EditableField
								containerClassName='sm:col-span-2'
								label='Canonical URL'
								type='text'
								value={article.canonicalUrl ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ canonicalUrl: v.trim() ? v : null })}
								emptyHint='Để trống nếu là URL chính tắc'
								displayClassName='font-mono text-xs'
							/>
						</div>
					</section>
				</div>

				<aside className='lg:sticky lg:top-4 lg:self-start'>
					<div className='space-y-4'>
						<section className='dashboard-slide-up overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10'>
							<div className='border-b border-border/60 p-4'>
								<SectionHeading icon={RocketIcon} title='Thao tác nhanh' />
							</div>
							<div className='flex flex-col gap-2 p-4'>
								<div className='flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2 text-sm'>
									<span className='text-muted-foreground'>Trạng thái hiển thị</span>
									<Badge variant={CONTENT_STATUS_BADGE[article.status]}>
										{STATUS_LABEL[article.status]}
									</Badge>
								</div>
								{crud.canUpdate && article.status !== 'ACTIVE' ? (
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
								{crud.canUpdate && article.status !== 'ARCHIVED' ? (
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
								{crud.canUpdate && article.language === 'vi' ? (
									<Button
										type='button'
										variant='outline'
										onClick={async () => {
											setTranslating(true);
											try {
												await translateArticle(article.id);
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
									value={article.sortOrder}
									disabled={!crud.canUpdate}
									onSave={v => patch({ sortOrder: v ?? 0 })}
									min={0}
								/>
								<EditableField
									label='Thời gian đọc (phút)'
									type='number'
									value={article.readingMinutes ?? null}
									disabled={!crud.canUpdate}
									onSave={v => patch({ readingMinutes: v })}
									min={0}
									suffix='phút'
									emptyHint='Tự ước lượng nếu trống'
								/>
								<PublishedAtField article={article} canUpdate={crud.canUpdate} onChanged={onChanged} />
							</div>
						</section>
					</div>
				</aside>
			</div>

			<AlertDialog open={confirmDelete} onOpenChange={open => !actionBusy && setConfirmDelete(open)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xoá bài viết này?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động không thể hoàn tác.{' '}
							<span className='font-medium text-foreground'>{article.title}</span> sẽ bị xoá vĩnh viễn.
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

function CoverImageSection({
	article,
	canUpdate,
	onChanged,
}: {
	article: AdminArticleRow;
	canUpdate: boolean;
	onChanged: () => void;
}) {
	const [busy, setBusy] = React.useState(false);
	const [uploadBusy, setUploadBusy] = React.useState(false);

	async function setCover(url: string | null) {
		setBusy(true);
		try {
			await updateArticle(article.id, { coverImageUrl: url });
			toast.success(url ? 'đã cập nhật ảnh' : 'đã gỡ ảnh bìa');
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không cập nhật được');
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className={cn('dashboard-slide-up rounded-xl bg-card p-4 ring-1 ring-foreground/10')}>
			<SectionHeading icon={ImageIcon} title='Ảnh bìa' hint='Hiển thị trên danh sách + đầu bài viết.' />
			<div className='mt-3'>
				<SingleImageUrlDropzone
					label={article.coverImageUrl ? 'Kéo thả hoặc bấm để thay ảnh' : 'Kéo thả hoặc bấm để chọn ảnh bìa'}
					hint='JPEG, PNG, WebP, GIF, SVG'
					url={article.coverImageUrl ?? ''}
					disabled={busy || !canUpdate}
					uploadBusy={uploadBusy}
					onUploadFile={async file => {
						setUploadBusy(true);
						try {
							const { url } = await uploadProductImage(file);
							await setCover(url);
						} catch (e) {
							toast.error(e instanceof AuthApiError ? e.message : 'Tải ảnh thất bại');
						} finally {
							setUploadBusy(false);
						}
					}}
				/>
				{article.coverImageUrl && canUpdate ? (
					<div className='mt-3 flex justify-end'>
						<Button
							type='button'
							variant='ghost'
							size='sm'
							onClick={() => void setCover(null)}
							disabled={busy}
						>
							Gỡ ảnh
						</Button>
					</div>
				) : null}
			</div>
		</section>
	);
}

function PublishedAtField({
	article,
	canUpdate,
	onChanged,
}: {
	article: AdminArticleRow;
	canUpdate: boolean;
	onChanged: () => void;
}) {
	const [editing, setEditing] = React.useState(false);
	const [draft, setDraft] = React.useState(toLocalDateTimeInput(article.publishedAt));
	const [busy, setBusy] = React.useState(false);

	async function commit() {
		setBusy(true);
		try {
			const value = draft.trim() === '' ? null : new Date(draft).toISOString();
			await updateArticle(article.id, { publishedAt: value });
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
					setDraft(toLocalDateTimeInput(article.publishedAt));
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
					{article.publishedAt ? (
						formatDateTime(article.publishedAt)
					) : (
						<span className='italic text-muted-foreground'>Chưa lên lịch — click để chọn</span>
					)}
				</p>
			</button>
		);
	}

	return (
		<div className='-mx-2 space-y-1.5 rounded-md px-2 py-1.5'>
			<p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>Ngày giờ xuất bản</p>
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
			<p className='text-sm font-medium'>Không tìm thấy bài viết</p>
			<p className='text-xs text-muted-foreground'>Có thể đã bị xoá hoặc URL không đúng.</p>
			<Button asChild type='button' variant='outline'>
				<Link to='/content/articles'>
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
			<Skeleton className='h-24 w-full rounded-xl' />
			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]'>
				<div className='space-y-4'>
					<Skeleton className='h-40 w-full rounded-xl' />
					<Skeleton className='h-32 w-full rounded-xl' />
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
