import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import {
	archiveArticle,
	createArticle,
	deleteArticle,
	fetchArticles,
	publishArticle,
	type AdminArticleRow,
	type ArticleWriteBody,
} from '@/api/admin-articles';
import { uploadProductImage } from '@/api/admin-products';
import { AuthApiError } from '@/auth/auth-api';
import { SingleImageUrlDropzone } from '@/components/common/single-image-url-dropzone';
import { TableEmptyStateRow } from '@/components/table-empty-state-row';
import { TableErrorStateRow } from '@/components/table-error-state-row';
import { TableRowsSkeleton } from '@/components/list-skeletons';
import { fmtUserDate } from '@/components/users/user-table-shared';
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
import { CONTENT_STATUS_BADGE } from '@/lib/status-styles';
import {
	Drawer,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerPageContent,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useEntityCrud } from '@/hooks/use-permission';
import { usePaginatedArticleList, type ArticleListSortKey } from '@/hooks/use-paginated-article-list';
import { digitsOnly } from '@/lib/form-field-ui';
import {
	Archive,
	ArrowUpRight,
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisVerticalIcon,
	GripVerticalIcon,
	PlusIcon,
	Send,
	Trash2,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const listArticles = (params: Parameters<typeof fetchArticles>[0]) => fetchArticles(params);

const STATUS_LABEL: Record<AdminArticleRow['status'], string> = {
	DRAFT: 'Nháp',
	ACTIVE: 'đã xuất bản',
	ARCHIVED: 'Lưu trữ',
};

type UploadSlot = 'cover' | 'og';

export function ArticlesAdminPanel() {
	const navigate = useNavigate();
	const crud = useEntityCrud('articles');

	const [qInput, setQInput] = React.useState('');
	const [sortBy, setSortBy] = React.useState<ArticleListSortKey>('updatedAt');
	const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
	const [pageSize, setPageSize] = React.useState(10);
	const [statusFilter, setStatusFilter] = React.useState<'all' | AdminArticleRow['status']>('all');

	const { rows, total, loading, error, page, setPage, refetch, upsertRow, removeRow } = usePaginatedArticleList(
		listArticles,
		qInput,
		sortBy,
		sortOrder,
		pageSize,
		statusFilter
	);

	// Drawer chỉ dùng cho TẠO MỚI — sửa bài viết đã chuyển sang trang detail
	// (`/content/articles/:id`) với pattern inline-edit như product-detail.
	const [createOpen, setCreateOpen] = React.useState(false);
	const [formSlug, setFormSlug] = React.useState('');
	const [formTitle, setFormTitle] = React.useState('');
	const [formExcerpt, setFormExcerpt] = React.useState('');
	const [formContent, setFormContent] = React.useState('');
	const [formCover, setFormCover] = React.useState('');
	const [formMetaTitle, setFormMetaTitle] = React.useState('');
	const [formMetaDesc, setFormMetaDesc] = React.useState('');
	const [formMetaKw, setFormMetaKw] = React.useState('');
	const [formOg, setFormOg] = React.useState('');
	const [formCanonical, setFormCanonical] = React.useState('');
	const [formReading, setFormReading] = React.useState('');
	const [formSortOrder, setFormSortOrder] = React.useState('0');
	const [formStatus, setFormStatus] = React.useState<AdminArticleRow['status']>('DRAFT');
	const [formPublishedLocal, setFormPublishedLocal] = React.useState('');
	const [formBusy, setFormBusy] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);
	const [uploadSlot, setUploadSlot] = React.useState<UploadSlot | null>(null);
	const [deleteTarget, setDeleteTarget] = React.useState<AdminArticleRow | null>(null);
	const [deleteBusy, setDeleteBusy] = React.useState(false);

	const uploadBusy = uploadSlot !== null;
	const formDisabled = formBusy || uploadBusy;

	function openCreate() {
		setFormSlug('');
		setFormTitle('');
		setFormExcerpt('');
		setFormContent('');
		setFormCover('');
		setFormMetaTitle('');
		setFormMetaDesc('');
		setFormMetaKw('');
		setFormOg('');
		setFormCanonical('');
		setFormReading('');
		setFormSortOrder('0');
		setFormStatus('DRAFT');
		setFormPublishedLocal('');
		setFormError(null);
		setCreateOpen(true);
	}

	function openDetail(row: AdminArticleRow) {
		navigate(`/content/articles/${row.id}`);
	}

	function buildBody(): ArticleWriteBody {
		const nullIfEmpty = (s: string) => (s.trim() === '' ? null : s.trim());
		const reading = formReading.trim() === '' ? null : Number.parseInt(formReading, 10);
		const publishedAt = formPublishedLocal.trim() === '' ? null : new Date(formPublishedLocal).toISOString();
		return {
			title: formTitle.trim(),
			...(formSlug.trim() ? { slug: formSlug.trim() } : {}),
			excerpt: nullIfEmpty(formExcerpt),
			content: formContent,
			coverImageUrl: nullIfEmpty(formCover),
			metaTitle: nullIfEmpty(formMetaTitle),
			metaDescription: nullIfEmpty(formMetaDesc),
			metaKeywords: nullIfEmpty(formMetaKw),
			ogImageUrl: nullIfEmpty(formOg),
			canonicalUrl: nullIfEmpty(formCanonical),
			readingMinutes: reading != null && Number.isFinite(reading) ? reading : null,
			sortOrder: Number.parseInt(formSortOrder, 10) || 0,
			status: formStatus,
			publishedAt,
		};
	}

	async function onUpload(slot: UploadSlot, file: File) {
		setUploadSlot(slot);
		try {
			const { url } = await uploadProductImage(file);
			if (slot === 'cover') setFormCover(url);
			else setFormOg(url);
			toast.success('đã tải ảnh lên');
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Tải ảnh thất bại');
		} finally {
			setUploadSlot(null);
		}
	}

	async function submitCreate() {
		if (!formTitle.trim()) {
			toast.error('Nhập tiêu đề');
			return;
		}
		if (!formContent.trim()) {
			toast.error('Nhập nội dung');
			return;
		}
		setFormBusy(true);
		setFormError(null);
		try {
			const created = await createArticle(buildBody());
			toast.success('đã tạo bài viết');
			upsertRow(created);
			setCreateOpen(false);
			void refetch({ silent: true });
		} catch (e) {
			const msg = e instanceof AuthApiError ? e.message : 'Lưu thất bại';
			setFormError(msg);
			toast.error(msg);
		} finally {
			setFormBusy(false);
		}
	}

	async function confirmDelete() {
		if (!deleteTarget) return;
		setDeleteBusy(true);
		try {
			await deleteArticle(deleteTarget.id);
			removeRow(deleteTarget.id);
			toast.success('đã xóa bài viết');
			setDeleteTarget(null);
			void refetch({ silent: true });
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Xóa thất bại');
		} finally {
			setDeleteBusy(false);
		}
	}

	const pageCount = Math.max(1, Math.ceil(total / pageSize));

	return (
		<div className='dashboard-fade-in flex min-h-0 flex-1 flex-col gap-4'>
			<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-lg font-semibold tracking-tight'>Bài viết</h1>
					<p className='text-muted-foreground text-sm'>Click một bài viết để mở chi tiết và chỉnh sửa.</p>
				</div>
				{crud.canCreate ? (
					<Button type='button' size='sm' className='gap-1.5' onClick={openCreate}>
						<PlusIcon className='size-4' />
						Viết bài mới
					</Button>
				) : null}
			</div>

			<div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end'>
				<div className='min-w-48 flex-1'>
					<Input
						id='article-q'
						placeholder='Tìm theo tiêu đề, slug, nội dung…'
						value={qInput}
						onChange={e => setQInput(e.target.value)}
						autoComplete='off'
					/>
				</div>
				<div className='flex flex-wrap gap-2'>
					<Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
						<SelectTrigger className='w-40'>
							<SelectValue placeholder='Trạng thái' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>Tất cả</SelectItem>
							<SelectItem value='DRAFT'>Nháp</SelectItem>
							<SelectItem value='ACTIVE'>đã xuất bản</SelectItem>
							<SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={v => setSortBy(v as ArticleListSortKey)}>
						<SelectTrigger className='w-44'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value='updatedAt'>Cập nhật</SelectItem>
								<SelectItem value='createdAt'>Tạo</SelectItem>
								<SelectItem value='publishedAt'>Xuất bản</SelectItem>
								<SelectItem value='title'>Tiêu đề</SelectItem>
								<SelectItem value='sortOrder'>Thứ tự</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					<Select value={sortOrder} onValueChange={v => setSortOrder(v as 'asc' | 'desc')}>
						<SelectTrigger className='w-32'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='desc'>Giảm dần</SelectItem>
							<SelectItem value='asc'>Tăng dần</SelectItem>
						</SelectContent>
					</Select>
					<Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
						<SelectTrigger className='w-24'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{[10, 20, 50].map(n => (
								<SelectItem key={n} value={String(n)}>
									{n}/trang
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className='overflow-hidden rounded-lg border bg-background'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-10'>
								<span className='sr-only'>Kéo</span>
							</TableHead>
							<TableHead>Tiêu đề</TableHead>
							<TableHead className='w-28'>Trạng thái</TableHead>
							<TableHead className='text-muted-foreground hidden lg:table-cell'>Xuất bản</TableHead>
							<TableHead className='text-muted-foreground hidden sm:table-cell'>Cập nhật</TableHead>
							<TableHead className='w-12 text-right'> </TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRowsSkeleton rows={5} columns={7} />
						) : error ? (
							<TableErrorStateRow colSpan={7} message={error} onRetry={() => void refetch()} />
						) : rows.length === 0 ? (
							<TableEmptyStateRow colSpan={7} />
						) : (
							rows.map(row => (
								<TableRow
									key={row.id}
									className='dashboard-row-enter cursor-pointer'
									onClick={() => openDetail(row)}
									role='button'
									tabIndex={0}
									onKeyDown={e => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											openDetail(row);
										}
									}}
								>
									<TableCell>
										<div className='flex items-center justify-center'>
											<GripVerticalIcon className='size-4 text-muted-foreground' />
										</div>
									</TableCell>
									<TableCell className='max-w-[min(40vw,20rem)] font-medium'>
										<span className='line-clamp-2'>{row.title}</span>
									</TableCell>
									<TableCell>
										<Badge variant={CONTENT_STATUS_BADGE[row.status]}>
											{STATUS_LABEL[row.status]}
										</Badge>
									</TableCell>
									<TableCell className='text-muted-foreground hidden text-sm lg:table-cell'>
										{row.publishedAt ? fmtUserDate(row.publishedAt) : '—'}
									</TableCell>
									<TableCell className='text-muted-foreground hidden text-sm sm:table-cell'>
										{fmtUserDate(row.updatedAt)}
									</TableCell>
									<TableCell className='text-right' onClick={e => e.stopPropagation()}>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													type='button'
													variant='ghost'
													size='icon'
													className='size-8 text-muted-foreground'
													aria-label='Thao tác'
												>
													<EllipsisVerticalIcon className='size-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end' className='w-48'>
												<DropdownMenuItem onClick={() => openDetail(row)}>
													<ArrowUpRight className='size-4' />
													Mở chi tiết
												</DropdownMenuItem>
												{crud.canUpdate ? (
													<>
														<DropdownMenuItem
															onClick={async () => {
																try {
																	const r = await publishArticle(row.id);
																	upsertRow(r);
																	toast.success('đã xuất bản');
																	void refetch({ silent: true });
																} catch (e) {
																	toast.error(
																		e instanceof AuthApiError
																			? e.message
																			: 'Thất bại'
																	);
																}
															}}
														>
															<Send className='size-4' />
															Xuất bản
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={async () => {
																try {
																	const r = await archiveArticle(row.id);
																	upsertRow(r);
																	toast.success('đã lưu trữ');
																	void refetch({ silent: true });
																} catch (e) {
																	toast.error(
																		e instanceof AuthApiError
																			? e.message
																			: 'Thất bại'
																	);
																}
															}}
														>
															<Archive className='size-4' />
															Lưu trữ
														</DropdownMenuItem>
													</>
												) : null}
												{crud.canDelete ? (
													<>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															variant='destructive'
															onClick={() => setDeleteTarget(row)}
														>
															<Trash2 className='size-4' />
															Xóa
														</DropdownMenuItem>
													</>
												) : null}
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<div className='text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between'>
				<span>
					Hiển thị {total === 0 ? 0 : page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} / {total}
				</span>
				<div className='flex items-center gap-2'>
					<Button
						type='button'
						variant='outline'
						size='icon'
						className='size-8'
						disabled={page <= 0}
						onClick={() => setPage(p => Math.max(0, p - 1))}
					>
						<ChevronLeftIcon className='size-4' />
					</Button>
					<span>
						Trang {page + 1} / {pageCount}
					</span>
					<Button
						type='button'
						variant='outline'
						size='icon'
						className='size-8'
						disabled={page + 1 >= pageCount}
						onClick={() => setPage(p => p + 1)}
					>
						<ChevronRightIcon className='size-4' />
					</Button>
				</div>
			</div>

			<Drawer open={createOpen} onOpenChange={setCreateOpen} modal shouldScaleBackground={false}>
				<DrawerPageContent className='flex flex-col gap-0 p-0' showCloseButton>
					<DrawerHeader className='shrink-0 border-b px-6 py-5 pr-16 text-left'>
						<DrawerTitle>Bài viết mới</DrawerTitle>
						<DrawerDescription className='mt-1.5 max-w-2xl'>
							Slug để trống sẽ tự sinh từ tiêu đề. Sau khi tạo xong bạn có thể mở chi tiết để chỉnh sửa
							từng trường inline.
						</DrawerDescription>
					</DrawerHeader>

					<div className='min-h-0 flex-1 overflow-y-auto'>
						<div className='mx-auto w-full max-w-6xl px-6 py-6 pb-8'>
							{formError ? (
								<p className='text-destructive bg-destructive/10 mb-6 rounded-md px-3 py-2 text-sm'>
									{formError}
								</p>
							) : null}

							<FieldGroup className='flex flex-col gap-8'>
								<section className='space-y-4'>
									<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
										Nhận diện
									</p>
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel htmlFor='art-title'>Tiêu đề</FieldLabel>
											<Input
												id='art-title'
												className='mt-1.5'
												value={formTitle}
												onChange={e => setFormTitle(e.target.value)}
												disabled={formDisabled}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor='art-slug'>Slug (tuỳ chọn)</FieldLabel>
											<Input
												id='art-slug'
												className='mt-1.5 font-mono text-sm'
												value={formSlug}
												onChange={e => setFormSlug(e.target.value)}
												disabled={formDisabled}
												autoComplete='off'
												placeholder='Để trống để tự sinh'
											/>
										</Field>
									</div>
								</section>

								<section className='space-y-4'>
									<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
										Nội dung
									</p>
									<Field>
										<FieldLabel htmlFor='art-excerpt'>Tóm tắt (excerpt)</FieldLabel>
										<Textarea
											id='art-excerpt'
											className='mt-1.5 min-h-20'
											value={formExcerpt}
											onChange={e => setFormExcerpt(e.target.value)}
											disabled={formDisabled}
											rows={3}
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor='art-content'>Nội dung chính</FieldLabel>
										<Textarea
											id='art-content'
											className='mt-1.5 min-h-56 font-mono text-sm'
											value={formContent}
											onChange={e => setFormContent(e.target.value)}
											disabled={formDisabled}
											rows={12}
											placeholder='Markdown hoặc HTML tuỳ frontend website'
										/>
									</Field>
								</section>

								<section className='space-y-4'>
									<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
										Ảnh
									</p>
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel>Ảnh bìa</FieldLabel>
											<div className='mt-1.5'>
												<SingleImageUrlDropzone
													label={formCover.trim() ? 'Thay ảnh bìa' : 'Chọn ảnh bìa'}
													hint='Hiển thị trong danh sách & đầu bài'
													url={formCover}
													disabled={formDisabled}
													uploadBusy={uploadSlot === 'cover'}
													onUploadFile={f => onUpload('cover', f)}
												/>
											</div>
										</Field>
										<Field>
											<FieldLabel>Ảnh Open Graph</FieldLabel>
											<div className='mt-1.5'>
												<SingleImageUrlDropzone
													label={formOg.trim() ? 'Thay ảnh OG' : 'Chọn ảnh OG'}
													hint='Khi share Zalo / Facebook'
													url={formOg}
													disabled={formDisabled}
													uploadBusy={uploadSlot === 'og'}
													onUploadFile={f => onUpload('og', f)}
												/>
											</div>
										</Field>
									</div>
								</section>

								<section className='space-y-4'>
									<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
										SEO
									</p>
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel htmlFor='art-meta-title'>Meta title</FieldLabel>
											<Input
												id='art-meta-title'
												className='mt-1.5'
												value={formMetaTitle}
												onChange={e => setFormMetaTitle(e.target.value)}
												disabled={formDisabled}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor='art-meta-kw'>Meta keywords</FieldLabel>
											<Input
												id='art-meta-kw'
												className='mt-1.5'
												value={formMetaKw}
												onChange={e => setFormMetaKw(e.target.value)}
												disabled={formDisabled}
												placeholder='từ khóa, phân tách bằng dấu phẩy'
											/>
										</Field>
									</div>
									<Field>
										<FieldLabel htmlFor='art-meta-desc'>Meta description</FieldLabel>
										<Textarea
											id='art-meta-desc'
											className='mt-1.5 min-h-24'
											value={formMetaDesc}
											onChange={e => setFormMetaDesc(e.target.value)}
											disabled={formDisabled}
											rows={4}
										/>
									</Field>
								</section>

								<section className='space-y-4'>
									<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
										Hiển thị
									</p>
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel htmlFor='art-canonical'>URL chuẩn (canonical)</FieldLabel>
											<Input
												id='art-canonical'
												className='mt-1.5'
												type='url'
												value={formCanonical}
												onChange={e => setFormCanonical(e.target.value)}
												disabled={formDisabled}
												placeholder='https://…'
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor='art-reading'>Thời gian đọc (phút)</FieldLabel>
											<Input
												id='art-reading'
												className='mt-1.5 max-w-xs'
												inputMode='numeric'
												pattern='[0-9]*'
												value={formReading}
												onChange={e => setFormReading(digitsOnly(e.target.value))}
												disabled={formDisabled}
											/>
										</Field>
									</div>
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel htmlFor='art-sort'>Thứ tự</FieldLabel>
											<Input
												id='art-sort'
												className='mt-1.5 max-w-xs'
												inputMode='numeric'
												pattern='[0-9]*'
												value={formSortOrder}
												onChange={e => setFormSortOrder(digitsOnly(e.target.value))}
												disabled={formDisabled}
											/>
										</Field>
										<Field>
											<FieldLabel>Trạng thái</FieldLabel>
											<Select
												value={formStatus}
												onValueChange={v => setFormStatus(v as AdminArticleRow['status'])}
												disabled={formDisabled}
											>
												<SelectTrigger className='mt-1.5'>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='DRAFT'>Nháp</SelectItem>
													<SelectItem value='ACTIVE'>đã xuất bản</SelectItem>
													<SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
												</SelectContent>
											</Select>
										</Field>
									</div>
									<Field>
										<FieldLabel htmlFor='art-published'>Ngày giờ xuất bản (tuỳ chọn)</FieldLabel>
										<Input
											id='art-published'
											className='mt-1.5 max-w-md'
											type='datetime-local'
											value={formPublishedLocal}
											onChange={e => setFormPublishedLocal(e.target.value)}
											disabled={formDisabled}
										/>
										<p className='text-muted-foreground mt-1 text-xs'>
											Để trống: API tự gán khi chuyển sang đã xuất bản.
										</p>
									</Field>
								</section>
							</FieldGroup>
						</div>
					</div>

					<DrawerFooter className='mt-auto shrink-0 border-t px-0 py-0'>
						<div className='mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 sm:flex-row sm:justify-end'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setCreateOpen(false)}
								disabled={formBusy}
							>
								Hủy
							</Button>
							<Button type='button' onClick={() => void submitCreate()} disabled={formDisabled}>
								{formBusy ? 'Đang tạo…' : 'Tạo bài viết'}
							</Button>
						</div>
					</DrawerFooter>
				</DrawerPageContent>
			</Drawer>

			<AlertDialog
				open={Boolean(deleteTarget)}
				onOpenChange={open => !open && !deleteBusy && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
						<AlertDialogDescription>
							<span className='font-medium text-foreground'>{deleteTarget?.title}</span> sẽ bị xóa vĩnh
							viễn.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteBusy}>Hủy</AlertDialogCancel>
						<AlertDialogAction disabled={deleteBusy} onClick={() => void confirmDelete()}>
							{deleteBusy ? 'Đang xóa…' : 'Xóa'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
