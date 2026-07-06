import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import {
	archiveStaticPage,
	createStaticPage,
	deleteStaticPage,
	fetchStaticPages,
	publishStaticPage,
	type AdminStaticPageRow,
	type StaticPageWriteBody,
} from '@/api/admin-static-pages';
import { uploadProductImage } from '@/api/admin-products';
import { AuthApiError } from '@/auth/auth-api';
import { SingleImageUrlDropzone } from '@/components/common/single-image-url-dropzone';
import { AboutPageVisualEditor } from '@/components/static-pages/about-page-visual-editor';
import { TableEmptyStateRow } from '@/components/table-empty-state-row';
import { TableErrorStateRow } from '@/components/table-error-state-row';
import { TableRowsSkeleton } from '@/components/list-skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONTENT_STATUS_BADGE } from '@/lib/status-styles';
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
import {
	Drawer,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerPageContent,
	DrawerTitle,
} from '@/components/ui/drawer';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { fmtUserDate } from '@/components/users/user-table-shared';
import { useEntityCrud } from '@/hooks/use-permission';
import { usePaginatedStaticPageList, type StaticPageListSortKey } from '@/hooks/use-paginated-static-page-list';
import { digitsOnly } from '@/lib/form-field-ui';
import {
	aboutContentToApiRecord,
	defaultAboutPageContent,
	parseAboutPageContent,
	type AboutContentV1,
} from '@/lib/about-page-admin';
import {
	Archive,
	ArrowUpRight,
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisVerticalIcon,
	GripVerticalIcon,	PlusIcon,
	Send,
	Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const listStaticPages = (params: Parameters<typeof fetchStaticPages>[0]) => fetchStaticPages(params);

const STATUS_LABEL: Record<AdminStaticPageRow['status'], string> = {
	DRAFT: 'Nháp',
	ACTIVE: 'Đang hiển thị',
	ARCHIVED: 'Lưu trữ',
};

const STATIC_PAGE_SLUG_FILTERS = [
	{ slug: '', label: 'Tất cả' },
	{ slug: 'home', label: 'Trang chủ' },
	{ slug: 'about', label: 'About' },
	{ slug: 'shipping', label: 'Giao hàng' },
	{ slug: 'returns', label: 'Đổi trả' },
	{ slug: 'privacy', label: 'Bảo mật' },
	{ slug: 'terms', label: 'Điều khoản' },
] as const;

const POLICY_CONTENT_TEMPLATE = {
	navLabel: 'Giao hàng',
	title: 'Chính sách giao hàng',
	description: 'Thông tin giao hàng và xử lý đơn.',
	eyebrow: 'Chính sách',
	updatedLabel: 'Cập nhật',
	updatedAt: '11/05/2026',
	intro: 'Tóm tắt chính sách.',
	highlights: ['Xử lý đơn 1-2 ngày', 'Đóng gói cẩn thận', 'Theo dõi vận đơn'],
	sections: [
		{
			title: 'Thời gian xử lý',
			body: 'Nội dung chi tiết.',
		},
	],
	cta: {
		title: 'Cần hỗ trợ thêm?',
		description: 'Liên hệ Miue.healing để được tư vấn.',
		label: 'Liên hệ',
	},
};

function prettyJson(value: unknown): string {
	return JSON.stringify(value, null, 2);
}

function parseContent(raw: string): Record<string, unknown> {
	const parsed = JSON.parse(raw) as unknown;
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new Error('Nội dung JSON phải là object');
	}
	return parsed as Record<string, unknown>;
}

function defaultContentForSlug(slug: string): string {
	return prettyJson(slug === 'about' ? defaultAboutPageContent() : POLICY_CONTENT_TEMPLATE);
}

type UploadSlot = 'cover' | 'og' | 'bannerMobile';

