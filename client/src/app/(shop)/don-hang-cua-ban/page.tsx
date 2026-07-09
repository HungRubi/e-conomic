import Image from 'next/image';
import {
  CheckCircle2,
  Clock3,
  Copy,
  Headphones,
  Package,
  RotateCcw,
  Truck,
} from 'lucide-react';

const sampleOrders = [
  {
    id: 'EC-2407-1024',
    date: '07/07/2026',
    status: 'Đang giao',
    statusTone: 'text-orange bg-orange/10 border-orange/20',
    icon: Truck,
    eta: 'Dự kiến giao: 09/07/2026',
    total: 1290000,
    items: [
      {
        name: 'Áo khoác minimal linen',
        brand: 'ECO Atelier',
        variant: 'Be / Size M',
        sku: 'LIN-JKT-BE-M',
        qty: 1,
        unitPrice: 790000,
        lineTotal: 790000,
        fulfillment: 'Đã bàn giao cho đơn vị vận chuyển',
        slug: '/san-pham/ao-khoac-minimal-linen',
        supportLabel: 'Đổi size trong 7 ngày',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&h=160&fit=crop',
      },
      {
        name: 'Túi tote canvas daily',
        brand: 'Daily Carry',
        variant: 'Natural',
        sku: 'TOT-CVS-NA',
        qty: 2,
        unitPrice: 250000,
        lineTotal: 500000,
        fulfillment: 'Đóng gói cùng kiện hàng chính',
        slug: '/san-pham/tui-tote-canvas-daily',
        supportLabel: 'Bảo hành đường may',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&h=160&fit=crop',
      },
    ],
  },
  {
    id: 'EC-2407-0981',
    date: '04/07/2026',
    status: 'Đã giao',
    statusTone: 'text-green bg-green/10 border-green/20',
    icon: CheckCircle2,
    eta: 'Đã giao thành công lúc 14:32',
    total: 860000,
    items: [
      {
        name: 'Sneaker cloud white',
        brand: 'Urban Sole',
        variant: 'Trắng / Size 42',
        sku: 'SNK-CLD-WH-42',
        qty: 1,
        unitPrice: 860000,
        lineTotal: 860000,
        fulfillment: 'Đã giao đủ sản phẩm',
        slug: '/san-pham/sneaker-cloud-white',
        supportLabel: 'Đánh giá sau mua',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=160&h=160&fit=crop',
      },
    ],
  },
  {
    id: 'EC-2407-0944',
    date: '02/07/2026',
    status: 'Đang xử lý',
    statusTone: 'text-text bg-surface2 border-border',
    icon: Clock3,
    eta: 'Shop đang chuẩn bị hàng',
    total: 540000,
    items: [
      {
        name: 'Mũ bucket cotton',
        brand: 'Soft Basics',
        variant: 'Đen',
        sku: 'HAT-BKT-BK',
        qty: 1,
        unitPrice: 540000,
        lineTotal: 540000,
        fulfillment: 'Shop đang kiểm hàng trước khi gửi',
        slug: '/san-pham/mu-bucket-cotton',
        supportLabel: 'Nhắn shop về chất liệu',
        image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=160&h=160&fit=crop',
      },
    ],
  },
];

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}₫`;
const VISIBLE_MOBILE_ITEMS = 2;

export default function OrdersPage() {
  return (
    <section className="pt-3 pb-8 md:pt-4 md:pb-16">
      <div className="w-full">
        <div>
          <div className="mb-6 md:mb-8">
            <p className="text-sm text-text2">Theo dõi trạng thái mua hàng</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-text sm:text-4xl">
              Đơn hàng của bạn
            </h1>
          </div>

          <div className="space-y-3">
            {sampleOrders.map((order) => {
              const StatusIcon = order.icon;
              const extraItemCount = Math.max(order.items.length - VISIBLE_MOBILE_ITEMS, 0);

              return (
                <article
                  key={order.id}
                  className="rounded-xl border border-border/80 bg-surface/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-5"
                >
                  <div className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-medium tracking-[-0.025em] text-text">
                          {order.id}
                        </h2>
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface2/70 px-2.5 py-1 text-xs font-medium text-text2">
                          <Copy className="h-3 w-3" strokeWidth={1.8} />
                          Sao chép mã
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-text2">Đặt ngày {order.date}</p>
                    </div>
                    <div className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${order.statusTone}`}>
                      <StatusIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
                      {order.status}
                    </div>
                  </div>

                  <div className="mt-4 divide-y divide-border/70">
                      {order.items.map((item, itemIndex) => (
                        <div
                          key={`${order.id}-${item.sku}`}
                          className={`${itemIndex >= VISIBLE_MOBILE_ITEMS ? 'hidden md:block' : ''} group/order-item py-3 transition-colors duration-300 hover:bg-surface/70`}
                        >
                        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 md:grid-cols-[7rem_minmax(0,1fr)] md:items-center md:gap-4">
                          <div className="relative aspect-square w-22 overflow-hidden rounded-lg bg-surface2 md:w-28">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/order-item:scale-105"
                              sizes="(max-width: 768px) 88px, 112px"
                            />
                            <span className="absolute right-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-text shadow-sm backdrop-blur-md">
                              x{item.qty}
                            </span>
                          </div>

                          <div className="min-w-0 py-0.5">
                            <div className="flex min-w-0 items-center gap-2 text-xs text-text2">
                              <span className="truncate font-medium">{item.brand}</span>
                              <span aria-hidden="true">•</span>
                              <span className="truncate font-mono tabular-nums">SKU {item.sku}</span>
                            </div>
                            <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-pretty text-text transition-colors group-hover/order-item:text-accent md:text-base">
                              {item.name}
                            </h3>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-border/70 bg-surface2/70 px-2.5 py-1 text-xs font-medium text-text">
                                {item.variant}
                              </span>
                              <span className="rounded-full border border-border/70 bg-surface2/70 px-2.5 py-1 text-xs font-medium text-text2">
                                {item.supportLabel}
                              </span>
                            </div>
                            <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-text2">
                              <Package className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                              <span className="line-clamp-2">{item.fulfillment}</span>
                            </p>
                          </div>

                        </div>
                      </div>
                    ))}

                    {extraItemCount > 0 && (
                      <button
                        type="button"
                        className="flex h-10 w-full touch-manipulation items-center justify-center rounded-xl border border-border bg-surface2/60 text-sm font-semibold text-text transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-text/20 md:hidden"
                      >
                        Xem thêm {extraItemCount} sản phẩm
                      </button>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-text2">
                      <Package className="h-4 w-4" strokeWidth={1.8} />
                      {order.eta}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <span className="text-sm text-text2">Tổng</span>
                        <span className="font-mono text-base font-medium tabular-nums text-text">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex h-8 touch-manipulation items-center gap-1.5 rounded-full bg-text px-3 text-xs font-semibold text-bg transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-text/20"
                        >
                          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                          Mua lại
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 touch-manipulation items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-semibold text-text2 transition-colors hover:border-text hover:text-text focus-visible:ring-2 focus-visible:ring-text/20"
                        >
                          <Headphones className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                          Hỗ trợ
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
