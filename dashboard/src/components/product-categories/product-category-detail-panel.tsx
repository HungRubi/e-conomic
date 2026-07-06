import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ArchiveIcon,
	ArrowLeftIcon,
	BoxIcon,
	CalendarClockIcon,
	CopyIcon,
	FolderTreeIcon,
	HashIcon,
	ImageIcon,
	LayersIcon,
	ListOrderedIcon,
	PackageIcon,
	RocketIcon,
	TextIcon,
	Trash2Icon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
	archiveProductCategory,
	deleteProductCategory,
	fetchAllProductCategories,
	publishProductCategory,
	updateProductCategory,
	type AdminProductCategoryRow,
} from '@/api/admin-product-categories';
import { fetchProducts, type AdminProductRow } from '@/api/admin-products';
import { uploadProductImage } from '@/api/admin-products';
import { AuthApiError } from '@/auth/auth-api';
import { useAuth } from '@/auth/auth-context';
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
import { CONTENT_STATUS_BADGE } from '@/lib/status-styles';
import { categoryBreadcrumb, parentChoicesForCategoryForm } from '@/lib/product-category-helpers';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<AdminProductCategoryRow['status'], string> = {
	DRAFT: 'Nháp',
	ACTIVE: 'Đang hiển thị',
	ARCHIVED: 'Lưu trữ',
};

const LEVEL_LABEL: Record<number, string> = {
	0: 'Cấp gốc',
	1: 'Cấp 1',
	2: 'Cấp 2',
};

const ROOT_PARENT_VALUE = '__root__';

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

export function ProductCategoryDetailPanel() {
	const params = useParams<{ categoryId: string }>();
	const categoryId = params.categoryId ?? '';

	const allCategoriesQuery = useQuery({
		queryKey: ['admin-product-categories', 'all'],
		queryFn: () => fetchAllProductCategories({ status: 'all', sortBy: 'name', sortOrder: 'asc' }),
	});

	const all = allCategoriesQuery.data ?? [];
	const category = all.find(c => c.id === categoryId) ?? null;

	if (!categoryId) return <NotFoundState />;
	if (allCategoriesQuery.isLoading) return <DetailSkeleton />;
	if (allCategoriesQuery.isError) {
		const error = allCategoriesQuery.error;
		return (
			<div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
				<p className='text-sm font-medium text-destructive'>
					{error instanceof Error ? error.message : 'Không tải được danh mục'}
				</p>
				<Button asChild type='button' variant='ghost'>
					<Link to='/products/categories'>
						<ArrowLeftIcon className='mr-1 size-4' />
						Về danh sách
					</Link>
				</Button>
			</div>
		);
	}
	if (!category) return <NotFoundState />;

	return <DetailContent category={category} all={all} onChanged={() => void allCategoriesQuery.refetch()} />;
}