export function StaticPagesAdminPanel() {
	const navigate = useNavigate();
	const crud = useEntityCrud('staticPages');

	const [qInput, setQInput] = React.useState('');
	const [slugFilter, setSlugFilter] = React.useState('');
	const [languageFilter, setLanguageFilter] = React.useState('vi');
	const [sortBy, setSortBy] = React.useState<StaticPageListSortKey>('sortOrder');
	const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
	const [pageSize, setPageSize] = React.useState(10);
	const [statusFilter, setStatusFilter] = React.useState<'all' | AdminStaticPageRow['status']>('all');

	const { rows, total, loading, error, page, setPage, refetch, upsertRow, removeRow } = usePaginatedStaticPageList(
		listStaticPages,
		qInput,
		slugFilter,
		languageFilter,
		sortBy,
		sortOrder,
		pageSize,
		statusFilter
	);

	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [formSlug, setFormSlug] = React.useState('about');
	const [formLanguage, setFormLanguage] = React.useState('vi');
	const [formTitle, setFormTitle] = React.useState('');
	const [formDescription, setFormDescription] = React.useState('');
	const [formSeoTitle, setFormSeoTitle] = React.useState('');
	const [formSeoDescription, setFormSeoDescription] = React.useState('');
	const [formCoverImageUrl, setFormCoverImageUrl] = React.useState('');
	const [formBannerImageMobileUrl, setFormBannerImageMobileUrl] = React.useState('');
	const [formOgImageUrl, setFormOgImageUrl] = React.useState('');
	const [formContent, setFormContent] = React.useState(defaultContentForSlug('about'));
	const [formStatus, setFormStatus] = React.useState<AdminStaticPageRow['status']>('DRAFT');
	const [formSortOrder, setFormSortOrder] = React.useState('0');
	const [formBusy, setFormBusy] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);
	const [aboutDraft, setAboutDraft] = React.useState<AboutContentV1 | null>(null);
	const [aboutContentTab, setAboutContentTab] = React.useState<'visual' | 'json'>('visual');
	const [aboutInlineUploadBusy, setAboutInlineUploadBusy] = React.useState(false);
	const [uploadSlot, setUploadSlot] = React.useState<UploadSlot | null>(null);
	const [deleteTarget, setDeleteTarget] = React.useState<AdminStaticPageRow | null>(null);
	const [deleteBusy, setDeleteBusy] = React.useState(false);

	const uploadBusy = uploadSlot !== null;
	const formDisabled = formBusy || uploadBusy || aboutInlineUploadBusy;
	const isAboutSlug = formSlug.trim() === 'about';

	/** Đổi slug trong form tạo mới: tránh useEffect + setState (cảnh báo cascading render). */
	function onFormSlugInputChange(nextRaw: string) {
		const prevTrim = formSlug.trim();
		const nextTrim = nextRaw.trim();
		setFormSlug(nextRaw);

		if (prevTrim === 'about' && nextTrim !== 'about') {
			setAboutDraft(null);
			setFormContent(defaultContentForSlug(nextTrim || 'shipping'));
			return;
		}
		if (prevTrim !== 'about' && nextTrim === 'about') {
			let d: AboutContentV1;
			try {
				const parsed = JSON.parse(formContent) as unknown;
				d = parseAboutPageContent(parsed) ?? defaultAboutPageContent();
			} catch {
				d = defaultAboutPageContent();
			}
			setAboutDraft(d);
			setFormContent(prettyJson(d));
		}
	}

	async function uploadAboutImage(file: File): Promise<string> {
		setAboutInlineUploadBusy(true);
		try {
			const { url } = await uploadProductImage(file);
			return url;
		} finally {
			setAboutInlineUploadBusy(false);
		}
	}

	function openCreate(slug = 'about') {
		setAboutContentTab('visual');
		setFormSlug(slug);
		setFormLanguage(languageFilter || 'vi');
		setFormTitle(slug === 'about' ? 'Về Miue.healing' : 'Chính sách');
		setFormDescription('');
		setFormSeoTitle('');
		setFormSeoDescription('');
		setFormCoverImageUrl(slug === 'about' ? '/images/about/1.jpg' : '');
		setFormBannerImageMobileUrl('');
		setFormOgImageUrl(slug === 'about' ? '/images/about/1.jpg' : '');
		if (slug === 'about') {
			const d = defaultAboutPageContent();
			setAboutDraft(d);
			setFormContent(prettyJson(d));
		} else {
			setAboutDraft(null);
			setFormContent(defaultContentForSlug(slug));
		}
		setFormStatus('DRAFT');
		setFormSortOrder(slug === 'about' ? '0' : '10');
		setFormError(null);
		setDrawerOpen(true);
	}

	function openDetail(row: AdminStaticPageRow) {
		navigate(`/content/pages/${row.id}`);
	}

	function applyTemplate(kind: 'about' | 'policy') {
		if (kind === 'about') {
			setFormSlug('about');
			const d = defaultAboutPageContent();
			setAboutDraft(d);
			setFormContent(prettyJson(d));
			return;
		}
		setFormSlug(formSlug === 'about' ? 'shipping' : formSlug);
		setAboutDraft(null);
		setFormContent(prettyJson(POLICY_CONTENT_TEMPLATE));
	}

	function applyAboutJsonFromTextarea() {
		try {
			const parsed = JSON.parse(formContent) as unknown;
			const d = parseAboutPageContent(parsed);
			if (!d) {
				toast.error('JSON không đúng schema trang About (version 1, hero, sections…)');
				return;
			}
			setAboutDraft(d);
			setFormContent(prettyJson(d));
			toast.success('đã áp dụng JSON');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'JSON không hợp lệ');
		}
	}

	function buildBody(): StaticPageWriteBody {
		let content: Record<string, unknown>;
		if (formSlug.trim() === 'about') {
			const draft = aboutDraft ?? defaultAboutPageContent();
			content = aboutContentToApiRecord(draft);
		} else {
			content = parseContent(formContent);
		}
		return {
			slug: formSlug.trim(),
			language: formLanguage.trim() || 'vi',
			title: formTitle.trim(),
			description: formDescription.trim() || null,
			seoTitle: formSeoTitle.trim() || null,
			seoDescription: formSeoDescription.trim() || null,
			coverImageUrl: formCoverImageUrl.trim() || null,
			bannerImageMobileUrl: formBannerImageMobileUrl.trim() || null,
			ogImageUrl: formOgImageUrl.trim() || null,
			content,
			status: formStatus,
			sortOrder: Number.parseInt(formSortOrder, 10) || 0,
		};
	}

	async function onUpload(slot: UploadSlot, file: File) {
		setUploadSlot(slot);
		try {
			const { url } = await uploadProductImage(file);
			if (slot === 'cover') setFormCoverImageUrl(url);
			else if (slot === 'bannerMobile') setFormBannerImageMobileUrl(url);
			else setFormOgImageUrl(url);
			toast.success('đã tải ảnh lên');
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Tải ảnh thất bại');
		} finally {
			setUploadSlot(null);
		}
	}

	async function submitForm() {
		if (!formSlug.trim()) {
			toast.error('Nhập slug');
			return;
		}
		if (!formTitle.trim()) {
			toast.error('Nhập tiêu đề');
			return;
		}

		let body: StaticPageWriteBody;
		try {
			body = buildBody();
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'JSON content không hợp lệ';
			setFormError(msg);
			toast.error(msg);
			return;
		}

		setFormBusy(true);
		setFormError(null);
		try {
			const created = await createStaticPage(body);
			toast.success('đã tạo trang tĩnh');
			upsertRow(created);
			setDrawerOpen(false);
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
		if (!crud.canDelete || !deleteTarget) return;
		setDeleteBusy(true);
		try {
			await deleteStaticPage(deleteTarget.id);
			removeRow(deleteTarget.id);
			toast.success('đã xóa trang tĩnh');
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
					<h1 className='text-lg font-semibold tracking-tight'>Trang tĩnh</h1>
					<p className='text-muted-foreground text-sm'>
						Click một trang để mở chi tiết và chỉnh sửa.
						{!loading && !error ? (
							<span className='text-foreground/80'> · {total} bản ghi trên API hiện tại</span>
						) : null}
					</p>
				</div>
				{crud.canCreate ? (
					<div className='flex flex-wrap gap-2'>
						<Button type='button' size='sm' variant='outline' onClick={() => openCreate('shipping')}>
							Thêm chính sách
						</Button>
						<Button type='button' size='sm' className='gap-1.5' onClick={() => openCreate('about')}>
							<PlusIcon className='size-4' />
							Thêm trang
						</Button>
					</div>
				) : null}
			</div>

			<div className='flex flex-wrap gap-2'>
				{STATIC_PAGE_SLUG_FILTERS.map(item => {
					const active = slugFilter === item.slug;
					return (
						<Button
							key={item.slug || 'all'}
							type='button'
							size='sm'
							variant={active ? 'default' : 'outline'}
							onClick={() => setSlugFilter(item.slug)}
						>
							{item.label}
						</Button>
					);
				})}
			</div>

			<div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end'>
				<div className='min-w-48 flex-1'>
					<Input
						id='static-page-q'
						placeholder='Tìm theo tiêu đề, slug, mô tả…'
						value={qInput}
						onChange={e => setQInput(e.target.value)}
						autoComplete='off'
					/>
				</div>
				<div className='flex flex-wrap gap-2'>
					<Select value={languageFilter || 'vi'} onValueChange={v => setLanguageFilter(v === 'vi' ? '' : v)}>
						<SelectTrigger className='w-32'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
												<SelectItem value='vi'>Tiếng Việt</SelectItem>
							<SelectItem value='en'>English</SelectItem>
						</SelectContent>
					</Select>
					<Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
						<SelectTrigger className='w-40'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>Tất cả</SelectItem>
							<SelectItem value='DRAFT'>Nháp</SelectItem>
							<SelectItem value='ACTIVE'>Đang hiển thị</SelectItem>
							<SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={v => setSortBy(v as StaticPageListSortKey)}>
						<SelectTrigger className='w-40'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value='sortOrder'>Thứ tự</SelectItem>
								<SelectItem value='updatedAt'>Cập nhật</SelectItem>
								<SelectItem value='createdAt'>Ngày tạo</SelectItem>
								<SelectItem value='title'>Tiêu đề</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					<Select value={sortOrder} onValueChange={v => setSortOrder(v as 'asc' | 'desc')}>
						<SelectTrigger className='w-32'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='asc'>Tăng dần</SelectItem>
							<SelectItem value='desc'>Giảm dần</SelectItem>
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
							<TableHead className='w-10'><span className='sr-only'>Kéo</span></TableHead>
							<TableHead>Trang</TableHead>
							<TableHead className='w-24'>Ngôn ngữ</TableHead>
							<TableHead className='w-32'>Trạng thái</TableHead>
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
							<TableEmptyStateRow
								colSpan={7}
								title={total === 0 ? 'Chưa có trang trên API này' : 'Không có dữ liệu'}
								description={
									total === 0
										? 'Chạy seed trên cùng DATABASE_URL với backend: cd server-miuehealing && npm run prisma:seed'
										: 'Thử đổi bộ lọc slug / ngôn ngữ / trạng thái.'
								}
							/>
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
									<TableCell className='max-w-[min(44vw,24rem)]'>
										<div className='font-medium'>{row.title}</div>
									</TableCell>
									<TableCell className='font-mono text-xs'>{row.language}</TableCell>
									<TableCell>
										<Badge variant={CONTENT_STATUS_BADGE[row.status]}>
											{STATUS_LABEL[row.status]}
										</Badge>
									</TableCell>
									<TableCell className='text-muted-foreground hidden text-sm sm:table-cell'>
										{fmtUserDate(row.updatedAt)}
									</TableCell>
									<TableCell className='text-right' onClick={e => e.stopPropagation()}>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button type='button' variant='ghost' size='icon' className='size-8 text-muted-foreground' aria-label='Thao tác'>
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
																	const r = await publishStaticPage(row.id);
																	upsertRow(r);
																	toast.success('đã xuất bản');
																	void refetch({ silent: true });
																} catch (e) {
																	toast.error(e instanceof AuthApiError ? e.message : 'Thất bại');
																}
															}}
														>
															<Send className='size-4' />
															Xuất bản
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={async () => {
																try {
																	const r = await archiveStaticPage(row.id);
																	upsertRow(r);
																	toast.success('đã lưu trữ');
																	void refetch({ silent: true });
																} catch (e) {
																	toast.error(e instanceof AuthApiError ? e.message : 'Thất bại');
																}
															}}
														>
															<Archive className='size-4' />
															Lưu trữ
														</DropdownMenuItem>
													</>
												) : null}
												{crud.canDelete && !['home', 'about'].includes(row.slug) ? (
													<>
														<DropdownMenuSeparator />
														<DropdownMenuItem variant='destructive' onClick={() => setDeleteTarget(row)}>
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
					<Button type='button' variant='outline' size='icon' className='size-8' disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
						<ChevronLeftIcon className='size-4' />
					</Button>
					<span>
						Trang {page + 1} / {pageCount}
					</span>
					<Button type='button' variant='outline' size='icon' className='size-8' disabled={page + 1 >= pageCount} onClick={() => setPage(p => p + 1)}>
						<ChevronRightIcon className='size-4' />
					</Button>
				</div>
			</div>

			<Drawer open={drawerOpen} onOpenChange={setDrawerOpen} modal shouldScaleBackground={false}>
				<DrawerPageContent className='flex flex-col gap-0 p-0' showCloseButton>
					<DrawerHeader className='shrink-0 border-b px-6 py-5 pr-16 text-left'>
						<DrawerTitle>Trang tĩnh mới</DrawerTitle>
						<DrawerDescription className='mt-1.5 max-w-2xl'>
							Trang <span className='font-mono'>about</span> có form trực quan (hero và từng phiên). Các slug khác vẫn dùng JSON cho chính sách. Sau khi tạo bạn có thể mở chi tiết để chỉnh sửa từng trường inline.
						</DrawerDescription>
					</DrawerHeader>

					<div className='min-h-0 flex-1 overflow-y-auto'>
						<div className='mx-auto w-full max-w-6xl px-6 py-6 pb-8'>
							{formError ? (
								<p className='text-destructive bg-destructive/10 mb-6 rounded-md px-3 py-2 text-sm'>{formError}</p>
							) : null}

							<FieldGroup className='flex flex-col gap-8'>
								<section className='space-y-4'>
									<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>Nhận diện</p>
									<div className='grid gap-4 lg:grid-cols-3'>
										<Field>
											<FieldLabel htmlFor='sp-slug'>Slug</FieldLabel>
											<Input
												id='sp-slug'
												className='mt-1.5 font-mono text-sm'
												value={formSlug}
												onChange={e => onFormSlugInputChange(e.target.value)}
												disabled={formDisabled}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor='sp-language'>Ngôn ngữ</FieldLabel>
											<Input id='sp-language' className='mt-1.5 font-mono text-sm' value={formLanguage} onChange={e => setFormLanguage(e.target.value)} disabled={formDisabled} />
										</Field>
										<Field>
											<FieldLabel htmlFor='sp-sort'>Thứ tự</FieldLabel>
											<Input id='sp-sort' className='mt-1.5' inputMode='numeric' pattern='[0-9]*' value={formSortOrder} onChange={e => setFormSortOrder(digitsOnly(e.target.value))} disabled={formDisabled} />
										</Field>
									</div>
									<Field>
										<FieldLabel htmlFor='sp-title'>Tiêu đề</FieldLabel>
										<Input id='sp-title' className='mt-1.5' value={formTitle} onChange={e => setFormTitle(e.target.value)} disabled={formDisabled} />
									</Field>
									<Field>
										<FieldLabel htmlFor='sp-description'>Mô tả</FieldLabel>
										<Textarea id='sp-description' className='mt-1.5 min-h-24' value={formDescription} onChange={e => setFormDescription(e.target.value)} disabled={formDisabled} rows={4} />
									</Field>
								</section>

								<section className='space-y-4'>
									<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>SEO</p>
									<Field>
										<FieldLabel htmlFor='sp-seo-title'>SEO title</FieldLabel>
										<Input id='sp-seo-title' className='mt-1.5' value={formSeoTitle} onChange={e => setFormSeoTitle(e.target.value)} disabled={formDisabled} />
									</Field>
									<Field>
										<FieldLabel htmlFor='sp-seo-description'>SEO description</FieldLabel>
										<Textarea id='sp-seo-description' className='mt-1.5 min-h-24' value={formSeoDescription} onChange={e => setFormSeoDescription(e.target.value)} disabled={formDisabled} rows={4} />
									</Field>
								</section>

								<section className='space-y-4'>
									<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>Ảnh (tuỳ chọn)</p>
									<div className='grid gap-4 lg:grid-cols-3'>
										<Field>
											<FieldLabel>Ảnh banner (Desktop)</FieldLabel>
											<div className='mt-1.5'>
												<SingleImageUrlDropzone
													label={formCoverImageUrl.trim() ? 'Thay ảnh banner' : 'Chọn ảnh banner'}
													hint='Desktop/tablet — 1920x1080 khuyến nghị'
													url={formCoverImageUrl}
													disabled={formDisabled}
													uploadBusy={uploadSlot === 'cover'}
													onUploadFile={f => onUpload('cover', f)}
												/>
											</div>
										</Field>
										<Field>
											<FieldLabel>Ảnh banner (Mobile)</FieldLabel>
											<div className='mt-1.5'>
												<SingleImageUrlDropzone
													label={formBannerImageMobileUrl.trim() ? 'Thay ảnh banner mobile' : 'Chọn ảnh banner mobile'}
													hint='Điện thoại — 1080x1920 khuyến nghị. Trống = dùng ảnh desktop.'
													url={formBannerImageMobileUrl}
													disabled={formDisabled}
													uploadBusy={uploadSlot === 'bannerMobile'}
													onUploadFile={f => onUpload('bannerMobile', f)}
												/>
											</div>
										</Field>
										<Field>
											<FieldLabel>Ảnh Open Graph</FieldLabel>
											<div className='mt-1.5'>
												<SingleImageUrlDropzone
													label={formOgImageUrl.trim() ? 'Thay ảnh OG' : 'Chọn ảnh OG'}
													hint='Khi share Zalo / Facebook'
													url={formOgImageUrl}
													disabled={formDisabled}
													uploadBusy={uploadSlot === 'og'}
													onUploadFile={f => onUpload('og', f)}
												/>
											</div>
										</Field>
									</div>
								</section>

								<section className='space-y-4'>
									<div className='flex flex-wrap items-center justify-between gap-2'>
										<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
											{isAboutSlug ? 'Nội dung trang About' : 'Content JSON'}
										</p>
										<div className='flex gap-2'>
											<Button type='button' variant='outline' size='sm' onClick={() => applyTemplate('about')} disabled={formDisabled}>
												Mẫu About
											</Button>
											<Button type='button' variant='outline' size='sm' onClick={() => applyTemplate('policy')} disabled={formDisabled}>
												Mẫu Policy
											</Button>
										</div>
									</div>
									{isAboutSlug ? (
										<Tabs
											value={aboutContentTab}
											onValueChange={v => {
												const next = v as 'visual' | 'json';
												setAboutContentTab(next);
												if (next === 'json') setFormContent(prettyJson(aboutDraft ?? defaultAboutPageContent()));
											}}
										>
											<TabsList>
												<TabsTrigger value='visual'>Trực quan</TabsTrigger>
												<TabsTrigger value='json'>JSON nâng cao</TabsTrigger>
											</TabsList>
											<TabsContent value='visual' className='mt-4'>
												<AboutPageVisualEditor
													value={aboutDraft ?? defaultAboutPageContent()}
													onChange={setAboutDraft}
													disabled={formDisabled}
													uploadImage={uploadAboutImage}
													uploadBusy={aboutInlineUploadBusy}
												/>
											</TabsContent>
											<TabsContent value='json' className='mt-4 flex flex-col gap-3'>
												<Field>
													<FieldLabel htmlFor='sp-content-about-json'>Chỉnh JSON thủ công</FieldLabel>
													<Textarea
														id='sp-content-about-json'
														className='mt-1.5 min-h-112 font-mono text-xs'
														value={formContent}
														onChange={e => setFormContent(e.target.value)}
														disabled={formDisabled}
														rows={20}
														spellCheck={false}
													/>
												</Field>
												<Button type='button' variant='secondary' size='sm' className='w-fit' disabled={formDisabled} onClick={applyAboutJsonFromTextarea}>
													Áp dụng JSON vào form trực quan
												</Button>
											</TabsContent>
										</Tabs>
									) : (
										<Field>
											<FieldLabel htmlFor='sp-content'>Nội dung (JSON)</FieldLabel>
											<Textarea id='sp-content' className='mt-1.5 min-h-112 font-mono text-xs' value={formContent} onChange={e => setFormContent(e.target.value)} disabled={formDisabled} rows={20} spellCheck={false} />
										</Field>
									)}
								</section>

								<section className='space-y-4'>
									<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>Trạng thái</p>
									<Field>
										<FieldLabel>Trạng thái</FieldLabel>
										<Select value={formStatus} onValueChange={v => setFormStatus(v as AdminStaticPageRow['status'])} disabled={formDisabled}>
											<SelectTrigger className='mt-1.5'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='DRAFT'>Nháp</SelectItem>
												<SelectItem value='ACTIVE'>Đang hiển thị</SelectItem>
												<SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
											</SelectContent>
										</Select>
									</Field>
								</section>
							</FieldGroup>
						</div>
					</div>

					<DrawerFooter className='mt-auto shrink-0 border-t px-0 py-0'>
						<div className='mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 sm:flex-row sm:justify-end'>
							<Button type='button' variant='outline' onClick={() => setDrawerOpen(false)} disabled={formDisabled}>
								Hủy
							</Button>
							<Button type='button' onClick={() => void submitForm()} disabled={formDisabled}>
								{formBusy ? 'Đang lưu…' : 'Tạo trang'}
							</Button>
						</div>
					</DrawerFooter>
				</DrawerPageContent>
			</Drawer>

			<AlertDialog open={Boolean(deleteTarget)} onOpenChange={open => !open && !deleteBusy && setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa trang tĩnh?</AlertDialogTitle>
						<AlertDialogDescription>
							<span className='font-medium text-foreground'>{deleteTarget?.title}</span> sẽ bị xóa vĩnh viễn.
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
