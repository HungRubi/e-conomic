import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { generateId } from '@/lib/generate-id';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ArchiveIcon,
	ArrowLeftIcon,
	CalendarClockIcon,
	CopyIcon,
	HashIcon,
	HistoryIcon,
	ImageIcon,
	InboxIcon,
	RocketIcon,
	StarIcon,
	ShoppingBagIcon,
	TagIcon,
	TextIcon,
	Trash2Icon,
	WarehouseIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
	archiveProduct,
	deleteProduct,
	getProduct,
	publishProduct,
	updateProduct,
	adjustProductStock,
	fetchInventoryTransactions,
	type AdminProductRow,
	type InventoryTransaction,
} from '@/api/admin-products';
import { fetchAllProductCategories, type AdminProductCategoryRow } from '@/api/admin-product-categories';
import { EditableField } from '@/components/common/editable-field';
import { Input } from '@/components/ui/input';
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
import { ProductImagesEditor, type ProductImageEntry } from '@/components/products/product-images-editor';
import { OgImageEditor } from '@/components/products/og-image-editor';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import {
	categoryBreadcrumb,
	productParentChildFromLeaf,
} from '@/lib/product-category-helpers';
import { CONTENT_STATUS_BADGE } from '@/lib/status-styles';

const STATUS_LABEL: Record<AdminProductRow['status'], string> = {
	DRAFT: 'Nháp',
	ACTIVE: 'Đang bán',
	ARCHIVED: 'Lưu trữ',
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

export function ProductDetailPanel() {
	const params = useParams<{ productId: string }>();
	const productId = params.productId ?? '';

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['admin-product', productId],
		queryFn: () => getProduct(productId),
		enabled: productId.length > 0,
	});

	if (!productId) return <NotFoundState />;
	if (isLoading) return <ProductDetailSkeleton />;
	if (error) return (
		<div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
			<p className='text-sm font-medium text-destructive'>{error instanceof Error ? error.message : 'Không tải được sản phẩm'}</p>
			<div className='flex gap-2'>
				<Button type='button' variant='outline' onClick={() => void refetch()}>Thử lại</Button>
				<Button asChild type='button' variant='ghost'><Link to='/products'><ArrowLeftIcon className='mr-1 size-4' />Về danh sách</Link></Button>
			</div>
		</div>
	);
	if (!data) return <NotFoundState />;

	return <ProductDetailContent product={data} onChanged={() => void refetch()} />;
}

