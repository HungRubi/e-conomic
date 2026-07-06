import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangleIcon,
  ArchiveIcon,
  ArrowLeftIcon,
  BadgeCheckIcon,
  BanknoteIcon,
  BoxIcon,
  CalendarClockIcon,
  CopyIcon,
  HashIcon,
  InfoIcon,
  MailIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  PrinterIcon,
  RocketIcon,
  StickyNoteIcon,
  TruckIcon,
  UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { getOrder, updateOrder, type OrderRow } from '@/api/admin-orders';
import { EditableField } from '@/components/common/editable-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Skeleton } from '@/components/ui/skeleton';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { cn } from '@/lib/utils';

import { OrderStatusBadge } from './order-status-badge';
import { OrderTimeline } from './order-timeline';
import { printInvoice } from './order-invoice-print';
import { PaymentStatusBadge } from './payment-status-badge';
import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  canTransitionTo,
  primaryNextStatus,
  primaryActionLabel,
  isOrderTerminal,
} from './order-status-helpers';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

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

function shippingAddressLines(addr: Record<string, unknown>): string[] {
  const out: string[] = [];
  const line1 = typeof addr.line1 === 'string' ? addr.line1.trim() : '';
  if (line1) out.push(line1);
  const ward = typeof addr.ward === 'string' ? addr.ward.trim() : '';
  const district = typeof addr.district === 'string' ? addr.district.trim() : '';
  const province = typeof addr.province === 'string' ? addr.province.trim() : '';
  const adminLine = [ward, district, province].filter(Boolean).join(', ');
  if (adminLine) out.push(adminLine);
  const note = typeof addr.note === 'string' ? addr.note.trim() : '';
  if (note) out.push('Ghi chú: ' + note);
  return out;
}

async function copyToClipboard(value: string, message: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(message);
  } catch {
    toast.error('Không sao chép được');
  }
}

const ALL_PAYMENT_STATUSES = [
  { value: 'PENDING', label: 'Chờ thanh toán' },
  { value: 'AWAITING_CONFIRMATION', label: 'Chờ xác nhận CK' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền' },
];

const STATUS_STYLE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  PENDING: 'warning',
  CONFIRMED: 'secondary',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'secondary',
};

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

function InfoCell({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex items-start gap-2.5'>
      <Icon className='mt-0.5 size-3.5 shrink-0 text-muted-foreground' aria-hidden />
      <div className='min-w-0 flex-1'>
        <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>{label}</p>
        <div className='mt-0.5 text-sm wrap-break-word'>{children}</div>
      </div>
    </div>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className='mt-2 flex items-start gap-1.5 rounded-md bg-blue-50/50 px-3 py-2 text-[11px] leading-relaxed text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'>
      <InfoIcon className='mt-0.5 size-3 shrink-0' aria-hidden />
      <span>{children}</span>
    </p>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-20 w-full rounded-xl' />
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'>
        <div className='space-y-3'>
          <Skeleton className='h-56 w-full rounded-xl' />
          <Skeleton className='h-44 w-full rounded-xl' />
          <Skeleton className='h-32 w-full rounded-xl' />
        </div>
        <div className='space-y-3'>
          <Skeleton className='h-52 w-full rounded-xl' />
          <Skeleton className='h-40 w-full rounded-xl' />
        </div>
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 p-10 text-center'>
      <PackageIcon className='size-8 text-muted-foreground' aria-hidden />
      <p className='text-sm font-medium'>Không tìm thấy đơn hàng</p>
      <Button asChild type='button' variant='outline'>
        <Link to='/orders'>
          <ArrowLeftIcon className='mr-1 size-4' />
          Về danh sách
        </Link>
      </Button>
    </div>
  );
}

export function OrderDetailPanel() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId ?? '';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: orderId.length > 0,
  });

  if (!orderId) return <NotFoundState />;
  if (isLoading) return <OrderDetailSkeleton />;
  if (error) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
        <p className='text-sm font-medium text-destructive'>
          {error instanceof Error ? error.message : 'Không tải được đơn hàng'}
        </p>
        <div className='flex gap-2'>
          <Button type='button' variant='outline' onClick={() => void refetch()}>
            Thử lại
          </Button>
          <Button asChild type='button' variant='ghost'>
            <Link to='/orders'>
              <ArrowLeftIcon className='mr-1 size-4' />
              Về danh sách
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  if (!data) return <NotFoundState />;

  return <OrderDetailContent order={data} onChanged={() => void refetch()} />;
}

