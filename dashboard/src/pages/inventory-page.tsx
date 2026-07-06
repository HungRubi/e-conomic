import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  fetchProducts,
  type AdminProductRow,
} from '@/api/admin-products';
import {
  fetchLowStock,
  adjustProductStock,
  batchReceiveVariants,
  previewCustomProductStock,
  type CustomProductPreviewResponse,
} from '@/api/admin-inventory';
import { usePaginatedProductList, type ProductListSortKey } from '@/hooks/use-paginated-product-list';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { TableEmptyStateRow } from '@/components/table-empty-state-row';
import { TableErrorStateRow } from '@/components/table-error-state-row';
import { TableRowsSkeleton } from '@/components/list-skeletons';
import { fmtUserDate } from '@/components/users/user-table-shared';
import { useEntityCrud } from '@/hooks/use-permission';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
  PackageOpenIcon,
  GripVerticalIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  EyeIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { VariantStockInputs } from '@/components/inventory/variant-stock-inputs';

const listProducts = (params: Parameters<typeof fetchProducts>[0]) => fetchProducts(params);

function StockBadge({ value, threshold }: { value?: number; threshold?: number }) {
  if (value === undefined || value === null) return <span className='text-muted-foreground'>—</span>;
  const t = threshold ?? 5;
  if (value === 0) return <Badge variant='destructive'>Hết hàng</Badge>;
  if (value <= t) return <Badge variant='warning'>Sắp hết ({value})</Badge>;
  return <Badge variant='success'>Còn {value}</Badge>;
}

