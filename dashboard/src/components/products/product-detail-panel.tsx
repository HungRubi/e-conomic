import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { generateId } from '@/lib/generate-id';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ArchiveIcon,
	ArrowLeftIcon,
	BoxIcon,
	CalendarClockIcon,
	CopyIcon,
	HashIcon,
	HeartIcon,
	HistoryIcon,
	InboxIcon,
	ImageIcon,
	LayersIcon,
	ListOrderedIcon,
	PackageIcon,
	PaletteIcon,
	PlusIcon,
	RocketIcon,
	SparklesIcon,
	StickyNoteIcon,
	TagIcon,
	TextIcon,
	Trash2Icon,
	WarehouseIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { VariantStockInputs } from '@/components/inventory/variant-stock-inputs';

import {
	archiveProduct,
	deleteProduct,
	getProduct,
	publishProduct,
	updateProduct,
	uploadProductImage,
	adjustProductStock,
	fetchInventoryTransactions,
	type AdminProductRow,
	type AdminProductVariantInput,
	type InventoryTransaction,
} from '@/api/admin-products';
import {
	previewCustomProductStock,
	batchReceiveVariants,
	type CustomProductPreviewResponse,
} from '@/api/admin-inventory';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductImagesEditor, type ProductImageEntry } from '@/components/products/product-images-editor';
import {
	assignableLeafCategories,
	categoryBreadcrumb,
	productParentChildFromLeaf,
} from '@/lib/product-category-helpers';
import { CONTENT_STATUS_BADGE } from '@/lib/status-styles';

const STATUS_LABEL: Record<AdminProductRow['status'], string> = {
	DRAFT: 'Nháp',
	ACTIVE: 'Đang bán',
	ARCHIVED: 'Lưu trữ',
};

const TYPE_LABEL: Record<AdminProductRow['type'], string> = {
	PHYSICAL: 'Sản phẩm vật lý',
	SERVICE: 'Dịch vụ',
	CUSTOM_DESIGN: 'Thiết kế riêng',
	SIMPLE: 'Sản phẩm đơn giản',
	VARIABLE: 'Sản phẩm có biến thể',
	DIGITAL: 'Sản phẩm số',
};

const TYPE_OPTIONS = (Object.keys(TYPE_LABEL) as AdminProductRow['type'][]).map(t => ({
	value: t,
	label: TYPE_LABEL[t],
}));