function OrderDetailContent({
  order,
  onChanged,
}: {
  order: OrderRow;
  onChanged: () => void;
}) {
  const navigate = useNavigate();
  const addrLines = shippingAddressLines(order.shippingAddress);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelBusy, setCancelBusy] = React.useState(false);
  const [refundOpen, setRefundOpen] = React.useState(false);
  const [refundBusy, setRefundBusy] = React.useState(false);
  const [shippingOpen, setShippingOpen] = React.useState(false);
  const [shipTracking, setShipTracking] = React.useState(order.trackingNumber ?? '');
  const [shipProvider, setShipProvider] = React.useState(order.shippingProvider ?? '');
  const [shipBusy, setShipBusy] = React.useState(false);

  async function patch(body: Parameters<typeof updateOrder>[1]) {
    await updateOrder(order.id, body);
    onChanged();
  }

  async function handleConfirm() {
    const body: Parameters<typeof updateOrder>[1] = { status: 'CONFIRMED' };
    if (order.paymentMethod === 'BANKING' && order.paymentStatus === 'PENDING') {
      body.paymentStatus = 'PAID';
    }
    await updateOrder(order.id, body);
    onChanged();
  }

  async function handleShippedConfirm() {
    if (!shipTracking.trim()) {
      toast.error('Vui lòng nhập mã vận đơn');
      return;
    }
    setShipBusy(true);
    try {
      await updateOrder(order.id, {
        status: 'SHIPPED',
        trackingNumber: shipTracking.trim(),
        shippingProvider: shipProvider.trim() || undefined,
      });
      toast.success('Đã chuyển sang "' + ORDER_STATUS_LABEL['SHIPPED'] + '"');
      setShippingOpen(false);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cập nhật thất bại');
    } finally {
      setShipBusy(false);
    }
  }

  async function handleDelivered() {
    const body: Parameters<typeof updateOrder>[1] = { status: 'DELIVERED' };
    if (order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING') {
      body.paymentStatus = 'PAID';
    }
    await updateOrder(order.id, body);
    onChanged();
  }

  async function handleCancel() {
    setCancelBusy(true);
    try {
      await updateOrder(order.id, { status: 'CANCELLED' });
      toast.success('Đã hủy đơn');
      setCancelOpen(false);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Hủy thất bại');
    } finally {
      setCancelBusy(false);
    }
  }

  async function handleRefund() {
    setRefundBusy(true);
    try {
      await updateOrder(order.id, { status: 'REFUNDED' });
      toast.success('Đã chuyển sang "' + ORDER_STATUS_LABEL['REFUNDED'] + '"');
      setRefundOpen(false);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Hoàn tiền thất bại');
    } finally {
      setRefundBusy(false);
    }
  }

  const primaryNext = primaryNextStatus(order.status);
  const terminal = isOrderTerminal(order.status);

  function handlePrimaryClick() {
    if (!primaryNext) return;
    if (primaryNext === 'CONFIRMED') {
      void handleConfirm();
    } else if (primaryNext === 'SHIPPED') {
      setShipTracking(order.trackingNumber ?? '');
      setShipProvider(order.shippingProvider ?? '');
      setShippingOpen(true);
      return;
    } else if (primaryNext === 'DELIVERED') {
      void handleDelivered();
    } else {
      void patch({ status: primaryNext });
    }
  }

  const primaryLabel = primaryNext ? primaryActionLabel(primaryNext) : '';

  return (
    <div className='dashboard-fade-in space-y-4'>
      {/* HEADER */}
      <header className='rounded-xl bg-card p-4 sm:p-5 lg:p-6 ring-1 ring-foreground/10'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-1'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='-ml-1.5 size-7 shrink-0'
                data-print-hide
                onClick={() => navigate('/orders')}
                aria-label='Quay lại danh sách'
              >
                <ArrowLeftIcon className='size-4' />
              </Button>
              <h1 className='font-mono text-lg font-semibold tracking-tight' translate='no'>
                {order.orderNumber}
              </h1>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-7 text-muted-foreground'
                onClick={() => copyToClipboard(order.orderNumber, 'Đã sao chép mã đơn')}
                aria-label='Sao chép mã đơn'
              >
                <CopyIcon className='size-3.5' />
              </Button>
            </div>
            <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
              <span className='inline-flex items-center gap-1'>
                <CalendarClockIcon className='size-3.5' aria-hidden />
                Tạo {formatDateTime(order.createdAt)}
              </span>
              {order.updatedAt !== order.createdAt ? (
                <>
                  <span aria-hidden>·</span>
                  <span>Cập nhật {formatDateTime(order.updatedAt)}</span>
                </>
              ) : null}
            </div>
          </div>
          <div className='flex shrink-0 flex-wrap items-center gap-2' data-print-hide>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='gap-1.5'
              onClick={() => printInvoice(order)}
            >
              <PrinterIcon className='size-3.5' />
              In hóa đơn
            </Button>
          </div>
        </div>
      </header>

      {/* GRID */}
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'>
        {/* LEFT COLUMN */}
        <div className='min-w-0 space-y-4'>
          {/* Sản phẩm (read-only snapshot) */}
          <section className='rounded-xl bg-card ring-1 ring-foreground/10'>
            <div className='border-b border-border/60 p-4'>
              <SectionHeading
                icon={PackageIcon}
                title={'Sản phẩm (' + order.items.length + ')'}
                hint='Thông tin sản phẩm lúc đặt — không thay đổi khi sản phẩm cập nhật.'
              />
            </div>
            <ul className='divide-y divide-border/60'>
              {order.items.map((item) => (
                <li key={item.id} className='flex items-center gap-3 px-4 py-3'>
                  <div className='relative size-14 shrink-0 overflow-hidden rounded-md border bg-muted'>
                    {item.imageSnapshot ? (
                      <img
                        src={publicAssetUrl(item.imageSnapshot)}
                        alt=''
                        width={56}
                        height={56}
                        className='absolute inset-0 h-full w-full object-cover'
                        loading='lazy'
                        decoding='async'
                      />
                    ) : (
                      <div className='absolute inset-0 flex items-center justify-center text-muted-foreground'>
                        <PackageIcon className='size-5' aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='line-clamp-2 text-sm font-medium leading-snug'>{item.nameSnapshot}</p>
                    {item.variantLabel ? (
                      <p className='mt-0.5 text-xs font-medium text-muted-foreground'>{item.variantLabel}</p>
                    ) : null}
                    <p className='mt-0.5 font-mono text-xs text-muted-foreground' translate='no'>
                      {item.productSlug}
                    </p>
                  </div>
                  <div className='shrink-0 text-right text-sm tabular-nums'>
                    <p className='text-xs text-muted-foreground'>
                      {formatCurrency(item.priceVndSnapshot)} × {item.quantity}
                    </p>
                    <p className='font-semibold'>{formatCurrency(item.lineTotalVnd)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className='space-y-1.5 border-t border-border/60 bg-muted/30 px-4 py-3 text-sm tabular-nums'>
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>Tạm tính</dt>
                <dd>{formatCurrency(order.subtotalVnd)}</dd>
              </div>
              {order.discountVnd > 0 ? (
                <div className='flex justify-between text-emerald-700 dark:text-emerald-400'>
                  <dt className='inline-flex items-center gap-1.5'>
                    <BadgeCheckIcon className='size-3.5' aria-hidden />
                    Giảm giá{order.discountCode ? ' · ' + order.discountCode : ''}
                  </dt>
                  <dd>−{formatCurrency(order.discountVnd)}</dd>
                </div>
              ) : null}
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>Vận chuyển</dt>
                <dd>{order.shippingVnd === 0 ? 'Miễn phí' : formatCurrency(order.shippingVnd)}</dd>
              </div>
              <div className='mt-1 flex justify-between border-t border-border/60 pt-2 text-base font-semibold'>
                <dt>Tổng cộng</dt>
                <dd>{formatCurrency(order.totalVnd)}</dd>
              </div>
            </dl>
          </section>

          {/* Khách hàng (read-only) */}
          <section className='dashboard-slide-up rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
            <SectionHeading icon={UserIcon} title='Khách hàng' />
            <div className='mt-3 grid gap-3 sm:grid-cols-2'>
              <InfoCell icon={UserIcon} label='Khách hàng'>
                <span className='font-medium'>{order.customerName}</span>
              </InfoCell>
              <InfoCell icon={PhoneIcon} label='Điện thoại'>
                <button
                  type='button'
                  className='font-mono tabular-nums underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none'
                  onClick={() => copyToClipboard(order.customerPhone, 'Đã sao chép SĐT')}
                >
                  {order.customerPhone}
                </button>
              </InfoCell>
              {order.customerEmail ? (
                <InfoCell icon={MailIcon} label='Email'>
                  <button
                    type='button'
                    className='break-all underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none'
                    onClick={() => copyToClipboard(order.customerEmail!, 'Đã sao chép email')}
                  >
                    {order.customerEmail}
                  </button>
                </InfoCell>
              ) : null}
              <InfoCell icon={HashIcon} label='Mã khách'>
                <span className='font-mono text-xs' translate='no'>
                  {order.userId}
                </span>
              </InfoCell>
              <div className='sm:col-span-2'>
                <InfoCell icon={MapPinIcon} label='Địa chỉ giao hàng'>
                  {addrLines.length === 0 ? (
                    <span className='text-muted-foreground'>—</span>
                  ) : (
                    <div className='space-y-0.5'>
                      {addrLines.map((line, i) => (
                        <p key={i} className={cn(i === 0 && 'font-medium')}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </InfoCell>
              </div>
              {order.customerNote ? (
                <div className='sm:col-span-2'>
                  <InfoCell icon={StickyNoteIcon} label='Lời nhắn của khách'>
                    <p className='italic text-muted-foreground'>{'“'}{order.customerNote}{'”'}</p>
                  </InfoCell>
                </div>
              ) : null}
            </div>
          </section>

          {/* Vận chuyển (inline edit) */}
          <section className='dashboard-slide-up dashboard-stagger-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
            <SectionHeading icon={TruckIcon} title='Vận chuyển' />
            <div className='mt-3 space-y-1'>
              <EditableField
                label='Mã vận đơn'
                type='text'
                value={order.trackingNumber ?? ''}
                onSave={(v) => patch({ trackingNumber: v || undefined })}
                placeholder='VD: GHN12345678'
                emptyHint='Chưa có — bấm để nhập'
              />
              <EditableField
                label='Đơn vị vận chuyển'
                type='text'
                value={order.shippingProvider ?? ''}
                onSave={(v) => patch({ shippingProvider: v || undefined })}
                placeholder='VD: Giao Hàng Nhanh'
                emptyHint='Chưa có — bấm để nhập'
              />
            </div>
            <FieldHint>
              Bấm vào từng ô để nhập/sửa thông tin vận chuyển. Nhập mã vận đơn để khách có thể tra cứu đơn hàng.
            </FieldHint>
          </section>

          {/* Thanh toán (inline edit) */}
          <section className='dashboard-slide-up dashboard-stagger-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
            <SectionHeading icon={BanknoteIcon} title='Thanh toán' />
            <div className='mt-3 space-y-1'>
              <div className='group/editable relative -mx-2 rounded-md px-2 py-1.5'>
                <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>Phương thức</p>
                <p className='mt-0.5 text-sm'>
                  {order.paymentMethod === 'COD' ? 'COD (thu tại nơi nhận)' : 'Chuyển khoản ngân hàng'}
                </p>
              </div>
              <EditableField
                label='Trạng thái thanh toán'
                type='select'
                value={order.paymentStatus}
                options={ALL_PAYMENT_STATUSES}
                onSave={(v) => patch({ paymentStatus: v as OrderRow['paymentStatus'] })}
                successToast='Đã cập nhật trạng thái thanh toán'
              />
              <div className='group/editable relative -mx-2 rounded-md px-2 py-1.5'>
                <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>Đã thanh toán lúc</p>
                <p className='mt-0.5 text-sm tabular-nums'>{formatDateTime(order.paidAt)}</p>
              </div>
            </div>
            <FieldHint>
              Bấm vào "Trạng thái thanh toán" để chuyển giữa: Chờ thanh toán &gt; Đã thanh toán &gt; Thất bại &gt; Đã hoàn tiền.
            </FieldHint>
          </section>

          {/* Ghi chú nội bộ (inline edit) */}
          <section className='dashboard-slide-up dashboard-stagger-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
            <SectionHeading icon={StickyNoteIcon} title='Ghi chú nội bộ' />
            <div className='mt-3'>
              <EditableField
                type='textarea'
                rows={4}
                value={order.adminNote ?? ''}
                onSave={(v) => patch({ adminNote: v || undefined })}
                placeholder='Nhập ghi chú cho nhân viên xử lý đơn...'
                emptyHint='Bấm để thêm ghi chú — chỉ nhân viên mới xem được'
              />
            </div>
            <FieldHint>
              Ghi chú nội bộ chỉ nhân viên quản trị mới thấy được. Khách hàng không nhìn thấy ghi chú này.
            </FieldHint>
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className='lg:sticky lg:top-4 lg:self-start space-y-4'>
          {/* Thao tác nhanh */}
          <section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
            <SectionHeading icon={RocketIcon} title='Thao tác nhanh' />
            <div className='mt-3 space-y-3'>
              <div className='flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2 text-sm'>
                <span className='text-muted-foreground'>Trạng thái</span>
                <Badge variant={STATUS_STYLE[order.status]}>
                  {ORDER_STATUS_LABEL[order.status]}
                </Badge>
              </div>
              <div className='flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2 text-sm'>
                <span className='text-muted-foreground'>Thanh toán</span>
                <Badge variant='outline'>
                  {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                </Badge>
              </div>

              <div className='space-y-2 pt-1'>
                {/* Banking confirm button — only when BANKING + AWAITING_CONFIRMATION */}
                {order.paymentMethod === 'BANKING' && order.paymentStatus === 'AWAITING_CONFIRMATION' ? (
                  <Button
                    type='button'
                    className='w-full justify-start gap-1.5 bg-emerald-600 hover:bg-emerald-700'
                    onClick={() => {
                      void patch({ paymentStatus: 'PAID' });
                      toast.success('Đã xác nhận nhận tiền chuyển khoản');
                    }}
                  >
                    <BanknoteIcon className='size-4' />
                    Xác nhận đã nhận tiền
                  </Button>
                ) : null}

                {!terminal && primaryNext ? (
                  <Button
                    type='button'
                    className='w-full justify-start gap-1.5'
                    onClick={handlePrimaryClick}
                  >
                    {primaryNext === 'CONFIRMED' ? <BadgeCheckIcon className='size-4' /> :
                     primaryNext === 'PROCESSING' ? <PackageIcon className='size-4' /> :
                     primaryNext === 'SHIPPED' ? <TruckIcon className='size-4' /> :
                     primaryNext === 'DELIVERED' ? <BadgeCheckIcon className='size-4' /> :
                     <BanknoteIcon className='size-4' />}
                    {primaryLabel}
                  </Button>
                ) : null}

                {canTransitionTo(order.status, 'CANCELLED') ? (
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full justify-start gap-1.5 text-destructive hover:text-destructive'
                    onClick={() => setCancelOpen(true)}
                  >
                    <ArchiveIcon className='size-4' />
                    Hủy đơn
                  </Button>
                ) : null}

                {canTransitionTo(order.status, 'REFUNDED') ? (
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full justify-start gap-1.5'
                    onClick={() => setRefundOpen(true)}
                  >
                    <BanknoteIcon className='size-4' />
                    Hoàn tiền
                  </Button>
                ) : null}

                {terminal ? (
                  <div className='flex items-start gap-2 rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground'>
                    <AlertTriangleIcon className='mt-0.5 size-3.5 shrink-0' aria-hidden />
                    <p>
                      {'Đơn đã kết thúc (' + ORDER_STATUS_LABEL[order.status] + '). Không thể thao tác thêm.'}
                    </p>
                  </div>
                ) : null}
              </div>

              <FieldHint>
                Bấm nút trên để chuyển sang bước tiếp theo. Mỗi lần bấm là tự động lưu.
              </FieldHint>
            </div>
          </section>

          {/* Tiến trình */}
          <section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
            <SectionHeading
              icon={CalendarClockIcon}
              title='Tiến trình'
              hint='Các bước đã đi qua của đơn hàng.'
            />
            <div className='mt-3'>
              <OrderTimeline status={order.status} history={order.statusHistory} />
            </div>
          </section>

          {/* Số liệu */}
          <section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
            <SectionHeading icon={BoxIcon} title='Số liệu' />
            <dl className='mt-2 space-y-2 text-sm'>
              <div className='flex items-center justify-between'>
                <dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
                  <PackageIcon className='size-3.5' aria-hidden />
                  Số sản phẩm
                </dt>
                <dd className='font-semibold tabular-nums'>{order.items.length}</dd>
              </div>
              <div className='flex items-center justify-between'>
                <dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
                  <BadgeCheckIcon className='size-3.5' aria-hidden />
                  Mã giảm giá
                </dt>
                <dd className='font-semibold tabular-nums'>{order.discountCode || '—'}</dd>
              </div>
              <div className='flex items-center justify-between'>
                <dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
                  <CalendarClockIcon className='size-3.5' aria-hidden />
                  Ngày tạo
                </dt>
                <dd className='font-semibold tabular-nums'>{formatDateTime(order.createdAt)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      {/* Nhập thông tin vận chuyển — đánh dấu đã giao vận */}
      <AlertDialog open={shippingOpen} onOpenChange={setShippingOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đánh dấu đã giao vận</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className='space-y-3'>
                <p>
                  {'Đơn '}<strong className='text-foreground'>{order.orderNumber}</strong>{' sẽ chuyển sang trạng thái "đã giao vận".'}
                </p>
                <div className='space-y-2'>
                  <label className='text-xs font-medium text-foreground'>
                    Mã vận đơn <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    value={shipTracking}
                    onChange={(e) => setShipTracking(e.target.value)}
                    placeholder='VD: GHN12345678'
                    disabled={shipBusy}
                    autoComplete='off'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-xs font-medium text-foreground'>
                    Đơn vị vận chuyển
                  </label>
                  <Input
                    value={shipProvider}
                    onChange={(e) => setShipProvider(e.target.value)}
                    placeholder='VD: Giao Hàng Nhanh'
                    disabled={shipBusy}
                    autoComplete='off'
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={shipBusy}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleShippedConfirm()}
              disabled={shipBusy}
            >
              {shipBusy ? 'Đang xử lý...' : 'Xác nhận giao vận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm hủy đơn */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy đơn hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              {'Đơn '}<strong className='text-foreground'>{order.orderNumber}</strong>{' sẽ chuyển sang trạng thái "đã hủy".'}
              {cancelBusy ? null : (
                <span className='block mt-2'>
                  {'Hành động này không thể hoàn tác. Mã giảm giá (nếu có) sẽ được trả lại lượt sử dụng.'}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelBusy}>Không, giữ lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleCancel()}
              disabled={cancelBusy}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {cancelBusy ? 'Đang xử lý...' : 'Xác nhận hủy'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm hoàn tiền */}
      <AlertDialog open={refundOpen} onOpenChange={setRefundOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hoàn tiền</AlertDialogTitle>
            <AlertDialogDescription>
              <div className='space-y-3'>
                <p>
                  {'Đơn '}<strong className='text-foreground'>{order.orderNumber}</strong>{' sẽ chuyển sang trạng thái "đã hoàn tiền".'}
                </p>
                {order.paymentMethod === 'COD' ? (
                  <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 space-y-1.5'>
                    <p className='flex items-start gap-2'>
                      <BadgeCheckIcon className='mt-0.5 size-3.5 shrink-0 text-amber-500' aria-hidden />
                      <span><strong>COD:</strong> Khách chưa thanh toán. Bạn <strong>không cần chuyển tiền</strong>. Đơn vị vận chuyển đã thu hộ và sẽ trả lại cho bạn.</span>
                    </p>
                    <p className='flex items-start gap-2'>
                      <InfoIcon className='mt-0.5 size-3.5 shrink-0 text-amber-500' aria-hidden />
                      <span>Bước này chỉ cập nhật trạng thái trên hệ thống, không ảnh hưởng đến tiền bạc.</span>
                    </p>
                  </div>
                ) : (
                  <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 space-y-1.5'>
                    <p className='flex items-start gap-2'>
                      <BanknoteIcon className='mt-0.5 size-3.5 shrink-0 text-amber-500' aria-hidden />
                      <span><strong>BANKING:</strong> Khách đã thanh toán <strong>{formatCurrency(order.totalVnd)}</strong>. Bạn phải <strong>chuyển khoản lại</strong> cho khách trước khi xác nhận.</span>
                    </p>
                    <p className='flex items-start gap-2'>
                      <AlertTriangleIcon className='mt-0.5 size-3.5 shrink-0 text-amber-500' aria-hidden />
                      <span>Chỉ bấm xác nhận khi <strong>đã chuyển tiền xong</strong>. Hành động này không thể hoàn tác.</span>
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={refundBusy}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleRefund()}
              disabled={refundBusy}
            >
              {refundBusy ? 'Đang xử lý...' : 'Xác nhận hoàn tiền'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