export default function InventoryPage() {
  const navigate = useNavigate();
  const crud = useEntityCrud('products');
  const [qDraft, setQDraft] = React.useState('');
  const [qInput, setQInput] = React.useState('');
  const [sortBy, setSortBy] = React.useState<ProductListSortKey>('sortOrder');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = React.useState(10);
  const [statusFilter, setStatusFilter] = React.useState<'all' | AdminProductRow['status']>('all');

  const { rows, total, loading, error, page, setPage, refetch } = usePaginatedProductList(
    listProducts,
    qInput,
    sortBy,
    sortOrder,
    pageSize,
    statusFilter
  );

  const { data: lowStockData } = useQuery({
    queryKey: ['low-stock'],
    queryFn: fetchLowStock,
  });

  React.useEffect(() => {
    const handle = window.setTimeout(() => setQInput(qDraft), 500);
    return () => window.clearTimeout(handle);
  }, [qDraft]);

  const outOfStock = lowStockData ? [
    ...lowStockData.products.filter(p => p.stockQuantity === 0),
    ...lowStockData.variants.filter(v => v.stockQuantity === 0),
    ...lowStockData.materials.filter(m => m.stockQuantity === 0),
  ] : [];

  const lowStockItems = lowStockData ? [
    ...lowStockData.products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold),
    ...lowStockData.variants.filter(v => v.stockQuantity > 0 && v.stockQuantity <= v.lowStockThreshold),
    ...lowStockData.materials.filter(m => m.stockQuantity > 0 && m.stockQuantity <= m.lowStockThreshold),
  ] : [];

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Receive dialog state
  const [receiveTarget, setReceiveTarget] = React.useState<AdminProductRow | null>(null);
  const [receiveQty, setReceiveQty] = React.useState('');
  const [receiveNote, setReceiveNote] = React.useState('');
  const [receiveBusy, setReceiveBusy] = React.useState(false);
  const [preview, setPreview] = React.useState<CustomProductPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const prevQtyRef = React.useRef('');
  const [variantQtys, setVariantQtys] = React.useState<Record<string, string>>({});

  // Live preview for custom products
  React.useEffect(() => {
    if (!receiveTarget?.custom || !receiveQty) { setPreview(null); return; }
    const qty = Number(receiveQty);
    if (!qty || qty <= 0) { setPreview(null); return; }
    if (prevQtyRef.current === receiveQty && preview) return;
    prevQtyRef.current = receiveQty;
    setPreviewLoading(true);
    previewCustomProductStock(receiveTarget.id, qty)
      .then(setPreview)
      .catch(() => setPreview(null))
      .finally(() => setPreviewLoading(false));
  }, [receiveTarget, receiveQty, preview]);

  async function handleReceive() {
    if (!receiveTarget) return;

    const note = receiveNote.trim() || undefined;
    const hasVariants = !receiveTarget.custom && (receiveTarget.variants?.length ?? 0) > 0;

    if (hasVariants) {
      const entries = Object.entries(variantQtys)
        .map(([variantId, qtyStr]) => ({ variantId, qty: Number(qtyStr) }))
        .filter(e => e.qty > 0);
      if (entries.length === 0) { toast.error('Nhập số lượng cho ít nhất một biến thể'); return; }

      setReceiveBusy(true);
      try {
        await batchReceiveVariants(
          entries.map(e => ({ id: e.variantId, quantity: e.qty })),
          note,
        );
        toast.success(`Đã nhập ${entries.length} biến thể`);
        setReceiveTarget(null);
        setReceiveQty('');
        setVariantQtys({});
        setReceiveNote('');
        await refetch({ silent: true });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Nhập kho thất bại');
      } finally {
        setReceiveBusy(false);
      }
      return;
    }

    // Single product (no variants, or custom)
    const qty = Number(receiveQty);
    if (!qty || qty <= 0) { toast.error('Nhập số lượng hợp lệ'); return; }
    setReceiveBusy(true);
    try {
      await adjustProductStock(receiveTarget.id, { changeType: 'RECEIVE', quantity: qty, note });
      toast.success(`Đã nhập ${qty} sản phẩm`);
      setReceiveTarget(null);
      setReceiveQty('');
      setReceiveNote('');
      setPreview(null);
      await refetch({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Nhập kho thất bại');
    } finally {
      setReceiveBusy(false);
    }
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4 dashboard-fade-in'>
      {/* Header */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-lg font-semibold tracking-tight'>Tồn kho</h1>
          <p className='text-muted-foreground text-sm'>
            Danh sách sản phẩm kèm tồn kho. Nhấn "Quản lý" để xem chi tiết và nhập/xuất.
          </p>
        </div>
      </div>

      {/* Overview cards */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <div className='rounded-xl bg-card p-3 ring-1 ring-foreground/10'>
          <div className='flex items-center gap-2 text-muted-foreground text-xs'>
            <PackageOpenIcon className='size-4' />
            <span>Tổng SP</span>
          </div>
          <p className='mt-1.5 text-xl font-semibold tabular-nums tracking-tight'>
            {loading ? <Skeleton className='h-6 w-12' /> : total}
          </p>
        </div>
        <div className='rounded-xl bg-card p-3 ring-1 ring-foreground/10'>
          <div className='flex items-center gap-2 text-muted-foreground text-xs'>
            <span className='size-2 rounded-full bg-green-500' />
            <span>Còn hàng</span>
          </div>
          <p className='mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-green-600'>
            {loading ? <Skeleton className='h-6 w-12' /> : total - outOfStock.length - lowStockItems.length}
          </p>
        </div>
        <div className='rounded-xl bg-card p-3 ring-1 ring-foreground/10'>
          <div className='flex items-center gap-2 text-muted-foreground text-xs'>
            <AlertTriangleIcon className='size-4 text-amber-500' />
            <span>Sắp hết</span>
          </div>
          <p className='mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-amber-600'>
            {loading ? <Skeleton className='h-6 w-12' /> : lowStockItems.length}
          </p>
        </div>
        <div className='rounded-xl bg-card p-3 ring-1 ring-foreground/10'>
          <div className='flex items-center gap-2 text-muted-foreground text-xs'>
            <AlertTriangleIcon className='size-4 text-red-500' />
            <span>Hết hàng</span>
          </div>
          <p className='mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-red-600'>
            {loading ? <Skeleton className='h-6 w-12' /> : outOfStock.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end'>
        <div className='min-w-48 flex-1'>
          <Input
            id='inv-q'
            placeholder='Tên, mô tả, tiêu đề chi tiết'
            value={qDraft}
            onChange={e => setQDraft(e.target.value)}
            autoComplete='off'
            spellCheck={false}
          />
        </div>
        <div className='flex flex-wrap gap-2'>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className='w-36'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='all'>Mọi trạng thái</SelectItem>
                <SelectItem value='DRAFT'>Nháp</SelectItem>
                <SelectItem value='ACTIVE'>Đang bán</SelectItem>
                <SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={v => setSortBy(v as ProductListSortKey)}>
            <SelectTrigger className='w-36'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='sortOrder'>Thứ tự</SelectItem>
                <SelectItem value='name'>Tên</SelectItem>
                <SelectItem value='price'>Giá</SelectItem>
                <SelectItem value='createdAt'>Ngày tạo</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={v => setSortOrder(v as typeof sortOrder)}>
            <SelectTrigger className='w-28'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='asc'>Tăng dần</SelectItem>
                <SelectItem value='desc'>Giảm dần</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
            <SelectTrigger className='w-20'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[10, 20, 50].map(n => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-lg border bg-background'>
        <Table className='table-fixed'>
          <TableHeader>
            <TableRow>
              <TableHead className='w-10'>
                <div className='flex items-center justify-center'>
                  <GripVerticalIcon className='text-muted-foreground size-4' />
                </div>
              </TableHead>
              <TableHead className='w-14'>Ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead className='hidden md:table-cell'>Ngưỡng</TableHead>
              <TableHead className='text-muted-foreground hidden md:table-cell'>Cập nhật</TableHead>
              <TableHead className='w-16 text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRowsSkeleton rows={5} columns={8} />
            ) : error ? (
              <TableErrorStateRow colSpan={8} message={error} onRetry={() => void refetch()} />
            ) : rows.length === 0 ? (
              <TableEmptyStateRow colSpan={8} />
            ) : (
              rows.map(row => (
                <TableRow
                  key={row.id}
                  className='cursor-pointer dashboard-row-enter'
                  onClick={() => navigate(`/inventory/${row.id}`)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/inventory/${row.id}`);
                    }
                  }}
                >
                  <TableCell>
                    <div className='flex items-center justify-center' onClick={e => e.stopPropagation()}>
                      <GripVerticalIcon className='text-muted-foreground size-4' />
                    </div>
                  </TableCell>
                  <TableCell>
                    <img
                      src={publicAssetUrl(row.image)}
                      alt=''
                      className='size-10 rounded-md border border-border object-cover'
                      loading='lazy'
                    />
                  </TableCell>
                  <TableCell className='max-w-0 truncate font-medium' title={row.name}>{row.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={row.status === 'ACTIVE' ? 'success' : row.status === 'DRAFT' ? 'outline' : 'secondary'}
                    >
                      {row.status === 'ACTIVE' ? 'Đang bán' : row.status === 'DRAFT' ? 'Nháp' : 'Lưu trữ'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StockBadge value={row.stockQuantity} threshold={row.lowStockThreshold} />
                  </TableCell>
                  <TableCell className='hidden md:table-cell text-sm'>{row.lowStockThreshold ?? 5}</TableCell>
                  <TableCell className='text-muted-foreground hidden text-sm md:table-cell'>
                    {fmtUserDate(row.updatedAt)}
                  </TableCell>
                  <TableCell className='text-right' onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='ml-auto size-8 text-muted-foreground data-[state=open]:bg-muted'
                          aria-label='Thao tác tồn kho'
                          onClick={e => e.stopPropagation()}
                        >
                          <EllipsisVerticalIcon className='size-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-44'>
                        <DropdownMenuItem onClick={() => navigate(`/inventory/${row.id}`)}>
                          <EyeIcon className='size-4' />
                          Quản lý kho
                        </DropdownMenuItem>
                        {crud.canUpdate ? (
                          <DropdownMenuItem onClick={() => { setReceiveTarget(row); setReceiveQty('1'); }}>
                            <PlusIcon className='size-4' />
                            Nhập kho
                          </DropdownMenuItem>
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

      {/* Pagination */}
      <div className='text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between'>
        <span>
          Hiển thị {total === 0 ? 0 : page * pageSize + 1}&ndash;{Math.min((page + 1) * pageSize, total)} / {total}
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
          <span>Trang {page + 1} / {pageCount}</span>
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

      <Dialog open={!!receiveTarget} onOpenChange={o => { if (!o) { setReceiveTarget(null); setVariantQtys({}); } }}>
        <DialogContent className={(() => {
          const t = receiveTarget;
          if (!t) return undefined;
          if (!t.custom && (t.variants?.length ?? 0) > 5) return 'max-w-2xl';
          if (t.custom) return 'max-w-xl';
          return undefined;
        })()}>
          <DialogHeader>
            <DialogTitle>Nhập kho</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <p className='text-sm text-muted-foreground'>
              Sản phẩm: <strong>{receiveTarget?.name}</strong>
              <br />
              {(() => {
                const t = receiveTarget;
                const hasVariants = !t?.custom && (t?.variants?.length ?? 0) > 0;
                if (hasVariants) return <span className='text-xs text-muted-foreground'>(Nhập số lượng cho từng biến thể)</span>;
                return <>Tồn hiện tại: <span className='tabular-nums'>{receiveTarget?.stockQuantity ?? 0}</span>
                {receiveTarget?.custom ? <span className='ml-2 text-xs text-muted-foreground'>(Custom — sẽ trừ nguyên liệu)</span> : null}</>;
              })()}
            </p>

            {/* Variant product — per-variant rows */}
            {!receiveTarget?.custom && (receiveTarget?.variants?.length ?? 0) > 0 ? (
              <div className='space-y-2'>
                <label className='text-xs font-medium text-muted-foreground'>Số lượng nhập theo biến thể</label>
                <VariantStockInputs
                  variants={receiveTarget!.variants!}
                  values={variantQtys}
                  onChange={(id, val) => setVariantQtys(prev => ({ ...prev, [id]: val }))}
                  disabled={receiveBusy}
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
                    disabled={receiveBusy}
                  />
                </div>

                {/* Custom product — component preview */}
                {receiveTarget?.custom && preview ? (
                  <div className='space-y-2'>
                    <label className='text-xs font-medium text-muted-foreground'>Nguyên liệu sẽ trừ</label>
                    <div className='grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto rounded-lg border p-2'>
{preview.requirements.map((r, i) => (
                        <div key={i} className='flex items-center gap-3 px-3 py-2.5'>
                          {r.componentImage ? (
                            <img src={publicAssetUrl(r.componentImage)} alt='' className='size-9 shrink-0 rounded border border-border object-cover' loading='lazy' />
                          ) : (
                            <div className='size-9 shrink-0 rounded bg-muted' />
                          )}
                          <div className='min-w-0 flex-1'>
                            <p className='text-sm font-medium truncate'>{r.componentName}</p>
                            <p className='text-xs text-muted-foreground'>{(r.amountVnd).toLocaleString('vi-VN')}₫ × {r.quantityPerUnit} viên/sp</p>
                          </div>
                          <div className='text-right text-sm tabular-nums'>
                            <p className={r.materialStock.sufficient ? 'text-destructive' : 'text-destructive font-semibold'}>-{r.totalDeducted}</p>
                            <p className={'text-xs ' + (r.materialStock.sufficient ? 'text-muted-foreground' : 'text-destructive')}>
                              {r.materialStock.sufficient ? `Còn ${r.materialStock.remaining}` : `Thiếu ${Math.abs(r.materialStock.remaining)} (có ${r.materialStock.current})`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {!preview.sufficient ? (
                      <p className='text-xs font-medium text-destructive'>⚠ Không đủ nguyên liệu! Vui lòng nhập kho nguyên liệu trước.</p>
                    ) : null}
                  </div>
                ) : receiveTarget?.custom && previewLoading ? (
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
                disabled={receiveBusy}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setReceiveTarget(null)} disabled={receiveBusy}>Hủy</Button>
            <Button
              onClick={() => void handleReceive()}
              disabled={(() => {
                if (receiveBusy) return true;
                const t = receiveTarget;
                if (!t) return true;
                const hasVariants = !t.custom && (t.variants?.length ?? 0) > 0;
                if (hasVariants) {
                  const hasQty = Object.values(variantQtys).some(v => Number(v) > 0);
                  return !hasQty;
                }
                return !receiveQty || (t.custom && preview ? !preview.sufficient : false);
              })()}
            >
              {receiveBusy ? 'Đang nhập...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