function ProductDetailContent({ product, onChanged }: { product: AdminProductRow; onChanged: () => void }) {
	const navigate = useNavigate();
	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const [actionBusy, setActionBusy] = React.useState<'publish' | 'archive' | 'delete' | null>(null);
	const [receiveOpen, setReceiveOpen] = React.useState(false);
	const [receiveQty, setReceiveQty] = React.useState('');
	const [receiveNote, setReceiveNote] = React.useState('');
	const [receiveBusy, setReceiveBusy] = React.useState(false);
	const [_historyOpen, setHistoryOpen] = React.useState(false);
	const [_historyItems, setHistoryItems] = React.useState<InventoryTransaction[]>([]);
	const [_historyLoading, setHistoryLoading] = React.useState(false);
	const [_historyError, setHistoryError] = React.useState<string | null>(null);

	async function patch(body: Parameters<typeof updateProduct>[1]) {
		await updateProduct(product.id, body);
		onChanged();
	}

	async function openHistory() {
		setHistoryOpen(true);
		setHistoryLoading(true);
		setHistoryError(null);
		try {
			const res = await fetchInventoryTransactions('PRODUCT', product.id);
			setHistoryItems(Array.isArray(res) ? res : ((res as any)?.items ?? []));
		} catch (e) { setHistoryError(e instanceof Error ? e.message : 'Không tải được lịch sử'); }
		finally { setHistoryLoading(false); }
	}

	async function handleReceive() {
		const note = receiveNote.trim() || undefined;
		const qty = Number(receiveQty);
		if (!qty || qty <= 0) { toast.error('Nhập số lượng hợp lệ'); return; }
		setReceiveBusy(true);
		try {
			await adjustProductStock(product.id, { changeType: 'RECEIVE', quantity: qty, note });
			toast.success('Đã nhập kho');
			setReceiveOpen(false); setReceiveQty(''); setReceiveNote(''); onChanged();
		} catch (e) { toast.error(e instanceof Error ? e.message : 'Nhập kho thất bại'); }
		finally { setReceiveBusy(false); }
	}

	async function onPublish() {
		setActionBusy('publish');
		try { await publishProduct(product.id); toast.success('Đã phát hành sản phẩm'); onChanged(); }
		catch (e) { toast.error(e instanceof Error ? e.message : 'Không phát hành được'); }
		finally { setActionBusy(null); }
	}

	async function onArchive() {
		setActionBusy('archive');
		try { await archiveProduct(product.id); toast.success('Đã lưu trữ sản phẩm'); onChanged(); }
		catch (e) { toast.error(e instanceof Error ? e.message : 'Không lưu trữ được'); }
		finally { setActionBusy(null); }
	}

	async function onDelete() {
		setActionBusy('delete');
		try { await deleteProduct(product.id); toast.success('Đã xóa sản phẩm'); navigate('/products'); }
		catch (e) { toast.error(e instanceof Error ? e.message : 'Không xóa được'); setActionBusy(null); }
	}

	return (
		<div className='space-y-4'>
			<header className='rounded-xl bg-card p-4 sm:p-5 lg:p-6 ring-1 ring-foreground/10'>
				<div className='flex items-start justify-between gap-4'>
					<div className='min-w-0 flex-1'>
						<div className='flex items-center gap-1'>
							<h1 className='min-w-0 flex-1 truncate text-lg font-semibold tracking-tight' title={product.name}>
								{product.name}
							</h1>
							<Button type='button' variant='ghost' size='icon' className='size-7 text-muted-foreground'
								onClick={() => copyToClipboard(product.slug, 'Đã sao chép slug')} aria-label='Sao chép slug'>
								<CopyIcon className='size-3.5' />
							</Button>
						</div>
						<div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
							<span className='inline-flex items-center gap-1 font-mono' translate='no'>
								<HashIcon className='size-3' aria-hidden />{product.slug}
							</span>
							<span aria-hidden>·</span>
							<span className='inline-flex items-center gap-1'>
								<CalendarClockIcon className='size-3.5' aria-hidden />Tạo {formatDateTime(product.createdAt)}
							</span>
							{product.updatedAt !== product.createdAt ? (
								<><span aria-hidden>·</span><span>Cập nhật {formatDateTime(product.updatedAt)}</span></>
							) : null}
						</div>
					</div>
					<div className='flex shrink-0 flex-wrap items-center gap-2'>
						<Badge variant={CONTENT_STATUS_BADGE[product.status]}>{STATUS_LABEL[product.status]}</Badge>
					</div>
				</div>
			</header>

			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'>
				<div className='min-w-0 space-y-4'>
					{/* Images — auto-save */}
					<ImagesSection key={product.id} product={product} onChanged={onChanged} />

					<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={TextIcon} title='Thông tin chính' />
						<div className='mt-3 space-y-1'>
							<EditableField label='Tên sản phẩm' type='text' value={product.name}
								onSave={v => patch({ name: v })} validate={v => (v.trim() ? null : 'Tên không được trống')} />
							<EditableField label='Slug (URL)' type='text' value={product.slug}
								onSave={v => patch({ slug: v })}
								validate={v => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.trim()) ? null : 'Chỉ gồm a-z, 0-9 và dấu -'}
								displayClassName='font-mono text-xs' />
							<EditableField label='Mô tả' type='textarea' rows={5} value={product.description}
								onSave={v => patch({ description: v })} emptyHint='Chưa có mô tả' />
						</div>
					</section>

						<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={HashIcon} title='SEO & Open Graph' hint='Hiển thị trên công cụ tìm kiếm & mạng xã hội.' />
							<div className='mt-3 space-y-1'>
								<EditableField label='SEO Title' type='text' value={product.seoTitle ?? ''}
									onSave={v => patch({ seoTitle: v })} emptyHint='Tự động từ tên sản phẩm' />
								<EditableField label='SEO Description' type='textarea' rows={3} value={product.seoDescription ?? ''}
									onSave={v => patch({ seoDescription: v })} emptyHint='Tự động từ mô tả sản phẩm' />
								<OgImageEditor
									value={product.thumbnailLarge ?? ''}
									productImages={product.images ?? (product.thumbnailSmall ? [product.thumbnailSmall] : [])}
									onSave={v => patch({ thumbnailLarge: v || null })} />
							</div>
						</section>
						

						

						

					<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={WarehouseIcon} title='Tồn kho' />
						<div className='mt-3 space-y-1'>
							<EditableField label='Số lượng tồn' type='number' value={product.stockQuantity ?? null}
								onSave={v => patch({ stockQuantity: v ?? 0 })} min={0}
								validate={v => (v != null && v >= 0 ? null : 'Phải là số >= 0')} />
							<EditableField label='Ngưỡng báo hết hàng' type='number' value={product.lowStockThreshold ?? null}
								onSave={v => patch({ lowStockThreshold: v ?? 5 })} min={0}
								validate={v => (v != null && v >= 0 ? null : 'Phải là số >= 0')} />
						</div>
						<div className='mt-3 flex flex-wrap gap-2'>
							<Button variant='outline' size='sm' className='gap-1.5' onClick={() => setReceiveOpen(true)}>
								<InboxIcon className='size-3.5' />Nhập kho
							</Button>
							<Button variant='outline' size='sm' className='gap-1.5' onClick={() => void openHistory()}>
								<HistoryIcon className='size-3.5' />Lịch sử
							</Button>
							<Button variant='outline' size='sm' className='gap-1.5' asChild>
								<Link to={`/inventory/${product.id}`}><WarehouseIcon className='size-3.5' />Quản lý kho</Link>
							</Button>
							{product.stockQuantity !== undefined ? (
								<Badge variant={
									product.stockQuantity === 0 ? 'destructive'
									: product.stockQuantity <= (product.lowStockThreshold ?? 5) ? 'warning' : 'success'
								} className='ml-auto'>
									{product.stockQuantity === 0 ? 'Hết hàng' : `Tồn: ${product.stockQuantity}`}
								</Badge>
							) : null}
						</div>
					</section>
				</div>

				<aside className='lg:sticky lg:top-4 lg:self-start'>
					<div className='space-y-4'>
						<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={RocketIcon} title='Thao tác nhanh' />
							<div className='flex flex-col gap-2 mt-3'>
								<div className='flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2 text-sm'>
									<span className='text-muted-foreground'>Trạng thái hiển thị</span>
									<Badge variant={CONTENT_STATUS_BADGE[product.status]}>{STATUS_LABEL[product.status]}</Badge>
								</div>
								{product.status !== 'ACTIVE' ? (
									<Button type='button' onClick={() => void onPublish()} disabled={actionBusy !== null} className='justify-start'>
										<RocketIcon className='mr-1.5 size-4' />Phát hành sản phẩm
									</Button>
								) : null}
								{product.status !== 'ARCHIVED' ? (
									<Button type='button' variant='outline' onClick={() => void onArchive()} disabled={actionBusy !== null} className='justify-start'>
										<ArchiveIcon className='mr-1.5 size-4' />Lưu trữ
									</Button>
								) : null}
								<Button type='button' variant='ghost' className='justify-start text-destructive hover:bg-destructive/10 hover:text-destructive'
									onClick={() => setConfirmDelete(true)} disabled={actionBusy !== null}>
									<Trash2Icon className='mr-1.5 size-4' />Xóa vĩnh viễn
								</Button>
							</div>
						</section>

						{/* Giá bán — editable with consistent font */}
						<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={TagIcon} title='Giá bán' />
							<div className='mt-3 space-y-1'>
								<EditableField label='Giá niêm yết (VND)' type='number' value={product.priceVnd}
									onSave={v => patch({ priceVnd: v ?? 0 })} min={0}
									validate={v => (v != null && v >= 0 ? null : 'Phải là số >= 0')} suffix='₫' />
								<EditableField label='Giảm giá' type='number' value={product.discountPercent ?? null}
									onSave={v => patch({ discountPercent: v })} min={0} max={100}
									validate={v => (v != null && (v < 0 || v > 100) ? 'Phải từ 0 đến 100' : null)}
									emptyHint='Không giảm giá' suffix='%' />
								<EditableField label='Thứ tự hiển thị' type='number' value={product.sortOrder}
									onSave={v => patch({ sortOrder: v ?? 0 })} min={0} />
							</div>
						</section>

						{/* Danh mục — multi-select editable */}
						<CategorySection product={product} onChanged={onChanged} />

						{/* Số liệu — ratings, sales, images */}
						<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={ImageIcon} title='Số liệu' />
							<dl className='mt-2 space-y-2 text-sm'>
								<div className='flex items-center justify-between'>
									<dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
										<StarIcon className='size-3.5' aria-hidden />Đánh giá
									</dt>
									<dd className='font-semibold tabular-nums'>
										{(product as any).rating ?? 0} <span className='text-muted-foreground font-normal'>/ 5</span>
									</dd>
								</div>
								<div className='flex items-center justify-between'>
									<dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
										<ImageIcon className='size-3.5' aria-hidden />Số ảnh
									</dt>
									<dd className='font-semibold tabular-nums'>{product.images?.length ?? 0}</dd>
								</div>
							</dl>
								<div className='mt-3 border-t pt-3'>
									<EditableField label='Đã bán (soldCount)' type='number' value={product.soldCount ?? (product as any).sold ?? 0}
										onSave={v => patch({ soldCount: v ?? 0 })} min={0}
										emptyHint='Chưa có lượt bán' />
								</div>
						</section>
					</div>
				</aside>
			</div>

			{/* Nhập kho dialog */}
			<AlertDialog open={receiveOpen} onOpenChange={o => setReceiveOpen(o)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Nhập kho</AlertDialogTitle>
						<AlertDialogDescription>Nhập số lượng và ghi chú cho phiếu nhập kho.</AlertDialogDescription>
					</AlertDialogHeader>
					<div className='space-y-3 py-2'>
						<div className='space-y-1.5'>
							<label className='text-xs font-medium text-muted-foreground'>Số lượng</label>
							<Input inputMode='numeric' value={receiveQty}
								onChange={e => setReceiveQty(e.target.value.replace(/[^0-9]/g, ''))}
								placeholder='0' disabled={receiveBusy} />
						</div>
						<div className='space-y-1.5'>
							<label className='text-xs font-medium text-muted-foreground'>Ghi chú</label>
							<Input value={receiveNote} onChange={e => setReceiveNote(e.target.value)}
								placeholder='Nhập kho lần 1' disabled={receiveBusy} />
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={receiveBusy}>Hủy</AlertDialogCancel>
						<AlertDialogAction disabled={receiveBusy || !receiveQty} onClick={() => void handleReceive()}>
							{receiveBusy ? 'Đang nhập' : 'Xác nhận'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa sản phẩm này?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Sản phẩm <strong>{product.name}</strong> sẽ bị xóa khỏi hệ thống.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={actionBusy === 'delete'}>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={() => void onDelete()} disabled={actionBusy === 'delete'}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
							{actionBusy === 'delete' ? 'Đang xóa...' : 'Xóa'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

/* ─── ImagesSection: auto-save on change ─── */
function ImagesSection({ product, onChanged }: { product: AdminProductRow; onChanged: () => void }) {
	const initial = React.useMemo<ProductImageEntry[]>(() => {
		const urls = (product.images?.length ? product.images : [product.thumbnailSmall || product.thumbnailLarge || '']).filter(Boolean).map(u => u.trim());
		return urls.map(url => ({ id: generateId(), url }));
	}, [product.images, product.thumbnailSmall, product.thumbnailLarge]);

	const [media, setMedia] = React.useState<ProductImageEntry[]>(initial);
	const [busy, setBusy] = React.useState(false);
	const saveTimerRef = React.useRef<ReturnType<typeof setTimeout>>();

	const dirty = React.useMemo(() => {
		const a = media.map(m => m.url.trim()).filter(Boolean);
		const b = initial.map(m => m.url.trim()).filter(Boolean);
		if (a.length !== b.length) return true;
		return a.some((u, i) => u !== b[i]);
	}, [media, initial]);

	// Auto-save with debounce 800ms
	React.useEffect(() => {
		if (!dirty) return;
		if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
		saveTimerRef.current = setTimeout(() => {
			const urls = media.map(m => m.url.trim()).filter(Boolean);
			if (urls.length === 0) return;
			setBusy(true);
			updateProduct(product.id, { image: urls[0], images: urls })
				.then(() => { onChanged(); })
				.catch(e => toast.error(e instanceof Error ? e.message : 'Không lưu ảnh được'))
				.finally(() => setBusy(false));
		}, 800);
		return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
	}, [media, dirty, product.id, onChanged]);

	return (
		<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading icon={ImageIcon} title='Ảnh sản phẩm'
				action={busy ? <span className='text-xs text-muted-foreground'>Đang lưu...</span> : dirty ? <span className='text-xs text-amber-500'>Chưa lưu</span> : undefined}
			/>
			<div className='mt-3'>
				<ProductImagesEditor entries={media} onEntriesChange={setMedia} disabled={busy} />
			</div>
		</section>
	);
}

/* ─── CategorySection: multi-select editable ─── */
function CategorySection({ product, onChanged }: { product: AdminProductRow; onChanged: () => void }) {
	const [categories, setCategories] = React.useState<AdminProductCategoryRow[]>([]);
	const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
	const [busy, setBusy] = React.useState(false);

	React.useEffect(() => {
		fetchAllProductCategories({ status: 'all', sortBy: 'name', sortOrder: 'asc' })
			.then(setCategories).catch(() => {});
	}, []);

	// Sync from product data
	const productCategoryIds = React.useMemo(
		() => (product.categories ?? []).map((c: any) => c.categoryId ?? c.id).filter(Boolean),
		[product.categories]
	);
	React.useEffect(() => { setSelectedIds(productCategoryIds); }, [productCategoryIds]);

	const leaves = React.useMemo(
		() => categories.filter(c => c.level === 2 || (c.level === 1 && !c.children?.length)),
		[categories]
	);

	const primaryLeaf = React.useMemo(() => {
		const first = categories.find(c => c.id === selectedIds[0]);
		return first ? productParentChildFromLeaf(first, categories) : null;
	}, [categories, selectedIds]);

	async function save(nextIds: string[]) {
		setSelectedIds(nextIds);
		if (nextIds.length === 0) return;
		setBusy(true);
		try {
			const chosen = nextIds.map(id => categories.find(c => c.id === id)).filter(Boolean) as AdminProductCategoryRow[];
			await updateProduct(product.id, { categoryIds: nextIds, primaryCategoryId: nextIds[0] });
			toast.success('Đã cập nhật danh mục');
			onChanged();
		} catch (e) { toast.error(e instanceof Error ? e.message : 'Không cập nhật được'); }
		finally { setBusy(false); }
	}

	return (
		<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading icon={WarehouseIcon} title='Danh mục sản phẩm' />
			<div className='mt-3 space-y-3'>
				<MultiSelectCombobox
					options={leaves.map(leaf => ({ value: leaf.id, label: categoryBreadcrumb(leaf, categories) }))}
					selectedValues={selectedIds}
					onSelectedChange={save}
					placeholder='Chọn danh mục'
					searchPlaceholder='Tìm danh mục'
					disabled={busy}
				/>
				{selectedIds.length > 0 ? (
					<div className='flex flex-wrap gap-1.5'>
						{selectedIds.map(id => {
							const cat = categories.find(c => c.id === id);
							return cat ? <Badge key={id} variant='secondary' className='text-xs font-normal'>{categoryBreadcrumb(cat, categories)}</Badge> : null;
						})}
					</div>
				) : null}
				{primaryLeaf ? (
					<div className='rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground'>
						Nhóm hiển thị: <span className='font-medium text-foreground'>{primaryLeaf.parent} / {primaryLeaf.child}</span>
					</div>
				) : null}
			</div>
		</section>
	);
}

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

function ProductDetailSkeleton() {
	return (
		<div className='space-y-4'>
			<div className='rounded-xl bg-card p-6 ring-1 ring-foreground/10'>
				<Skeleton className='h-6 w-72' /><Skeleton className='mt-2 h-4 w-48' />
			</div>
			<div className='grid gap-4 lg:grid-cols-[1fr_360px]'>
				<div className='space-y-4'>{[1,2,3].map(i => (
					<div key={i} className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<Skeleton className='h-4 w-32' /><Skeleton className='mt-3 h-24 w-full' />
					</div>
				))}</div>
				<div className='space-y-4'>{[1,2].map(i => (
					<div key={i} className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<Skeleton className='h-4 w-24' /><Skeleton className='mt-3 h-16 w-full' />
					</div>
				))}</div>
			</div>
		</div>
	);
}

function NotFoundState() {
	return (
		<div className='flex flex-col items-center justify-center gap-3 rounded-xl bg-card p-10 ring-1 ring-foreground/10'>
			<WarehouseIcon className='size-8 text-muted-foreground' aria-hidden />
			<p className='text-sm font-medium'>Không tìm thấy sản phẩm</p>
			<Button asChild type='button' variant='outline'><Link to='/products'>Về danh sách</Link></Button>
		</div>
	);
}