function formatDateTime(iso: string | null): string {
	if (!iso) return 'đ';
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
	if (error) {
		return (
			<div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
				<p className='text-sm font-medium text-destructive'>
					{error instanceof Error ? error.message : 'Không tải được sản phẩm'}
				</p>
				<div className='flex gap-2'>
					<Button type='button' variant='outline' onClick={() => void refetch()}>
						Thử lại
					</Button>
					<Button asChild type='button' variant='ghost'>
						<Link to='/products'>
							<ArrowLeftIcon className='mr-1 size-4' />
							Về danh sách
						</Link>
					</Button>
				</div>
			</div>
		);
	}
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
	const [receiveVariantQtys, setReceiveVariantQtys] = React.useState<Record<string, string>>({});
	const [preview, setPreview] = React.useState<CustomProductPreviewResponse | null>(null);
	const [previewLoading, setPreviewLoading] = React.useState(false);
	const prevQtyRef = React.useRef('');

	// Live preview for custom products
	React.useEffect(() => {
		if (!product.custom || !receiveOpen || !receiveQty) {
			setPreview(null);
			return;
		}
		const qty = Number(receiveQty);
		if (!qty || qty <= 0) {
			setPreview(null);
			return;
		}
		if (prevQtyRef.current === receiveQty && preview) return;
		prevQtyRef.current = receiveQty;
		setPreviewLoading(true);
		previewCustomProductStock(product.id, qty)
			.then(setPreview)
			.catch(() => setPreview(null))
			.finally(() => setPreviewLoading(false));
	}, [product.custom, product.id, receiveOpen, receiveQty, preview]);

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
		} catch (e) {
			setHistoryError(e instanceof Error ? e.message : 'Không tải được lịch sử');
		} finally {
			setHistoryLoading(false);
		}
	}

	async function handleReceive() {
		const note = receiveNote.trim() || undefined;
		const hasVariants = !product.custom && (product.variants?.length ?? 0) > 0;

		if (hasVariants) {
			const entries = Object.entries(receiveVariantQtys)
				.map(([variantId, qtyStr]) => ({ variantId, qty: Number(qtyStr) }))
				.filter(e => e.qty > 0);
			if (entries.length === 0) {
				toast.error('Nhập số lượng cho ít nhất một biến thể');
				return;
			}
			setReceiveBusy(true);
			try {
				const result = await batchReceiveVariants(
					entries.map(e => ({ id: e.variantId, quantity: e.qty })),
					note
				);
				const resultErr = result as { errors?: { error: string }[] } | undefined;
				if (resultErr?.errors?.length) {
					toast.error(`${resultErr.errors.length} biến thể lỗi: ${resultErr.errors[0].error}`);
				} else {
					toast.success('Đã nhập ' + entries.length + ' biến thể');
				}
				setReceiveOpen(false);
				setReceiveQty('');
				setReceiveVariantQtys({});
				setReceiveNote('');
				onChanged();
			} catch (e) {
				toast.error(e instanceof Error ? e.message : 'Nhập kho thất bại');
			} finally {
				setReceiveBusy(false);
			}
			return;
		}

		const qty = Number(receiveQty);
		if (!qty || qty <= 0) {
			toast.error('Nhập số lượng hợp lệ');
			return;
		}
		setReceiveBusy(true);
		try {
			await adjustProductStock(product.id, {
				changeType: 'RECEIVE',
				quantity: qty,
				note,
			});
			toast.success('đã nhập kho');
			setReceiveOpen(false);
			setReceiveQty('');
			setReceiveNote('');
			setPreview(null);
			onChanged();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Nhập kho thất bại');
		} finally {
			setReceiveBusy(false);
		}
	}

	async function onPublish() {
		setActionBusy('publish');
		try {
			await publishProduct(product.id);
			toast.success('đã phát hành sản phẩm');
			onChanged();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Không phát hành được');
		} finally {
			setActionBusy(null);
		}
	}

	async function onArchive() {
		setActionBusy('archive');
		try {
			await archiveProduct(product.id);
			toast.success('đã lưu trữ sản phẩm');
			onChanged();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Không lưu trữ được');
		} finally {
			setActionBusy(null);
		}
	}

	async function onDelete() {
		setActionBusy('delete');
		try {
			await deleteProduct(product.id);
			toast.success('đã xóa sản phẩm');
			navigate('/products');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Không xóa được');
			setActionBusy(null);
		}
	}

	return (
		<div className='space-y-4'>
			<header className='rounded-xl bg-card p-4 sm:p-5 lg:p-6 ring-1 ring-foreground/10'>
				<div className='flex items-start justify-between gap-4'>
					<div className='min-w-0 flex-1'>
						<div className='flex items-center gap-1'>
							<h1
								className='min-w-0 flex-1 truncate text-lg font-semibold tracking-tight'
								title={product.name}
							>
								{product.name}
							</h1>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='size-7 text-muted-foreground'
								onClick={() => copyToClipboard(product.slug, 'đã sao chép slug')}
								aria-label='Sao chép slug'
							>
								<CopyIcon className='size-3.5' />
							</Button>
						</div>
						<div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
							<span className='inline-flex items-center gap-1 font-mono' translate='no'>
								<HashIcon className='size-3' aria-hidden />
								{product.slug}
							</span>
							<span aria-hidden>đ</span>
							<span className='inline-flex items-center gap-1'>
								<CalendarClockIcon className='size-3.5' aria-hidden />
								Tạo {formatDateTime(product.createdAt)}
							</span>
							{product.updatedAt !== product.createdAt ? (
								<>
									<span aria-hidden>đ</span>
									<span>Cập nhật {formatDateTime(product.updatedAt)}</span>
								</>
							) : null}
						</div>
					</div>
					<div className='flex shrink-0 flex-wrap items-center gap-2'>
						<Badge variant={CONTENT_STATUS_BADGE[product.status]}>{STATUS_LABEL[product.status]}</Badge>
						<Badge variant='outline'>{TYPE_LABEL[product.type]}</Badge>
					</div>
				</div>
			</header>

			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'>
				<div className='min-w-0 space-y-4'>
					<ImagesSection key={product.id} product={product} onChanged={onChanged} />

					{product.custom && product.priceDetailGems?.length ? (
						<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading
								icon={ImageIcon}
								title='Nguyên liệu cấu thành'
								hint='Đây là ảnh nguyên liệu (đá / hạt), không phải ảnh phụ của sản phẩm.'
							/>
							<div className='mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4'>
								{product.priceDetailGems.map((gem, i) => (
									<div
										key={i}
										className='flex flex-col items-center gap-1.5 rounded-md border border-border/60 p-2 text-center'
									>
										{gem.image ? (
											<img
												src={publicAssetUrl(gem.image)}
												alt=''
												className='size-16 rounded-md border border-border object-cover'
												loading='lazy'
											/>
										) : (
											<div className='size-16 rounded-md bg-muted' />
										)}
										<div className='min-w-0'>
											<p className='truncate text-xs font-medium'>{gem.name}</p>
											<p className='text-[10px] text-muted-foreground'>
												{gem.amountVnd.toLocaleString('vi-VN')}₫
											</p>
											{gem.quantity ? (
												<p className='text-[10px] text-muted-foreground'>x{gem.quantity}/sp</p>
											) : null}
										</div>
									</div>
								))}
							</div>
						</section>
					) : null}

					<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={TextIcon} title='Thông tin chính' />
						<div className='mt-3 space-y-1'>
							<EditableField
								label='Tên sản phẩm'
								type='text'
								value={product.name}
								onSave={v => patch({ name: v })}
								validate={v => (v.trim() ? null : 'Tên không được trống')}
							/>
							<EditableField
								label='Slug (URL)'
								type='text'
								value={product.slug}
								onSave={v => patch({ slug: v })}
								validate={v =>
									/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.trim())
										? null
										: 'Slug chỉ gồm a-z, 0-9 và dấu -'
								}
								displayClassName='font-mono text-xs'
							/>
							<EditableField
								label='Tiêu đề chi tiết'
								type='text'
								value={product.detailTitle}
								onSave={v => patch({ detailTitle: v })}
								emptyHint='Chưa có tiêu đề trang chi tiết'
							/>
							<EditableField
								label='Câu nhấn (accent)'
								type='text'
								value={product.accent}
								onSave={v => patch({ accent: v })}
								validate={v => (!v.trim() ? 'Không được để trống' : null)}
								emptyHint='Câu giới thiệu ngắn ở thẻ sản phẩm'
							/>
							<EditableField
								label='Mô tả'
								type='textarea'
								rows={5}
								value={product.description}
								onSave={v => patch({ description: v })}
								emptyHint='Chưa có mô tả'
							/>
						</div>
					</section>

					<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={WarehouseIcon} title='Tồn kho' />
						<div className='mt-3 space-y-1'>
							<EditableField
								label='Số lượng tồn'
								type='number'
								value={product.stockQuantity ?? null}
								disabled={product.custom}
								onSave={v => patch({ stockQuantity: v ?? 0 })}
								min={0}
								validate={v => (v != null && v >= 0 ? null : 'Phải là số >= 0')}
							/>
							<EditableField
								label='Ngưỡng báo hết hàng'
								type='number'
								value={product.lowStockThreshold ?? null}
								onSave={v => patch({ lowStockThreshold: v ?? 5 })}
								min={0}
								validate={v => (v != null && v >= 0 ? null : 'Phải là số >= 0')}
							/>
						</div>
						{product.custom ? (
							<div className='mt-3 space-y-3'>
								<p className='rounded-md bg-muted/30 p-3 text-xs text-muted-foreground'>
									Tồn kho sản phẩm custom thể hiện số lượng đã sản xuất. Nhập kho sẽ tự động trừ
									nguyên liệu tương ứng.
								</p>
								<div className='flex gap-2'>
									<Button
										variant='outline'
										size='sm'
										className='gap-1.5'
										onClick={() => setReceiveOpen(true)}
									>
										<InboxIcon className='size-3.5' />
										Nhập kho
									</Button>
									<Button variant='outline' size='sm' className='gap-1.5' asChild>
										<Link to={`/inventory/${product.id}`}>
											<WarehouseIcon className='size-3.5' />
											Quản lý kho
										</Link>
									</Button>
									{product.stockQuantity !== undefined ? (
										<Badge
											variant={product.stockQuantity === 0 ? 'destructive' : 'success'}
											className='ml-auto'
										>
											{product.stockQuantity === 0
												? 'Chưa sản xuất'
												: `Đã SX: ${product.stockQuantity}`}
										</Badge>
									) : null}
								</div>
							</div>
						) : (
							<div className='mt-3 flex gap-2'>
								<Button
									variant='outline'
									size='sm'
									className='gap-1.5'
									onClick={() => setReceiveOpen(true)}
								>
									<InboxIcon className='size-3.5' />
									Nhập kho
								</Button>
								<Button
									variant='outline'
									size='sm'
									className='gap-1.5'
									onClick={() => void openHistory()}
								>
									<HistoryIcon className='size-3.5' />
									Lịch sử
								</Button>
								<Button variant='outline' size='sm' className='gap-1.5' asChild>
									<Link to={`/inventory/${product.id}`}>
										<WarehouseIcon className='size-3.5' />
										Quản lý kho
									</Link>
								</Button>
								{product.stockQuantity !== undefined ? (
									<Badge
										variant={
											product.stockQuantity === 0
												? 'destructive'
												: product.stockQuantity <= (product.lowStockThreshold ?? 5)
													? 'warning'
													: 'success'
										}
										className='ml-auto'
									>
										{product.stockQuantity === 0 ? 'Hết hàng' : `Tồn: ${product.stockQuantity}`}
									</Badge>
								) : null}
							</div>
						)}
					</section>

					<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={HeartIcon} title='Hướng dẫn chăm sóc' hint='Mỗi dòng là một mẹo riêng.' />
						<div className='mt-3'>
							<EditableField
								type='textarea'
								rows={6}
								value={(product as any).careTips.join('\n')}
								onSave={v =>
									patch({
										careTips: v
											.split('\n')
											.map(s => s.trim())
											.filter(Boolean),
									})
								}
								emptyHint='Chưa có mô tả nào, click để thêm'
							/>
							{(product as any).careTips.length > 0 ? (
								<ul className='mt-3 space-y-1.5'>
									{(product as any).careTips.map((tip, i) => (
										<li key={i} className='flex items-start gap-2 text-sm text-muted-foreground'>
											<SparklesIcon
												className='mt-0.5 size-3.5 shrink-0 text-amber-500'
												aria-hidden
											/>
											<span>{tip}</span>
										</li>
									))}
								</ul>
							) : null}
						</div>
					</section>

					{product.custom ? (
						<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<div className='flex items-center gap-3'>
								<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted'>
									<svg
										className='size-5 text-muted-foreground'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
										strokeWidth={1.5}
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42'
										/>
									</svg>
								</div>
								<div>
									<p className='text-sm font-semibold'>Sản phẩm thiết kế riêng</p>
									<p className='text-xs text-muted-foreground mt-1'>
										Sản phẩm này không hỗ trợ biến thể (thêm size/màu).
									</p>
								</div>
							</div>
						</section>
					) : (
						<VariantsSection key={product.updatedAt} product={product} onChanged={onChanged} />
					)}
				</div>

				<aside className='lg:sticky lg:top-4 lg:self-start'>
					<div className='space-y-4'>
						<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={RocketIcon} title='Thao tác nhanh' />
							<div className='flex flex-col gap-2 mt-3'>
								<div className='flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2 text-sm'>
									<span className='text-muted-foreground'>Trạng thái hiển thị</span>
									<Badge variant={CONTENT_STATUS_BADGE[product.status]}>
										{STATUS_LABEL[product.status]}
									</Badge>
								</div>
								{product.status !== 'ACTIVE' ? (
									<Button
										type='button'
										onClick={() => void onPublish()}
										disabled={actionBusy !== null}
										className='justify-start'
									>
										<RocketIcon className='mr-1.5 size-4' />
										Phát hành sản phẩm
									</Button>
								) : null}
								{product.status !== 'ARCHIVED' ? (
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
								<Button
									type='button'
									variant='ghost'
									className='justify-start text-destructive hover:bg-destructive/10 hover:text-destructive'
									onClick={() => setConfirmDelete(true)}
									disabled={actionBusy !== null}
								>
									<Trash2Icon className='mr-1.5 size-4' />
									Xóa vĩnh viễn
								</Button>
							</div>
						</section>

						<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={TagIcon} title='Giá & phân loại' />
							<div className='mt-3 space-y-1'>
								{!product.variants || product.variants.length === 0 ? (
									<EditableField
										label='Giá (VND)'
										type='number'
										value={product.priceVnd}
										onSave={v => patch({ priceVnd: v ?? 0 })}
										min={0}
										validate={v => (v != null && v >= 0 ? null : 'Phải là số >= 0')}
									/>
								) : null}
								<EditableField
									label='Giảm giá (%)'
									type='number'
									value={product.discountPercent ?? null}
									onSave={v => patch({ discountPercent: v })}
									min={0}
									max={100}
									validate={v => (v != null && (v < 0 || v > 100) ? 'Phải từ 0 đến 100' : null)}
									emptyHint='Không giảm giá'
								/>
								<EditableField
									label='Loại sản phẩm'
									type='select'
									value={product.type}
									options={TYPE_OPTIONS}
									onSave={v => patch({ type: v as AdminProductRow['type'] })}
								/>

								<EditableField
									label='Sản phẩm custom?'
									type='select'
									value={product.custom ? 'yes' : 'no'}
									options={[
										{ value: 'yes', label: 'Có' },
										{ value: 'no', label: 'Không' },
									]}
									onSave={v => patch({ custom: v === 'yes' })}
								/>
								<EditableField
									label='Thứ tự hiển thị'
									type='number'
									value={product.sortOrder}
									onSave={v => patch({ sortOrder: v ?? 0 })}
									min={0}
								/>
							</div>
							<div className='mt-3 rounded-md bg-muted/30 p-3 text-xs'>
								<p className='font-medium uppercase tracking-wider text-muted-foreground'>
									Giá khách thấy
								</p>
								<p className='mt-1 font-semibold tabular-nums'>{product.priceLabel || 'đ'}</p>
							</div>
						</section>

						<CategorySection product={product} onChanged={onChanged} />

						<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={StickyNoteIcon} title='Số liệu' />
							<dl className='mt-2 space-y-2 text-sm'>
								<div className='flex items-center justify-between'>
									<dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
										<BoxIcon className='size-3.5' aria-hidden />
										đã bán
									</dt>
									<dd className='font-semibold tabular-nums'>{product.sold}</dd>
								</div>
								<div className='flex items-center justify-between'>
									<dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
										<ImageIcon className='size-3.5' aria-hidden />
										Số ảnh
									</dt>
									<dd className='font-semibold tabular-nums'>{product.images?.length ?? 0}</dd>
								</div>
								<div className='flex items-center justify-between'>
									<dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
										<ListOrderedIcon className='size-3.5' aria-hidden />
										Mẹo chăm sóc
									</dt>
									<dd className='font-semibold tabular-nums'>{(product as any).careTips.length}</dd>
								</div>
							</dl>
						</section>
					</div>
				</aside>
			</div>

			<AlertDialog
				open={receiveOpen}
				onOpenChange={o => {
					if (!o) setReceiveVariantQtys({});
					setReceiveOpen(o);
				}}
			>
				<AlertDialogContent
					className={(() => {
						const vc = product.variants?.length ?? 0;
						if (!product.custom && vc > 5) return 'max-w-2xl';
						if (!product.custom && vc > 0) return 'max-w-lg';
						if (product.custom) return 'max-w-xl';
						return undefined;
					})()}
				>
					<AlertDialogHeader>
						<AlertDialogTitle>Nhập kho</AlertDialogTitle>
						<AlertDialogDescription>
							Nhập số lượng và ghi chú cho phiếu nhập kho.
							{(() => {
								const hasVariants = !product.custom && (product.variants?.length ?? 0) > 0;
								if (hasVariants) return ' (Nhập số lượng cho từng biến thể)';
								return product.custom ? ' (Custom — sẽ trừ nguyên liệu)' : '';
							})()}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className='space-y-3 py-2'>
						{!product.custom && (product.variants?.length ?? 0) > 0 ? (
							<div className='space-y-1.5'>
								<label className='text-xs font-medium text-muted-foreground'>
									Số lượng nhập theo biến thể
								</label>
								<VariantStockInputs
									variants={product.variants!}
									values={receiveVariantQtys}
									onChange={(id, val) => setReceiveVariantQtys(prev => ({ ...prev, [id]: val }))}
									disabled={receiveBusy}
								/>
							</div>
						) : (
							<>
								<div className='space-y-1.5'>
									<label className='text-xs font-medium text-muted-foreground'>Số lượng</label>
									<Input
										inputMode='numeric'
										value={receiveQty}
										onChange={e => setReceiveQty(e.target.value.replace(/[^0-9]/g, ''))}
										placeholder='0'
										disabled={receiveBusy}
									/>
								</div>

								{product.custom && preview ? (
									<div className='space-y-1.5'>
										<label className='text-xs font-medium text-muted-foreground'>
											Nguyên liệu sẽ trừ
										</label>
										<div className='grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto rounded-lg border p-2'>
											{preview.requirements.map((r, i) => (
												<div key={i} className='flex items-center gap-3 px-3 py-2.5'>
													{r.componentImage ? (
														<img
															src={publicAssetUrl(r.componentImage)}
															alt=''
															className='size-9 shrink-0 rounded border border-border object-cover'
															loading='lazy'
														/>
													) : (
														<div className='size-9 shrink-0 rounded bg-muted' />
													)}
													<div className='min-w-0 flex-1'>
														<p className='text-sm font-medium truncate'>
															{r.componentName}
														</p>
														<p className='text-xs text-muted-foreground'>
															{r.amountVnd.toLocaleString('vi-VN')}₫ × {r.quantityPerUnit}{' '}
															viên/sp
														</p>
													</div>
													<div className='text-right text-sm tabular-nums'>
														<p
															className={
																r.materialStock.sufficient
																	? 'text-destructive'
																	: 'text-destructive font-semibold'
															}
														>
															-{r.totalDeducted}
														</p>
														<p
															className={
																'text-xs ' +
																(r.materialStock.sufficient
																	? 'text-muted-foreground'
																	: 'text-destructive')
															}
														>
															{r.materialStock.sufficient
																? `Còn ${r.materialStock.remaining}`
																: `Thiếu ${Math.abs(r.materialStock.remaining)} (có ${r.materialStock.current})`}
														</p>
													</div>
												</div>
											))}
										</div>
										{!preview.sufficient ? (
											<p className='text-xs font-medium text-destructive'>
												⚠ Không đủ nguyên liệu! Vui lòng nhập kho nguyên liệu trước.
											</p>
										) : null}
									</div>
								) : product.custom && previewLoading ? (
									<div className='space-y-2 py-2'>
										<div className='h-8 w-48 animate-pulse rounded bg-muted' />
										<div className='h-12 w-full animate-pulse rounded bg-muted' />
										<div className='h-12 w-full animate-pulse rounded bg-muted' />
									</div>
								) : null}
							</>
						)}

						<div className='space-y-1.5'>
							<label className='text-xs font-medium text-muted-foreground'>Ghi chú (tùy chọn)</label>
							<Input
								value={receiveNote}
								onChange={e => setReceiveNote(e.target.value)}
								placeholder='Nhập kho lần 1'
								disabled={receiveBusy}
							/>
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={receiveBusy}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							disabled={(() => {
								if (receiveBusy) return true;
								const hasVariants = !product.custom && (product.variants?.length ?? 0) > 0;
								if (hasVariants) return !Object.values(receiveVariantQtys).some(v => Number(v) > 0);
								return !receiveQty || (product.custom && preview ? !preview.sufficient : false);
							})()}
							onClick={() => void handleReceive()}
						>
							{receiveBusy ? 'đang nhập' : 'Xác nhận'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa sản phẩm này?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Sản phẩm <strong>{product.name}</strong> sẽ bị xóa khỏi hệ
							thống.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={actionBusy === 'delete'}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => void onDelete()}
							disabled={actionBusy === 'delete'}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							{actionBusy === 'delete' ? 'đang xóa...' : 'Xóa'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function ImagesSection({ product, onChanged }: { product: AdminProductRow; onChanged: () => void }) {
	const initial = React.useMemo<ProductImageEntry[]>(() => {
		const urls = (product.images?.length ? product.images : [product.image]).map(u => u.trim()).filter(Boolean);
		return urls.map(url => ({ id: generateId(), url }));
	}, [product.images, product.image]);

	const [media, setMedia] = React.useState<ProductImageEntry[]>(initial);
	const [busy, setBusy] = React.useState(false);

	const dirty = React.useMemo(() => {
		const a = media.map(m => m.url.trim()).filter(Boolean);
		const b = initial.map(m => m.url.trim()).filter(Boolean);
		if (a.length !== b.length) return true;
		return a.some((u, i) => u !== b[i]);
	}, [media, initial]);

	async function save() {
		const urls = media.map(m => m.url.trim()).filter(Boolean);
		if (urls.length === 0) {
			toast.error('Cần ít nhất một ảnh');
			return;
		}
		setBusy(true);
		try {
			await updateProduct(product.id, {
				image: urls[0],
				images: urls,
			});
			toast.success('Đã cập nhật ảnh');
			onChanged();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Không cập nhật được');
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading
				icon={ImageIcon}
				title='Ảnh sản phẩm'
				action={
					dirty ? (
						<div className='flex gap-1.5'>
							<Button
								type='button'
								variant='ghost'
								size='sm'
								onClick={() => setMedia(initial)}
								disabled={busy}
							>
								Hủy
							</Button>
							<Button type='button' size='sm' onClick={() => void save()} disabled={busy}>
								{busy ? 'Đang lưu...' : 'Lưu thay đổi'}
							</Button>
						</div>
					) : null
				}
			/>
			<div className='mt-3'>
				<ProductImagesEditor entries={media} onEntriesChange={setMedia} disabled={busy} />
			</div>
		</section>
	);
}
function CategorySection({ product, onChanged }: { product: AdminProductRow; onChanged: () => void }) {
	const [categories, setCategories] = React.useState<AdminProductCategoryRow[]>([]);
	const [editing, setEditing] = React.useState(false);
	const [busy, setBusy] = React.useState(false);
	const [draftIds, setDraftIds] = React.useState<string[]>([]);

	React.useEffect(() => {
		void fetchAllProductCategories({ status: 'all', sortBy: 'name', sortOrder: 'asc' })
			.then(setCategories)
			.catch(() => {});
	}, []);

	/** Giữ nguyên thứ tự link từ API (index 0 = danh m?c chọnh). */
	const linkedIds = React.useMemo(() => ((product.categories ?? []) as any[]).map(c => c.id), [product.categories]);
	const linkedRows = React.useMemo(
		() =>
			linkedIds
				.map(id => categories.find(c => c.id === id))
				.filter((c): c is AdminProductCategoryRow => Boolean(c)),
		[linkedIds, categories]
	);

	const choices = React.useMemo(() => assignableLeafCategories(categories), [categories]);

	async function save() {
		const chosen = draftIds
			.map(id => categories.find(c => c.id === id))
			.filter((c): c is AdminProductCategoryRow => Boolean(c));
		if (chosen.length === 0) {
			toast.error('Chọn ít nhất một danh mục');
			return;
		}
		setBusy(true);
		try {
			const { parent, child } = productParentChildFromLeaf(chosen[0], categories);
			await updateProduct(product.id, {
				parent,
				child,
				categorySlugs: chosen.map(c => c.slug),
			});
			toast.success('đã cập nhật danh mục');
			setEditing(false);
			onChanged();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Không cập nhật được');
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading
				icon={LayersIcon}
				title='Danh mục'
				action={
					editing ? null : (
						<Button
							type='button'
							variant='ghost'
							size='sm'
							onClick={() => {
								setDraftIds(linkedIds);
								setEditing(true);
							}}
						>
							Sửa
						</Button>
					)
				}
			/>
			{!editing ? (
				<div className='mt-3 space-y-1.5'>
					{linkedRows.length > 0 ? (
						<ul className='space-y-1.5'>
							{linkedRows.map((cat, index) => (
								<li key={cat.id} className='flex items-center gap-2'>
									<div className='min-w-0'>
										<p className='truncate text-sm font-medium'>
											{categoryBreadcrumb(cat, categories)}
										</p>
										<p className='font-mono text-xs text-muted-foreground' translate='no'>
											{cat.slug}
										</p>
									</div>
									{index === 0 ? (
										<Badge variant='secondary' className='ml-auto shrink-0'>
											Chính
										</Badge>
									) : null}
								</li>
							))}
						</ul>
					) : (
						<p className='text-sm italic text-muted-foreground'>Chưa gán danh mục</p>
					)}
					<p className='pt-1 text-xs text-muted-foreground'>
						<span className='font-medium'>Nhóm:</span> {product.parent || 'đ'}
						{product.child ? ` đ ${product.child}` : ''}
					</p>
				</div>
			) : (
				<div className='mt-3 space-y-2'>
					<p className='text-xs text-muted-foreground'>
						Chọn một hoặc nhiều danh mục. Mục đầu tiên (theo thứ tự chọn) là danh mục chính.
					</p>
					<div className='max-h-56 space-y-2 overflow-auto rounded-md border p-3'>
						{choices.map(c => {
							const checked = draftIds.includes(c.id);
							const order = draftIds.indexOf(c.id);
							return (
								<label key={c.id} className='flex items-center gap-2 text-sm'>
									<Checkbox
										checked={checked}
										disabled={busy}
										onCheckedChange={v =>
											setDraftIds(prev => (v ? [...prev, c.id] : prev.filter(id => id !== c.id)))
										}
									/>
									<span className='min-w-0 truncate'>{categoryBreadcrumb(c, categories)}</span>
									{checked && order === 0 ? (
										<Badge variant='secondary' className='ml-auto shrink-0'>
											Chính
										</Badge>
									) : null}
								</label>
							);
						})}
					</div>
					<div className='flex justify-end gap-1.5'>
						<Button
							type='button'
							variant='ghost'
							size='sm'
							onClick={() => setEditing(false)}
							disabled={busy}
						>
							Hủy
						</Button>
						<Button
							type='button'
							size='sm'
							onClick={() => void save()}
							disabled={busy || draftIds.length === 0}
						>
							{busy ? 'Đang lưu...' : 'Lưu'}
						</Button>
					</div>
				</div>
			)}
		</section>
	);
}

type VariantDraft = {
	rowId: string;
	id?: string;
	name: string;
	color: string;
	colorHex: string;
	image: string;
	priceVnd: string;
	sortOrder: number;
};

function variantsToDrafts(variants: AdminProductRow['variants']): VariantDraft[] {
	return (variants ?? []).map((variant, index) => ({
		rowId: generateId(),
		id: variant.id,
		name: variant.name ?? '',
		color: variant.color ?? '',
		colorHex: variant.colorHex ?? '',
		image: variant.image ?? '',
		priceVnd: String(variant.priceVnd ?? 0),
		sortOrder: variant.sortOrder ?? index,
	}));
}

function draftsToInputs(
	drafts: VariantDraft[]
): { ok: true; inputs: AdminProductVariantInput[] } | { ok: false; error: string } {
	const inputs: AdminProductVariantInput[] = [];
	for (let index = 0; index < drafts.length; index += 1) {
		const draft = drafts[index];
		const trimmedPrice = draft.priceVnd.trim();
		if (!trimmedPrice) {
			return { ok: false, error: `Biến thể #${index + 1}: phải nhập giá` };
		}
		const priceVnd = Number(trimmedPrice);
		if (!Number.isFinite(priceVnd) || priceVnd < 0) {
			return { ok: false, error: `Biến thể #${index + 1}: giá không hợp lệ` };
		}
		inputs.push({
			...(draft.id ? { id: draft.id } : {}),
			name: draft.name.trim() || null,
			color: draft.color.trim() || null,
			colorHex: draft.colorHex.trim() || null,
			image: draft.image.trim() || null,
			priceVnd: Math.trunc(priceVnd),
			sortOrder: index,
		});
	}
	return { ok: true, inputs };
}

function VariantsSection({ product, onChanged }: { product: AdminProductRow; onChanged: () => void }) {
	const initial = React.useMemo(() => variantsToDrafts(product.variants), [product.variants]);
	const [drafts, setDrafts] = React.useState<VariantDraft[]>(initial);
	const [busy, setBusy] = React.useState(false);

	const dirty = React.useMemo(() => {
		if (drafts.length !== initial.length) return true;
		return drafts.some((draft, index) => {
			const ref = initial[index];
			return (
				draft.id !== ref.id ||
				draft.name !== ref.name ||
				draft.color !== ref.color ||
				draft.colorHex !== ref.colorHex ||
				draft.image !== ref.image ||
				draft.priceVnd !== ref.priceVnd
			);
		});
	}, [drafts, initial]);

	function addDraft() {
		setDrafts(prev => [
			...prev,
			{
				rowId: generateId(),
				name: '',
				color: '',
				colorHex: '',
				image: '',
				priceVnd: String(product.priceVnd ?? 0),
				sortOrder: prev.length,
			},
		]);
	}

	function updateDraft(rowId: string, patch: Partial<VariantDraft>) {
		setDrafts(prev => prev.map(draft => (draft.rowId === rowId ? { ...draft, ...patch } : draft)));
	}

	function removeDraft(rowId: string) {
		setDrafts(prev => prev.filter(draft => draft.rowId !== rowId));
	}

	async function save() {
		const result = draftsToInputs(drafts);
		if (!result.ok) {
			toast.error((result as any).error);
			return;
		}
		setBusy(true);
		try {
			await updateProduct(product.id, { variants: result.inputs });
			toast.success('Đã cập nhật biến thể');
			onChanged();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Không lưu được biến thể');
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading
				icon={PaletteIcon}
				title='Biến thể'
				action={
					<div className='flex items-center gap-1.5'>
						{dirty ? (
							<Button
								type='button'
								variant='ghost'
								size='sm'
								onClick={() => setDrafts(initial)}
								disabled={busy}
							>
								Hủy
							</Button>
						) : null}
						<Button type='button' size='sm' variant='outline' onClick={addDraft} disabled={busy}>
							<PlusIcon className='mr-1 size-3.5' />
							Thêm
						</Button>
						{dirty ? (
							<Button type='button' size='sm' onClick={() => void save()} disabled={busy}>
								{busy ? 'Đang lưu...' : 'Lưu'}
							</Button>
						) : null}
					</div>
				}
			/>
			<div className='mt-3'>
				{drafts.length === 0 ? (
					<p className='py-4 text-center text-sm italic text-muted-foreground rounded-lg border border-dashed border-border/60'>
						Chưa có biến thể. Bấm "Thêm" để tạo.
					</p>
				) : (
					<div className='overflow-x-auto rounded-lg border'>
						<table className='w-full text-sm'>
							<thead>
								<tr className='border-b bg-muted/30 text-left text-xs text-muted-foreground'>
									<th className='p-2 pl-3 font-medium'>STT</th>
									<th className='p-2 font-medium'>Ảnh</th>
									<th className='p-2 font-medium'>Tên</th>
									<th className='p-2 font-medium'>Màu</th>
									<th className='p-2 font-medium'>Mã hex</th>
									<th className='p-2 font-medium'>Giá (VND)</th>
									<th className='p-2 font-medium'>Tồn kho</th>
									<th className='p-2 pr-3 text-right font-medium'>Xóa</th>
								</tr>
							</thead>
							<tbody>
								{drafts.map((draft, index) => {
									const variantSource = product.variants?.find(v => v.id === draft.id);
									return (
										<VariantTableRow
											key={draft.rowId}
											index={index}
											draft={draft}
											busy={busy}
											fallbackImage={product.image}
											stockQuantity={variantSource?.stockQuantity}
											onChange={patch => updateDraft(draft.rowId, patch)}
											onRemove={() => removeDraft(draft.rowId)}
										/>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</section>
	);
}

function VariantTableRow({
	index,
	draft,
	busy,
	fallbackImage,
	stockQuantity,
	onChange,
	onRemove,
}: {
	index: number;
	draft: VariantDraft;
	busy: boolean;
	fallbackImage: string;
	stockQuantity?: number;
	onChange: (patch: Partial<VariantDraft>) => void;
	onRemove: () => void;
}) {
	const [uploading, setUploading] = React.useState(false);
	const inputRef = React.useRef<HTMLInputElement | null>(null);
	const previewUrl = draft.image.trim() || fallbackImage;
	const usingFallback = !draft.image.trim();

	async function handlePick(file: File) {
		setUploading(true);
		try {
			const { url } = await uploadProductImage(file);
			onChange({ image: url });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Upload ảnh thất bại');
		} finally {
			setUploading(false);
			if (inputRef.current) inputRef.current.value = '';
		}
	}

	return (
		<tr className='border-b last:border-0 hover:bg-muted/20 transition-colors'>
			<td className='p-2 pl-3 text-xs text-muted-foreground tabular-nums'>{index + 1}</td>
			<td className='p-2'>
				<div className='flex items-center gap-2'>
					<button
						type='button'
						onClick={() => inputRef.current?.click()}
						disabled={busy || uploading}
						className='group relative block size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted transition hover:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-60'
					>
						{previewUrl ? (
							<img
								src={publicAssetUrl(previewUrl)}
								alt=''
								className='size-full object-cover'
								loading='lazy'
							/>
						) : (
							<span className='flex size-full items-center justify-center text-[10px] text-muted-foreground'>
								?
							</span>
						)}
					</button>
					<input
						ref={inputRef}
						type='file'
						accept='image/*'
						className='hidden'
						onChange={e => {
							const f = e.target.files?.[0];
							if (f) void handlePick(f);
						}}
					/>
					{!usingFallback ? (
						<button
							type='button'
							onClick={() => onChange({ image: '' })}
							disabled={busy}
							className='text-[10px] text-muted-foreground underline-offset-2 hover:underline disabled:opacity-60'
						>
							Xóa ảnh
						</button>
					) : null}
				</div>
			</td>
			<td className='p-2'>
				<Input
					value={draft.name}
					onChange={e => onChange({ name: e.target.value })}
					placeholder='VD: Size M'
					disabled={busy}
					className='h-8 text-xs'
				/>
			</td>
			<td className='p-2'>
				<Input
					value={draft.color}
					onChange={e => onChange({ color: e.target.value })}
					placeholder='VD: Hồng'
					disabled={busy}
					className='h-8 text-xs'
				/>
			</td>
			<td className='p-2'>
				<Input
					value={draft.colorHex}
					onChange={e => onChange({ colorHex: e.target.value })}
					placeholder='#f8c1cf'
					disabled={busy}
					className='h-8 text-xs font-mono'
				/>
			</td>
			<td className='p-2'>
				<Input
					inputMode='numeric'
					pattern='[0-9]*'
					value={draft.priceVnd}
					onChange={e => onChange({ priceVnd: e.target.value.replace(/[^0-9]/g, '') })}
					placeholder='0'
					disabled={busy}
					className='h-8 text-xs'
				/>
			</td>
			<td className='p-2 tabular-nums text-xs'>
				{stockQuantity !== undefined ? (
					<Badge variant={stockQuantity === 0 ? 'destructive' : stockQuantity <= 5 ? 'warning' : 'success'}>
						{stockQuantity}
					</Badge>
				) : (
					'—'
				)}
			</td>
			<td className='p-2 pr-3 text-right'>
				<Button
					type='button'
					variant='ghost'
					size='icon'
					className='size-7 text-destructive hover:bg-destructive/10'
					onClick={onRemove}
					disabled={busy}
					aria-label='Xóa biến thể'
				>
					<Trash2Icon className='size-3.5' />
				</Button>
			</td>
		</tr>
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
		<div className='flex items-start justify-between gap-2'>
			<div className='flex items-start gap-2'>
				<Icon className='mt-0.5 size-4 text-muted-foreground' aria-hidden />
				<div>
					<h2 className='text-sm font-semibold tracking-tight'>{title}</h2>
					{hint ? <p className='text-xs text-muted-foreground'>{hint}</p> : null}
				</div>
			</div>
			{action}
		</div>
	);
}

function ProductDetailSkeleton() {
	return (
		<div className='space-y-4'>
			<Skeleton className='h-9 w-72' />
			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]'>
				<div className='space-y-3'>
					<Skeleton className='h-72 w-full rounded-xl' />
					<Skeleton className='h-44 w-full rounded-xl' />
					<Skeleton className='h-32 w-full rounded-xl' />
				</div>
				<div className='space-y-3'>
					<Skeleton className='h-44 w-full rounded-xl' />
					<Skeleton className='h-44 w-full rounded-xl' />
				</div>
			</div>
		</div>
	);
}

function NotFoundState() {
	return (
		<div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 p-10 text-center'>
			<PackageIcon className='size-8 text-muted-foreground' aria-hidden />
			<p className='text-sm font-medium'>Không tìm thấy sản phẩm</p>
			<Button asChild type='button' variant='outline'>
				<Link to='/products'>
					<ArrowLeftIcon className='mr-1 size-4' />
					Về danh sách
				</Link>
			</Button>
		</div>
	);
}
