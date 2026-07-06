'use client';

import { useEffect, useMemo, useState, type InputHTMLAttributes } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';
import { CartSkeleton, QuantitySelector } from '@/components';
import ProductCard from '@/components/product/ProductCard';
import { useCartStore } from '@/stores/cart-store';
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { products } from '@/lib/products';

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}₫`;

const suggestedProducts = Array.from({ length: 4 }, (_, round) =>
  products.map((product) => ({ ...product, feedKey: `${product.id}-${round}` })),
).flat();

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label
      className={`relative flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-200 ${
        checked
          ? 'border-text bg-text'
          : 'border-border/60 bg-transparent hover:border-text/60'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={label}
      />
      <motion.span
        initial={false}
        animate={checked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="pointer-events-none"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-bg"
          />
        </svg>
      </motion.span>
    </label>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems } =
    useCartStore();
  const [mounted, setMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const frame = window.requestAnimationFrame(() => {
      setSelectedIds((current) => {
        const validIds = new Set(items.map((item) => item.id));
        const kept = current.filter((id) => validIds.has(id));
        if (kept.length > 0 || items.length === 0) return kept;
        return items.map((item) => item.id);
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [items, mounted]);

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [],
  );

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedItems = items.filter((item) => selectedIdSet.has(item.id));
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const selectedQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedSubtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping =
    selectedSubtotal >= FREE_SHIPPING_THRESHOLD || selectedSubtotal === 0
      ? 0
      : SHIPPING_FEE;
  const total = selectedSubtotal + shipping;
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - selectedSubtotal,
  );
  const shippingProgress = Math.min(
    100,
    Math.round((selectedSubtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );
  const checkoutHref =
    selectedIds.length > 0
      ? `/checkout?items=${encodeURIComponent(selectedIds.join(','))}`
      : '/checkout';

  const toggleItem = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : items.map((item) => item.id));
  };

  const removeSelected = () => {
    selectedIds.forEach((id) => removeItem(id));
    setSelectedIds([]);
  };

  if (!mounted) {
    return (
      <section className="py-8 md:py-12">
        <div className="mb-6">
          <p className="text-sm text-text2">Đang tải giỏ hàng</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-text sm:text-4xl">
            Giỏ hàng
          </h1>
        </div>
        <CartSkeleton />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-lg rounded-xl border border-border/80 bg-surface/90 p-6 text-center shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface2 text-text">
            <ShoppingBag className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-[-0.035em] text-text sm:text-3xl">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-text2">
            Khám phá sản phẩm và thêm món bạn thích vào giỏ.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-radius-btn bg-text px-5 text-sm font-semibold text-bg shadow-[0_12px_32px_var(--accent-glow)] transition-all hover:opacity-90 active:translate-y-px"
          >
            Mua sắm ngay
            <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>

        <SuggestedProducts />
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12">
      <div className="mb-6 md:mb-8">
        <p className="text-sm text-text2">
          {totalItems()} sản phẩm trong giỏ
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-text sm:text-4xl">
          Giỏ hàng
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface/90 px-3 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:px-4">
            <label className="flex min-w-0 cursor-pointer items-center gap-3 text-sm font-medium text-text">
              <Checkbox checked={allSelected} onChange={toggleAll} label="Chọn tất cả sản phẩm" />
              <span>Chọn tất cả</span>
              <span className="hidden text-text2 sm:inline">
                ({selectedItems.length}/{items.length})
              </span>
            </label>
            <button
              type="button"
              onClick={removeSelected}
              disabled={selectedIds.length === 0}
              className="inline-flex h-9 items-center gap-2 rounded-radius-btn px-3 text-sm font-medium text-text2 transition-all hover:bg-surface2 hover:text-red disabled:pointer-events-none disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
              Xóa đã chọn
            </button>
          </div>

          {selectedSubtotal < FREE_SHIPPING_THRESHOLD && (
            <div className="rounded-xl border border-border/80 bg-surface/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface2 text-text">
                  <Truck className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text">
                    Mua thêm {formatCurrency(remainingForFreeShipping)} để được miễn phí vận chuyển
                  </p>
                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-surface2"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={FREE_SHIPPING_THRESHOLD}
                    aria-valuenow={selectedSubtotal}
                    aria-label="Tiến độ miễn phí vận chuyển"
                  >
                    <div
                      className="h-full rounded-full bg-text transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const product = productById.get(item.productId);
              const slug = product?.slug ?? item.productId;
              const selected = selectedIdSet.has(item.id);
              const variantText = [item.size && `Size ${item.size}`, item.color]
                .filter(Boolean)
                .join(' / ');

              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-border/80 bg-surface/90 shadow-[0_18px_60px_rgba(0,0,0,0.06)]"
                >
                  <div className="grid grid-cols-[32px_92px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[32px_112px_minmax(0,1fr)] sm:gap-4 sm:p-4">
                    <div className="flex items-start pt-7 sm:pt-9">
                      <Checkbox
                        checked={selected}
                        onChange={() => toggleItem(item.id)}
                        label={`Chọn ${item.name}`}
                      />
                    </div>

                    <Link
                      href={`/san-pham/${slug}`}
                      className="relative aspect-square overflow-hidden rounded-lg bg-surface2"
                      aria-label={`Xem ${item.name}`}
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="product-card-image object-cover"
                        sizes="(min-width: 1024px) 112px, 92px"
                      />
                    </Link>

                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/san-pham/${slug}`}
                          className="line-clamp-2 text-sm font-semibold leading-5 text-text transition-colors hover:text-text2"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text2 transition-all hover:bg-surface2 hover:text-red active:translate-y-px"
                          aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </button>
                      </div>

                      {variantText && (
                        <button
                          type="button"
                          className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-full border border-border/80 bg-surface2/70 px-2.5 py-1 text-[11px] font-medium text-text2 transition-all hover:bg-surface2"
                        >
                          <span className="truncate">{variantText}</span>
                          <ChevronDown className="h-3 w-3 shrink-0" strokeWidth={1.8} />
                        </button>
                      )}

                      <div className="mt-2.5 flex flex-wrap items-end justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-text">
                            {formatCurrency(item.price)}
                          </div>
                          {product?.compareAtPrice && product.compareAtPrice > item.price && (
                            <div className="text-[11px] text-text2 line-through">
                              {formatCurrency(product.compareAtPrice)}
                            </div>
                          )}
                        </div>

                        <QuantitySelector
                          value={item.quantity}
                          onChange={(qty) => updateQuantity(item.id, qty)}
                          size="sm"
                        />
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-text2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface2/50 px-2 py-0.5">
                          <Truck className="h-3 w-3" strokeWidth={1.8} />
                          Giao 2-4 ngày
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface2/50 px-2 py-0.5">
                          <Tag className="h-3 w-3" strokeWidth={1.8} />
                          Voucher
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          <OrderSummary
            selectedQuantity={selectedQuantity}
            selectedSubtotal={selectedSubtotal}
            shipping={shipping}
            total={total}
            checkoutHref={checkoutHref}
            disabled={selectedIds.length === 0}
          />
        </aside>
      </div>

      <MobileCheckoutBar
        selectedQuantity={selectedQuantity}
        total={total}
        checkoutHref={checkoutHref}
        disabled={selectedIds.length === 0}
      />

      <SuggestedProducts />
    </section>
  );
}

function OrderSummary({
  selectedQuantity,
  selectedSubtotal,
  shipping,
  total,
  checkoutHref,
  disabled,
}: {
  selectedQuantity: number;
  selectedSubtotal: number;
  shipping: number;
  total: number;
  checkoutHref: string;
  disabled: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-surface/90 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
      <h2 className="text-lg font-semibold tracking-[-0.025em] text-text">
        Tóm tắt đơn hàng
      </h2>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4 text-text2">
          <span>Đã chọn</span>
          <span className="text-text">{selectedQuantity} sản phẩm</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-text2">
          <span>Tạm tính</span>
          <span className="font-mono tabular-nums text-text">
            {formatCurrency(selectedSubtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-text2">
          <span>Phí vận chuyển</span>
          <span className="font-mono tabular-nums text-text">
            {shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}
          </span>
        </div>
        <div className="border-t border-border pt-3">
          <div className="flex items-end justify-between gap-4">
            <span className="font-semibold text-text">Tổng</span>
            <span className="font-mono text-xl font-semibold tracking-[-0.03em] tabular-nums text-text">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {disabled ? (
        <button
          type="button"
          disabled
          className="mt-5 flex h-12 w-full items-center justify-center rounded-[10px] bg-surface2 px-5 text-sm font-semibold text-text2"
        >
          Chọn sản phẩm
        </button>
      ) : (
        <Link
          href={checkoutHref}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-text px-5 text-sm font-semibold text-bg shadow-[0_12px_32px_var(--accent-glow)] transition-all hover:opacity-90 active:translate-y-px"
        >
          Thanh toán
          <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
        </Link>
      )}

      <div className="mt-5 grid gap-2 border-t border-border pt-4 text-xs leading-5 text-text2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-green" strokeWidth={1.8} />
          Thanh toán an toàn
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-text2" strokeWidth={1.8} />
          Đổi trả theo chính sách cửa hàng
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-text2" strokeWidth={1.8} />
          Không lưu thông tin thẻ trên thiết bị
        </div>
      </div>
    </div>
  );
}

function MobileCheckoutBar({
  selectedQuantity,
  total,
  checkoutHref,
  disabled,
}: {
  selectedQuantity: number;
  total: number;
  checkoutHref: string;
  disabled: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-14 z-30 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text2">Đã chọn {selectedQuantity} sản phẩm</p>
          <p className="font-mono text-lg font-semibold tracking-[-0.03em] tabular-nums text-text">
            {formatCurrency(total)}
          </p>
        </div>
        {disabled ? (
          <button
            type="button"
            disabled
            className="h-11 rounded-[10px] bg-surface2 px-5 text-sm font-semibold text-text2"
          >
            Chọn sản phẩm
          </button>
        ) : (
          <Link
            href={checkoutHref}
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-text px-5 text-sm font-semibold text-bg shadow-[0_12px_32px_var(--accent-glow)]"
          >
            Thanh toán
          </Link>
        )}
      </div>
    </div>
  );
}

function SuggestedProducts() {
  return (
    <section className="mt-10 border-t border-border pt-8 md:mt-14 md:pt-10">
      <div className="mb-5 md:mb-7">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-text md:text-3xl">
          Gợi ý thêm cho bạn
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-text2">
          Danh sách kéo dài để bạn tiếp tục khám phá sản phẩm phù hợp.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {suggestedProducts.map((product, index) => (
          <ProductCard
            key={product.feedKey}
            product={product}
            index={index % products.length}
          />
        ))}
      </div>
    </section>
  );
}