function DetailContent({
	category,
	all,
	onChanged,
}: {
	category: AdminProductCategoryRow;
	all: AdminProductCategoryRow[];
	onChanged: () => void;
}) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const isAdmin = user?.role === 'ADMIN';

	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const [actionBusy, setActionBusy] = React.useState<'publish' | 'archive' | 'delete' | null>(null);

	async function patch(body: Parameters<typeof updateProductCategory>[1]) {
		await updateProductCategory(category.id, body);
		onChanged();
	}

	async function onPublish() {
		setActionBusy('publish');
		try {
			await publishProductCategory(category.id);
			toast.success('đã xuất bản danh mục');
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
			await archiveProductCategory(category.id);
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
			await deleteProductCategory(category.id);
			toast.success('đã xoá danh mục');
			navigate('/products/categories');
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không xoá được');
			setActionBusy(null);
		}
	}

	const breadcrumb = categoryBreadcrumb(category, all);
	const parentRow = category.parentId ? (all.find(c => c.id === category.parentId) ?? null) : null;
	const childCount = all.filter(c => c.parentId === category.id).length;

	const parentChoices = parentChoicesForCategoryForm(all, category);
	const parentOptions = [
		{ value: ROOT_PARENT_VALUE, label: '(Không — cấp gốc)' },
		...parentChoices.map(c => ({
			value: c.id,
			label: `${LEVEL_LABEL[c.level] ?? `Cấp ${c.level}`} · ${categoryBreadcrumb(c, all)}`,
		})),
	];

	return (
		<div className='space-y-4'>
			<header className='flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between'>
				<div className='flex min-w-0 items-start gap-3'>
					<Button
						type='button'
						variant='ghost'
						size='icon'
						className='shrink-0'
						onClick={() => navigate('/products/categories')}
						aria-label='Quay lại danh sách danh mục'
					>
						<ArrowLeftIcon className='size-4' />
					</Button>
					<div className='min-w-0'>
						<p className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
							Danh mục sản phẩm
						</p>
						<div className='mt-1 flex items-center gap-2'>
							<h1 className='truncate text-lg font-semibold tracking-tight'>{category.name}</h1>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='size-7 text-muted-foreground'
								onClick={() => copyToClipboard(category.slug, 'đã sao chép slug')}
								aria-label='Sao chép slug'
							>
								<CopyIcon className='size-3.5' />
							</Button>
						</div>
						<div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
							<span className='inline-flex items-center gap-1 font-mono' translate='no'>
								<HashIcon className='size-3' aria-hidden />
								{category.slug}
							</span>
							<span aria-hidden>·</span>
							<span className='inline-flex items-center gap-1'>
								<CalendarClockIcon className='size-3.5' aria-hidden />
								Tạo {formatDateTime(category.createdAt)}
							</span>
							{category.updatedAt !== category.createdAt ? (
								<>
									<span aria-hidden>·</span>
									<span>Cập nhật {formatDateTime(category.updatedAt)}</span>
								</>
							) : null}
						</div>
					</div>
				</div>
				<div className='flex flex-wrap items-center gap-2'>
					<Badge variant={CONTENT_STATUS_BADGE[category.status]}>{STATUS_LABEL[category.status]}</Badge>
					<Badge variant='outline'>{LEVEL_LABEL[category.level] ?? `Cấp ${category.level}`}</Badge>
				</div>
			</header>

			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'>
				<div className='min-w-0 space-y-4'>
					<HeroBanner category={category} breadcrumb={breadcrumb} parent={parentRow} />

					<CoverImageSection category={category} onChanged={onChanged} />

					<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={TextIcon} title='Thông tin chính' />
						<div className='mt-3 space-y-1'>
							<EditableField
								label='Tên danh mục'
								type='text'
								value={category.name}
								onSave={v => patch({ name: v })}
								validate={v => (v.trim() ? null : 'Tên không được trống')}
							/>
							<EditableField
								label='Tên tiếng Anh'
								type='text'
								value={category.enName ?? ''}
								onSave={v => patch({ enName: v.trim() ? v : null })}
								emptyHint='Chưa có — click để thêm'
							/>
							<EditableField
								label='Slug (URL)'
								type='text'
								value={category.slug}
								onSave={v => patch({ slug: v })}
								validate={v =>
									/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.trim()) ? null : 'Slug chỉ gồm a-z, 0-9 và dấu -'
								}
								displayClassName='font-mono text-xs'
							/>
							<EditableField
								label='Mô tả'
								type='textarea'
								rows={5}
								value={category.description ?? ''}
								onSave={v => patch({ description: v.trim() ? v : null })}
								emptyHint='Chưa có mô tả — click để thêm'
							/>
						</div>
					</section>

					<CategoryProductsSection category={category} />
				</div>

				<aside className='lg:sticky lg:top-4 lg:self-start'>
					<div className='space-y-4'>
						<section className='overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10'>
							<div className='border-b border-border/60 p-4'>
								<SectionHeading icon={RocketIcon} title='Thao tác nhanh' />
							</div>
							<div className='flex flex-col gap-2 p-4'>
								<div className='flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2 text-sm'>
									<span className='text-muted-foreground'>Trạng thái hiển thị</span>
									<Badge variant={CONTENT_STATUS_BADGE[category.status]}>
										{STATUS_LABEL[category.status]}
									</Badge>
								</div>
								{category.status !== 'ACTIVE' ? (
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
								{category.status !== 'ARCHIVED' ? (
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
								{isAdmin ? (
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

						<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={FolderTreeIcon} title='Phân cấp' />
							<div className='mt-3 space-y-1'>
								<EditableField
									label='Danh mục cha'
									type='select'
									value={category.parentId ?? ROOT_PARENT_VALUE}
									options={parentOptions}
									onSave={async v => {
										await patch({ parentId: v === ROOT_PARENT_VALUE ? null : v });
									}}
								/>
								<EditableField
									label='Thứ tự hiển thị'
									type='number'
									value={category.sortOrder}
									onSave={v => patch({ sortOrder: v ?? 0 })}
									min={0}
									validate={v => (v != null && v >= 0 ? null : 'Phải là số ≥ 0')}
								/>
								<EditableField
									label='Trạng thái'
									type='select'
									value={category.status}
									options={[
										{ value: 'DRAFT', label: 'Nháp' },
										{ value: 'ACTIVE', label: 'Đang hiển thị' },
										{ value: 'ARCHIVED', label: 'Lưu trữ' },
									]}
									onSave={v => patch({ status: v as AdminProductCategoryRow['status'] })}
								/>
							</div>
						</section>

						<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={ListOrderedIcon} title='Số liệu' />
							<dl className='mt-2 space-y-2 text-sm'>
								<div className='flex items-center justify-between'>
									<dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
										<LayersIcon className='size-3.5' aria-hidden />
										Cấp độ
									</dt>
									<dd className='font-semibold tabular-nums'>{LEVEL_LABEL[category.level] ?? category.level}</dd>
								</div>
								<div className='flex items-center justify-between'>
									<dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
										<FolderTreeIcon className='size-3.5' aria-hidden />
										Danh mục con
									</dt>
									<dd className='font-semibold tabular-nums'>{childCount}</dd>
								</div>
								<div className='flex items-center justify-between'>
									<dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
										<BoxIcon className='size-3.5' aria-hidden />
										Sản phẩm trong cây
									</dt>
									<dd className='font-semibold tabular-nums'>{category.productCount ?? '—'}</dd>
								</div>
							</dl>
						</section>
					</div>
				</aside>
			</div>

			<AlertDialog open={confirmDelete} onOpenChange={open => !actionBusy && setConfirmDelete(open)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xoá danh mục này?</AlertDialogTitle>
						<AlertDialogDescription>
							Chỉ xoá được khi danh mục không còn con.{' '}
							<span className='font-medium text-foreground'>{category.name}</span> sẽ bị xoá vĩnh viễn.
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

function HeroBanner({
	category,
	breadcrumb,
	parent,
}: {
	category: AdminProductCategoryRow;
	breadcrumb: string;
	parent: AdminProductCategoryRow | null;
}) {
	const hasImage = Boolean(category.image);
	return (
		<section className='relative overflow-hidden rounded-2xl ring-1 ring-foreground/10'>
			<div
				className={cn(
					'relative h-48 w-full sm:h-56 lg:h-64',
					!hasImage && 'bg-gradient-to-br from-amber-100 via-rose-50 to-sky-100 dark:from-amber-950/40 dark:via-rose-950/30 dark:to-sky-950/40'
				)}
			>
				{hasImage ? (
					<img
						src={publicAssetUrl(category.image as string)}
						alt={category.name}
						className='h-full w-full object-cover'
						loading='lazy'
					/>
				) : (
					<div className='flex h-full w-full items-center justify-center'>
						<ImageIcon className='size-10 text-muted-foreground/40' aria-hidden />
					</div>
				)}
				<div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-transparent p-5 text-background dark:text-foreground'>
					<p className='text-xs font-semibold uppercase tracking-[0.24em] opacity-80'>
						{breadcrumb || category.name}
					</p>
					<h2 className='mt-1.5 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl'>
						{category.name}
					</h2>
					{parent ? (
						<p className='mt-1.5 text-xs opacity-80'>
							Thuộc{' '}
							<Link
								to={`/products/categories/${parent.id}`}
								className='font-medium underline-offset-2 hover:underline'
							>
								{parent.name}
							</Link>
						</p>
					) : null}
				</div>
			</div>
		</section>
	);
}

function CoverImageSection({
	category,
	onChanged,
}: {
	category: AdminProductCategoryRow;
	onChanged: () => void;
}) {
	const [busy, setBusy] = React.useState(false);
	const [uploadBusy, setUploadBusy] = React.useState(false);

	async function setImage(url: string | null) {
		setBusy(true);
		try {
			await updateProductCategory(category.id, { image: url });
			toast.success(url ? 'đã cập nhật ảnh' : 'đã gỡ ảnh đại diện');
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không cập nhật được');
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading
				icon={ImageIcon}
				title='Ảnh đại diện'
				hint='Hiển thị làm banner trên website và thumbnail.'
			/>
			<div className='mt-3'>
				<SingleImageUrlDropzone
					label={
						category.image
							? 'Kéo thả hoặc bấm để thay ảnh'
							: 'Kéo thả hoặc bấm để chọn ảnh đại diện'
					}
					hint='JPEG, PNG, WebP, GIF, SVG'
					url={category.image ?? ''}
					disabled={busy}
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
				{category.image ? (
					<div className='mt-3 flex justify-end'>
						<Button
							type='button'
							variant='ghost'
							size='sm'
							onClick={() => void setImage(null)}
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

function CategoryProductsSection({ category }: { category: AdminProductCategoryRow }) {
	const productsQuery = useQuery({
		queryKey: ['admin-products-by-category', category.slug],
		queryFn: () =>
			fetchProducts({
				limit: 100,
				offset: 0,
				sortBy: 'sortOrder',
				sortOrder: 'asc',
				status: 'all',
			}).then(res => ({
				...res,
				items: res.items.filter(p => (p.categories ?? []).some(c => c.slug === category.slug || c.id === category.id)),
			})),
	});

	const items = productsQuery.data?.items ?? [];
	const total = items.length;

	return (
		<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading
				icon={PackageIcon}
				title='Sản phẩm trong danh mục'
				hint={total === 0 ? 'Chưa có sản phẩm gán vào danh mục này.' : `${total} sản phẩm`}
				action={
					<Button asChild type='button' variant='outline' size='sm'>
						<Link to={`/products?categorySlug=${category.slug}`}>Mở danh sách sản phẩm</Link>
					</Button>
				}
			/>
			<div className='mt-3'>
				{productsQuery.isLoading ? (
					<div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className='h-24 w-full rounded-lg' />
						))}
					</div>
				) : productsQuery.isError ? (
					<p className='rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive'>
						Không tải được sản phẩm.
					</p>
				) : total === 0 ? (
					<div className='rounded-lg border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground'>
						<PackageIcon className='mx-auto mb-2 size-6 opacity-50' aria-hidden />
						Chưa có sản phẩm nào gán vào danh mục này.
					</div>
				) : (
					<div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
						{items.map(p => (
							<ProductMiniCard key={p.id} product={p} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}

function ProductMiniCard({ product }: { product: AdminProductRow }) {
	const cover = product.images?.[0] ?? product.image;
	return (
		<Link
			to={`/products/${product.id}`}
			className='group flex gap-3 rounded-lg border border-border/60 bg-background p-2.5 transition hover:border-foreground/30 hover:bg-muted/30'
		>
			<div className='size-16 shrink-0 overflow-hidden rounded-md bg-muted'>
				{cover ? (
					<img
						src={publicAssetUrl(cover)}
						alt={product.name}
						className='h-full w-full object-cover'
						loading='lazy'
					/>
				) : (
					<div className='flex h-full w-full items-center justify-center'>
						<ImageIcon className='size-5 text-muted-foreground/40' aria-hidden />
					</div>
				)}
			</div>
			<div className='min-w-0 flex-1'>
				<div className='flex items-start justify-between gap-2'>
					<p className='line-clamp-2 text-sm font-medium leading-tight group-hover:text-foreground'>
						{product.name}
					</p>
					<Badge variant={CONTENT_STATUS_BADGE[product.status]} className='shrink-0 text-[10px]'>
						{product.status === 'ACTIVE' ? 'Đang bán' : product.status === 'DRAFT' ? 'Nháp' : 'Lưu trữ'}
					</Badge>
				</div>
				<p className='mt-1 truncate text-xs text-muted-foreground'>
					{product.priceLabel || '—'} · đã bán {product.sold}
				</p>
			</div>
		</Link>
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
		<div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-10 text-center'>
			<p className='text-sm font-medium'>Không tìm thấy danh mục</p>
			<p className='text-xs text-muted-foreground'>Có thể đã bị xoá hoặc URL không đúng.</p>
			<Button asChild type='button' variant='outline'>
				<Link to='/products/categories'>
					<ArrowLeftIcon className='mr-1 size-4' />
					Về danh sách
				</Link>
			</Button>
		</div>
	);
}

function DetailSkeleton() {
	return (
		<div className='space-y-4'>
			<div className='flex items-center gap-3 border-b border-border/60 pb-4'>
				<Skeleton className='size-9 rounded-md' />
				<div className='space-y-2'>
					<Skeleton className='h-3 w-24' />
					<Skeleton className='h-5 w-48' />
				</div>
			</div>
			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]'>
				<div className='space-y-4'>
					<Skeleton className='h-56 w-full rounded-2xl' />
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
