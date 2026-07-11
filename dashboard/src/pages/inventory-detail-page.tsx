import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	fetchProductInventory,
	adjustProductStock,
	batchReceiveVariants,
	previewCustomProductStock,
	fetchTransactionComponents,
	type InventoryTransaction,
	type InventoryDetailResponse,
	type CustomProductPreviewResponse,
	type InventoryTransactionComponent,
} from '@/api/admin-inventory';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from '@/components/ui/dialog';
import {
	ArrowLeftIcon,
	ShoppingCartIcon,
	HistoryIcon,
	PlusIcon,
	MinusIcon,
	EyeIcon,
	ChevronDownIcon,
	ChevronRightIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEntityCrud } from '@/hooks/use-permission';
import { VariantStockInputs } from '@/components/inventory/variant-stock-inputs';

function formatDateTime(iso: string): string {
	return new Intl.DateTimeFormat('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(iso));
}

const TX_LABEL: Record<string, string> = {
	RECEIVE: 'Nhập kho',
	ADJUST: 'Điều chỉnh',
	DEDUCT: 'Xuất (đơn)',
	RELEASE: 'Hoàn kho',
};

const TX_COLOR: Record<string, 'success' | 'warning' | 'destructive' | 'outline'> = {
	RECEIVE: 'success',
	ADJUST: 'warning',
	DEDUCT: 'destructive',
	RELEASE: 'outline',
};

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'outline' | 'destructive'> = {
	PENDING: 'warning',
	CONFIRMED: 'outline',
	PROCESSING: 'outline',
	SHIPPED: 'success',
	DELIVERED: 'success',
	CANCELLED: 'destructive',
	REFUNDED: 'destructive',
};

function ComponentBreakdownDialog({
	open,
	onOpenChange,
	components,
	loading,
}: {
	open: boolean;
	onOpenChange: (o: boolean) => void;
	components: InventoryTransactionComponent[];
	loading: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-lg'>
				<DialogHeader>
					<DialogTitle>Chi tiết nguyên liệu đã trừ</DialogTitle>
					<DialogDescription>Các nguyên liệu thành phần bị trừ trong lần nhập kho này.</DialogDescription>
				</DialogHeader>
				{loading ? (
					<div className='space-y-2 py-4'>
						{[1, 2, 3].map(i => (
							<Skeleton key={i} className='h-12 w-full' />
						))}
					</div>
				) : components.length === 0 ? (
					<p className='py-6 text-center text-sm text-muted-foreground'>
						Không có chi tiết nguyên liệu (giao dịch này không phải custom).
					</p>
				) : (
					<div className='divide-y divide-border py-2'>
						{components.map(c => (
							<div key={c.id} className='flex items-center gap-3 py-2.5'>
								{c.componentImage ? (
									<img
										src={publicAssetUrl(c.componentImage)}
										alt=''
										className='size-10 shrink-0 rounded-md border border-border object-cover'
										loading='lazy'
									/>
								) : (
									<div className='size-10 shrink-0 rounded-md bg-muted' />
								)}
								<div className='min-w-0 flex-1'>
									<p className='text-sm font-medium truncate'>{c.componentName}</p>
									<p className='text-xs text-muted-foreground'>
										{c.amountVnd.toLocaleString('vi-VN')}₫/viên
									</p>
								</div>
								<div className='text-right text-sm tabular-nums'>
									<p className='font-medium text-destructive'>-{c.totalDeducted}</p>
									<p className='text-xs text-muted-foreground'>
										{c.quantityPerUnit} viên/sp × {c.unitsProduced} sp
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

function TransactionRow({
	tx,
	openComponents,
}: {
	tx: InventoryTransaction;
	openComponents: (tx: InventoryTransaction) => void;
}) {
	const [expanded, setExpanded] = React.useState(false);
	const isBatch = tx.itemType === 'VARIANT_BATCH';
	let batchItems: {
		sku: string;
		name: string;
		quantity: number;
		variantId?: string;
		image?: string | null;
		label?: string;
		stockQuantity?: number;
	}[] = [];

	if (isBatch && tx.note) {
		try {
			const parsed = JSON.parse(tx.note);
			batchItems = parsed.items ?? [];
		} catch {}
	}

	return (
		<>
			<TableRow className='cursor-pointer' onClick={() => isBatch && setExpanded(!expanded)}>
				<TableCell className='h-10 text-xs tabular-nums align-middle'>
					{isBatch ? (
						<Button variant='ghost' size='icon' className='-ml-1 mr-1 size-6 align-middle'>
							{expanded ? (
								<ChevronDownIcon className='size-3.5' />
							) : (
								<ChevronRightIcon className='size-3.5' />
							)}
						</Button>
					) : null}
					{formatDateTime(tx.createdAt)}
				</TableCell>
				<TableCell className='h-10 align-middle'>
					<Badge variant={TX_COLOR[tx.changeType] ?? 'outline'} className='text-[10px]'>
						{tx.changeType === 'RECEIVE' && isBatch
							? 'Nhập (nhiều biến thể)'
							: (TX_LABEL[tx.changeType] ?? tx.changeType)}
					</Badge>
				</TableCell>
				<TableCell className='h-10 max-w-0 truncate text-xs text-muted-foreground align-middle'>
					{isBatch ? (
						<span className='text-xs'>{batchItems.length} biến thể</span>
					) : tx.note ? (
						<span className='text-xs'>{tx.note}</span>
					) : (
						'—'
					)}
				</TableCell>
				<TableCell className='h-10 tabular-nums font-medium align-middle'>
					{tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
				</TableCell>
				<TableCell className='h-10 text-xs text-muted-foreground align-middle'>
					{tx.createdById ? <span className='text-xs'>{tx.createdById}</span> : '—'}
				</TableCell>
				<TableCell>
					{(tx.components?.length ?? 0) > 0 ? (
						<Button
							variant='ghost'
							size='icon'
							className='size-7'
							onClick={e => {
								e.stopPropagation();
								openComponents(tx);
							}}
							title='Xem nguyên liệu đã trừ'
						>
							<EyeIcon className='size-3.5' />
						</Button>
					) : null}
				</TableCell>
			</TableRow>
			{isBatch && expanded && batchItems.length > 0 ? (
				<TableRow key={`${tx.id}-detail`}>
					<TableCell colSpan={6} className='bg-muted/30 p-0'>
						<div className='divide-y divide-border/50 border-t border-border/50'>
							{batchItems.map((item, i) => (
								<div key={item.variantId ?? i} className='flex items-center gap-3 px-8 py-2 text-xs'>
									<span className='w-8 text-muted-foreground tabular-nums'>{i + 1}.</span>
									{item.image ? (
										<img
											src={publicAssetUrl(item.image)}
											alt=''
											className='size-7 shrink-0 rounded border border-border object-cover'
											loading='lazy'
										/>
									) : (
										<div className='size-7 shrink-0 rounded bg-muted' />
									)}
									<span className='flex-1 font-medium truncate'>{item.label}</span>
									<span className='tabular-nums text-muted-foreground'>
										Tồn: {item.stockQuantity}
									</span>
									<span className='tabular-nums font-medium text-green-600'>+{item.quantity}</span>
								</div>
							))}
						</div>
					</TableCell>
				</TableRow>
			) : null}
		</>
	);
}

export default function InventoryDetailPage() {
	const { productId } = useParams<{ productId: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const crud = useEntityCrud('products');

	const { data, isLoading, error } = useQuery<InventoryDetailResponse>({
		queryKey: ['inventory-product', productId],
		queryFn: () => fetchProductInventory(productId!),
		enabled: !!productId,
	});

	const product = data?.product;
	const transactions = data?.transactions ?? [];
	const orderItems = data?.orderItems ?? [];

	// Receive dialog
	const [receiveQty, setReceiveQty] = React.useState('');
	const [receiveNote, setReceiveNote] = React.useState('');
	const [receiveOpen, setReceiveOpen] = React.useState(false);
	const [receiveVariantQtys, setReceiveVariantQtys] = React.useState<Record<string, string>>({});

	const receiveMutation = useMutation({
		mutationFn: async ({ qty, note }: { qty: number; note: string }) => {
			const hasVariants = !product?.custom && (product?.variants?.length ?? 0) > 0;
			if (hasVariants) {
				const entries = Object.entries(receiveVariantQtys)
					.map(([variantId, qtyStr]) => ({ variantId, qty: Number(qtyStr) }))
					.filter(e => e.qty > 0);
				if (entries.length === 0) throw new Error('Nhập số lượng cho ít nhất một biến thể');
				await batchReceiveVariants(
					entries.map(e => ({ id: e.variantId, quantity: e.qty })),
					note.trim() || undefined
				);
				return;
			}
			await adjustProductStock(productId!, {
				changeType: 'RECEIVE',
				quantity: qty,
				note: note.trim() || undefined,
			});
		},
		onSuccess: () => {
			toast.success('Đã nhập kho');
			setReceiveOpen(false);
			setReceiveQty('');
			setReceiveNote('');
			setReceiveVariantQtys({});
			setPreview(null);
			queryClient.invalidateQueries({ queryKey: ['inventory-product', productId] });
			queryClient.invalidateQueries({ queryKey: ['low-stock'] });
		},
		onError: (e: Error) => toast.error(e.message),
	});

	// Adjust dialog
	const [adjustQty, setAdjustQty] = React.useState('');
	const [adjustOpen, setAdjustOpen] = React.useState(false);

	const adjustMutation = useMutation({
		mutationFn: (qty: number) => adjustProductStock(productId!, { changeType: 'ADJUST', quantity: qty }),
		onSuccess: () => {
			toast.success('Đã điều chỉnh tồn kho');
			setAdjustOpen(false);
			setAdjustQty('');
			queryClient.invalidateQueries({ queryKey: ['inventory-product', productId] });
			queryClient.invalidateQueries({ queryKey: ['low-stock'] });
		},
		onError: (e: Error) => toast.error(e.message),
	});

	// Custom product preview
	const [preview, setPreview] = React.useState<CustomProductPreviewResponse | null>(null);
	const [previewLoading, setPreviewLoading] = React.useState(false);
	const prevQtyRef = React.useRef('');

	// Component detail dialog
	const [compOpen, setCompOpen] = React.useState(false);
	const [compData, setCompData] = React.useState<InventoryTransactionComponent[]>([]);
	const [compLoading, setCompLoading] = React.useState(false);

	async function openComponents(tx: InventoryTransaction) {
		if (!tx.components?.length) {
			// Fetch from API if not included
			setCompLoading(true);
			setCompOpen(true);
			try {
				const result = await fetchTransactionComponents(tx.id);
				setCompData(result);
			} catch (e) {
				toast.error('Không tải được chi tiết');
				setCompOpen(false);
			} finally {
				setCompLoading(false);
			}
		} else {
			setCompData(tx.components);
			setCompOpen(true);
		}
	}

	// Live preview for custom products
	React.useEffect(() => {
		if (!product?.custom || !receiveOpen || !receiveQty) {
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
		previewCustomProductStock(productId!, qty)
			.then(setPreview)
			.catch(() => setPreview(null))
			.finally(() => setPreviewLoading(false));
	}, [product?.custom, productId, receiveOpen, receiveQty, preview]);

	if (!productId) return null;
	if (isLoading) return <DetailSkeleton />;
	if (error || !product) {
		return (
			<div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
				<p className='text-sm font-medium text-destructive'>Không tải được thông tin tồn kho</p>
				<Button variant='outline' onClick={() => navigate('/inventory')}>
					<ArrowLeftIcon className='mr-1 size-4' /> Về tồn kho
				</Button>
			</div>
		);
	}

	return (
		<div className='space-y-4 dashboard-fade-in'>
			{/* Header */}
			<header className='rounded-xl bg-card p-4 sm:p-5 ring-1 ring-foreground/10'>
				<div className='flex items-start justify-between gap-4'>
					<div className='min-w-0 flex-1'>
						<div className='flex items-center gap-2'>
							<Button
								variant='ghost'
								size='icon'
								className='size-7 shrink-0'
								onClick={() => navigate('/inventory')}
							>
								<ArrowLeftIcon className='size-4' />
							</Button>
							<h1 className='truncate text-lg font-semibold tracking-tight' title={product.name}>
								{product.name}
							</h1>
							{product.custom ? (
								<Badge variant='outline' className='text-[10px]'>
									Custom
								</Badge>
							) : null}
						</div>
						<div className='ml-9 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
							<span className='font-mono'>{product.slug}</span>
							<Badge variant={product.status === 'ACTIVE' ? 'success' : 'outline'}>
								{product.status === 'ACTIVE'
									? 'Đang bán'
									: product.status === 'DRAFT'
										? 'Nháp'
										: 'Lưu trữ'}
							</Badge>
							<span>Giá: {product.priceVnd.toLocaleString('vi-VN')}đ</span>
							<span>Đã bán: {product.sold}</span>
						</div>
					</div>
				</div>
			</header>

			{/* Stock Overview */}
			<div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
				<div className='rounded-xl bg-card p-3 ring-1 ring-foreground/10'>
					<p className='text-xs text-muted-foreground'>Tồn kho</p>
					<p className='mt-1 text-2xl font-bold tabular-nums'>{product.stockQuantity ?? 0}</p>
				</div>
				<div className='rounded-xl bg-card p-3 ring-1 ring-foreground/10'>
					<p className='text-xs text-muted-foreground'>Ngưỡng báo hết</p>
					<p className='mt-1 text-2xl font-bold tabular-nums'>{product.lowStockThreshold ?? 5}</p>
				</div>
				<div className='rounded-xl bg-card p-3 ring-1 ring-foreground/10'>
					<p className='text-xs text-muted-foreground'>Đã xuất (đơn hàng)</p>
					<p className='mt-1 text-2xl font-bold tabular-nums'>
						{transactions
							.filter(t => t.changeType === 'DEDUCT')
							.reduce((s, t) => s + Math.abs(t.quantity), 0)}
					</p>
				</div>
				<div className='rounded-xl bg-card p-3 ring-1 ring-foreground/10'>
					<p className='text-xs text-muted-foreground'>Tổng nhập vào</p>
					<p className='mt-1 text-2xl font-bold tabular-nums'>
						{transactions.filter(t => t.changeType === 'RECEIVE').reduce((s, t) => s + t.quantity, 0)}
					</p>
				</div>
			</div>

			{/* Quick actions */}
			{crud.canUpdate ? (
				<div className='flex flex-wrap gap-2'>
					<Button size='sm' onClick={() => setReceiveOpen(true)}>
						<PlusIcon className='mr-1 size-4' /> Nhập kho
					</Button>
					<Button size='sm' variant='outline' onClick={() => setAdjustOpen(true)}>
						<MinusIcon className='mr-1 size-4' /> Điều chỉnh
					</Button>
				</div>
			) : null}

			{/* Lịch sử giao dịch */}
			<section className='overflow-hidden rounded-lg border bg-background'>
				<div className='border-b border-border/60 px-4 py-3'>
					<div className='flex items-center gap-2'>
						<HistoryIcon className='size-4 text-muted-foreground' />
						<h2 className='text-sm font-semibold'>Lịch sử nhập/xuất</h2>
					</div>
				</div>
				<div className='overflow-x-auto'>
					<Table className='table-fixed'>
						<TableHeader>
							<TableRow>
								<TableHead>Thời gian</TableHead>
								<TableHead>Loại</TableHead>
								<TableHead>Nội dung</TableHead>
								<TableHead>Số lượng</TableHead>
								<TableHead>Người thực hiện</TableHead>
								<TableHead className='w-12' />
							</TableRow>
						</TableHeader>
						<TableBody>
							{transactions.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className='py-8 text-center text-sm text-muted-foreground'>
										Chưa có giao dịch nào.
									</TableCell>
								</TableRow>
							) : (
								transactions.map(tx => (
									<TransactionRow key={tx.id} tx={tx} openComponents={openComponents} />
								))
							)}
						</TableBody>
					</Table>
				</div>
			</section>

			{/* Đơn hàng chứa sản phẩm này */}
			<section className='overflow-hidden rounded-lg border bg-background'>
				<div className='border-b border-border/60 px-4 py-3'>
					<div className='flex items-center gap-2'>
						<ShoppingCartIcon className='size-4 text-muted-foreground' />
						<h2 className='text-sm font-semibold'>Đơn hàng có sản phẩm này</h2>
					</div>
				</div>
				<div className='overflow-x-auto'>
					<Table className='table-fixed'>
						<TableHeader>
							<TableRow>
								<TableHead>Mã đơn</TableHead>
								<TableHead>Khách hàng</TableHead>
								<TableHead>SL</TableHead>
								<TableHead>Trạng thái</TableHead>
								<TableHead className='hidden sm:table-cell'>Thanh toán</TableHead>
								<TableHead className='text-right'>Thao tác</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orderItems.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className='py-8 text-center text-sm text-muted-foreground'>
										Chưa có đơn hàng nào chứa sản phẩm này.
									</TableCell>
								</TableRow>
							) : (
								orderItems.map(oi => (
									<TableRow key={oi.id}>
										<TableCell className='font-mono text-xs'>{oi.order.orderNumber}</TableCell>
										<TableCell className='text-sm'>{oi.order.customerName}</TableCell>
										<TableCell className='tabular-nums'>x{oi.quantity}</TableCell>
										<TableCell>
											<Badge
												variant={STATUS_BADGE[oi.order.status] ?? 'outline'}
												className='text-[10px]'
											>
												{oi.order.status === 'PENDING'
													? 'Chờ xử lý'
													: oi.order.status === 'CONFIRMED'
														? 'Đã xác nhận'
														: oi.order.status === 'PROCESSING'
															? 'Đang xử lý'
															: oi.order.status === 'SHIPPED'
																? 'Đã gửi'
																: oi.order.status === 'DELIVERED'
																	? 'Đã giao'
																	: oi.order.status === 'CANCELLED'
																		? 'Đã hủy'
																		: oi.order.status}
											</Badge>
										</TableCell>
										<TableCell className='hidden sm:table-cell text-xs'>
											<Badge
												variant={oi.order.paymentStatus === 'PAID' ? 'success' : 'warning'}
												className='text-[10px]'
											>
												{oi.order.paymentStatus === 'PAID'
													? 'Đã thanh toán'
													: 'Chưa thanh toán'}
											</Badge>
										</TableCell>
										<TableCell className='text-right'>
											<Button variant='ghost' size='sm' className='text-xs' asChild>
												<Link to={`/orders/${oi.order.id}`}>Xem</Link>
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</section>

			{/* Nhập kho dialog */}
			<Dialog
				open={receiveOpen}
				onOpenChange={o => {
					if (!o) setReceiveVariantQtys({});
					setReceiveOpen(o);
				}}
			>
				<DialogContent
					className={(() => {
						const vc = product.variants?.length ?? 0;
						if (!product.custom && vc > 5) return 'max-w-2xl';
						if (!product.custom && vc > 0) return 'max-w-lg';
						if (product.custom) return 'max-w-xl';
						return undefined;
					})()}
				>
					<DialogHeader>
						<DialogTitle>Nhập kho</DialogTitle>
					</DialogHeader>
					<div className='space-y-4 py-4'>
						<p className='text-sm text-muted-foreground'>
							Sản phẩm: <strong>{product.name}</strong>
							<br />
							{(() => {
								const hasVariants = !product.custom && (product.variants?.length ?? 0) > 0;
								if (hasVariants)
									return (
										<span className='text-xs text-muted-foreground'>
											(Nhập số lượng cho từng biến thể)
										</span>
									);
								return (
									<>
										Tồn hiện tại: <span className='tabular-nums'>{product.stockQuantity ?? 0}</span>
										{product.custom ? (
											<span className='ml-2 text-xs text-muted-foreground'>
												(Custom — sẽ trừ nguyên liệu)
											</span>
										) : null}
									</>
								);
							})()}
						</p>

						{/* Variant product — per-variant rows */}
						{!product.custom && (product.variants?.length ?? 0) > 0 ? (
							<div className='space-y-2'>
								<label className='text-xs font-medium text-muted-foreground'>
									Số lượng nhập theo biến thể
								</label>
								<VariantStockInputs
									variants={product.variants!}
									values={receiveVariantQtys}
									onChange={(id, val) => setReceiveVariantQtys(prev => ({ ...prev, [id]: val }))}
									disabled={receiveMutation.isPending}
								/>
							</div>
						) : (
							<>
								<div className='space-y-2'>
									<label className='text-xs font-medium text-muted-foreground'>Số lượng nhập</label>
									<Input
										type='number'
										min={1}
										value={receiveQty}
										onChange={e => setReceiveQty(e.target.value.replace(/[^0-9]/g, ''))}
										placeholder='0'
										disabled={receiveMutation.isPending}
									/>
								</div>

								{/* Custom product — component preview */}
								{product.custom && preview ? (
									<div className='space-y-2'>
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
										<Skeleton className='h-8 w-48' />
										<Skeleton className='h-12 w-full' />
										<Skeleton className='h-12 w-full' />
									</div>
								) : null}
							</>
						)}

						<div className='space-y-2'>
							<label className='text-xs font-medium text-muted-foreground'>Ghi chú (tùy chọn)</label>
							<Input
								value={receiveNote}
								onChange={e => setReceiveNote(e.target.value)}
								placeholder='Nhập kho lần 1, bổ sung hàng...'
								disabled={receiveMutation.isPending}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setReceiveOpen(false)}
							disabled={receiveMutation.isPending}
						>
							Hủy
						</Button>
						<Button
							onClick={() => receiveMutation.mutate({ qty: Number(receiveQty), note: receiveNote })}
							disabled={(() => {
								if (receiveMutation.isPending) return true;
								const hasVariants = !product.custom && (product.variants?.length ?? 0) > 0;
								if (hasVariants) return !Object.values(receiveVariantQtys).some(v => Number(v) > 0);
								return !receiveQty || (product.custom && preview ? !preview.sufficient : false);
							})()}
						>
							{receiveMutation.isPending ? 'Đang nhập...' : 'Xác nhận'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Điều chỉnh dialog */}
			<Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Điều chỉnh tồn kho</DialogTitle>
					</DialogHeader>
					<div className='space-y-4 py-4'>
						<p className='text-sm text-muted-foreground'>
							Sản phẩm: <strong>{product.name}</strong>
							<br />
							Tồn hiện tại: <span className='tabular-nums'>{product.stockQuantity ?? 0}</span>
						</p>
						<p className='text-xs text-muted-foreground'>
							Số dương = nhập thêm, số âm = xuất bớt. Ví dụ: nhập 5 ghi 5, xuất 3 ghi -3.
						</p>
						<div>
							<label className='text-xs font-medium text-muted-foreground'>Số lượng (±)</label>
							<Input
								type='number'
								value={adjustQty}
								onChange={e =>
									setAdjustQty(
										e.target.value.replace(
											/^-?[0-9]*$/.test(e.target.value) ? '' : '',
											e.target.value
										)
									)
								}
								placeholder='0'
								disabled={adjustMutation.isPending}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setAdjustOpen(false)}
							disabled={adjustMutation.isPending}
						>
							Hủy
						</Button>
						<Button
							onClick={() => adjustMutation.mutate(Number(adjustQty))}
							disabled={adjustMutation.isPending || !adjustQty}
						>
							{adjustMutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Component breakdown dialog */}
			<ComponentBreakdownDialog
				open={compOpen}
				onOpenChange={setCompOpen}
				components={compData}
				loading={compLoading}
			/>
		</div>
	);
}

function DetailSkeleton() {
	return (
		<div className='space-y-4'>
			<Skeleton className='h-14 w-full rounded-xl' />
			<div className='grid grid-cols-4 gap-3'>
				{[1, 2, 3, 4].map(i => (
					<Skeleton key={i} className='h-20 rounded-xl' />
				))}
			</div>
			<Skeleton className='h-64 rounded-xl' />
			<Skeleton className='h-48 rounded-xl' />
		</div>
	);
}
