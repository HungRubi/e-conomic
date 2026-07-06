'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  PackageCheck,
  Sparkles,
  Layers3,
} from 'lucide-react';
import { Button, Badge, StarRating, QuantitySelector, Skeleton } from '@/components';
import ProductCard from '@/components/product/ProductCard';
import { useCartStore } from '@/stores/cart-store';
import { useToast } from '@/components/ui/Toast';
import { type Product, type ProductVariant } from '@/types';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';

/* ---------- helpers ---------- */

function formatPrice(price: number) {
  return `${price.toLocaleString('vi-VN')}₫`;
}

function productOptions(product: Product) {
  const sizes = Array.from(
    new Set(product.variants.map((variant) => variant.size).filter((size): size is string => Boolean(size))),
  );
  const colors = Array.from(
    new Set(product.variants.map((variant) => variant.color).filter((color): color is string => Boolean(color))),
  );
  return { sizes, colors };
}

function findSelectedVariant(
  product: Product,
  sizes: string[],
  colors: string[],
  selectedSize: string | null,
  selectedColor: string | null,
): ProductVariant | undefined {
  return product.variants.find((variant) => {
    const sizeMatch = sizes.length === 0 || variant.size === selectedSize;
    const colorMatch = colors.length === 0 || variant.color === selectedColor;
    return sizeMatch && colorMatch;
  }) ?? product.variants[0];
}

/* ---------- page component ---------- */

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const nextProduct = await getProductBySlug(slug);
        if (cancelled) return;

        setProduct(nextProduct ?? null);
        setSelectedImage(0);
        setQuantity(1);

        if (nextProduct) {
          const { sizes, colors } = productOptions(nextProduct);
          setSelectedSize(sizes[0] ?? null);
          setSelectedColor(colors[0] ?? null);

          const relatedProducts = await getRelatedProducts(nextProduct.id);
          if (!cancelled) setRelated(relatedProducts);
        } else {
          setRelated([]);
        }
      } catch {
        if (!cancelled) {
          setProduct(null);
          setRelated([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div className="mx-auto max-w-[90rem] px-4 py-20 text-center">
        <div className="mx-auto max-w-md rounded-radius border border-border/50 bg-surface p-8">
          <h1 className="text-2xl font-bold text-text">Không tìm thấy sản phẩm</h1>
          <p className="mt-3 text-sm leading-relaxed text-text2">
            Sản phẩm này không tồn tại hoặc đã bị xoá.
          </p>
          <Link href="/" className="mt-6 inline-flex">
            <Button variant="outline" icon={<ChevronLeft className="h-4 w-4" />}>
              Quay lại cửa hàng
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { sizes, colors } = productOptions(product);
  const selectedVariant = findSelectedVariant(product, sizes, colors, selectedSize, selectedColor);
  const displayPrice = selectedVariant?.price ?? product.price;
  const image = product.images[selectedImage] ?? product.images[0];
  const stock = selectedVariant?.stock ?? 0;
  const maxQuantity = Math.max(1, stock);
  const safeQuantity = Math.min(quantity, maxQuantity);
  const isAvailable = stock > 0;
  const discount = product.compareAtPrice
    ? Math.round((1 - displayPrice / product.compareAtPrice) * 100)
    : 0;

  const cartPayload = {
    productId: product.id,
    name: product.name,
    price: displayPrice,
    image,
    quantity: safeQuantity,
    size: selectedSize || undefined,
    color: selectedColor || undefined,
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem(cartPayload);
    showToast('success', 'Đã thêm vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;
    addItem(cartPayload);
    showToast('success', 'Đã thêm vào giỏ hàng!');
    router.push('/cart');
  };

  return (
    <div className="mx-auto max-w-[90rem] px-4 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-4 md:pb-20 md:pt-6">
      <ProductBreadcrumb name={product.name} />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:gap-8 xl:gap-10">
        <ProductGallery
          product={product}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          discount={discount}
          reduceMotion={Boolean(reduceMotion)}
        />

        <ProductPurchasePanel
          product={product}
          displayPrice={displayPrice}
          discount={discount}
          isAvailable={isAvailable}
          stock={stock}
          sizes={sizes}
          colors={colors}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          onSizeChange={setSelectedSize}
          onColorChange={setSelectedColor}
          quantity={safeQuantity}
          maxQuantity={maxQuantity}
          onQuantityChange={setQuantity}
          onAdd={handleAddToCart}
          onBuy={handleBuyNow}
          reduceMotion={Boolean(reduceMotion)}
        />
      </section>

      <ProductStory product={product} stock={stock} />

      {related.length > 0 && (
        <section className="mt-14 md:mt-18">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-text md:text-3xl">
              Có thể bạn cũng thích
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text2">
              Những sản phẩm cùng nhóm, dễ so sánh trước khi quyết định.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {related.map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} />
            ))}
          </div>
        </section>
      )}

      <MobileStickyCTA
        name={product.name}
        price={displayPrice}
        isAvailable={isAvailable}
        onAdd={handleAddToCart}
        onBuy={handleBuyNow}
      />
    </div>
  );
}

/* ---------- breadcrumb ---------- */

function ProductBreadcrumb({ name }: { name: string }) {
  return (
    <nav className="mb-5 flex items-center gap-2 overflow-hidden text-sm text-text2 md:mb-6">
      <Link href="/" className="shrink-0 transition-colors hover:text-text">
        Trang chủ
      </Link>
      <span aria-hidden="true">/</span>
      <Link href="/" className="shrink-0 transition-colors hover:text-text">
        Sản phẩm
      </Link>
      <span aria-hidden="true">/</span>
      <span className="truncate text-text">{name}</span>
    </nav>
  );
}

/* ---------- gallery ---------- */

interface ProductGalleryProps {
  product: Product;
  selectedImage: number;
  setSelectedImage: (index: number) => void;
  discount: number;
  reduceMotion: boolean;
}

function ProductGallery({
  product,
  selectedImage,
  setSelectedImage,
  discount,
  reduceMotion,
}: ProductGalleryProps) {
  const image = product.images[selectedImage] ?? product.images[0];

  return (
    <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
      <div className="relative overflow-hidden rounded-[24px] border border-border/50 bg-surface2">
        <motion.div
          key={image}
          initial={reduceMotion ? false : { opacity: 0.75, scale: 1.015 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="no-css-transition relative aspect-[4/5] sm:aspect-square"
        >
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 56vw, 760px"
            priority
          />
        </motion.div>

        {/* Only sale badge over image — tags moved to header area */}
        {discount > 0 && (
          <div className="pointer-events-none absolute left-3 top-3 md:left-4 md:top-4">
            <span className="inline-flex rounded-full bg-red px-3 py-1 text-xs font-bold text-white shadow-sm">
              -{discount}%
            </span>
          </div>
        )}
      </div>

      {product.images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="list" aria-label="Ảnh sản phẩm">
          {product.images.map((thumbnail, index) => {
            const selected = index === selectedImage;
            return (
              <button
                key={thumbnail}
                type="button"
                onClick={() => setSelectedImage(index)}
                aria-label={`Xem ảnh ${index + 1}`}
                aria-pressed={selected}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] border transition-all md:h-18 md:w-18 ${
                  selected
                    ? 'border-text/80 ring-1 ring-text/15'
                    : 'border-border/50 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={thumbnail}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- purchase panel ---------- */

interface PurchasePanelProps {
  product: Product;
  displayPrice: number;
  discount: number;
  isAvailable: boolean;
  stock: number;
  sizes: string[];
  colors: string[];
  selectedSize: string | null;
  selectedColor: string | null;
  onSizeChange: (v: string) => void;
  onColorChange: (v: string) => void;
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (v: number) => void;
  onAdd: () => void;
  onBuy: () => void;
  reduceMotion: boolean;
}

const panelMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
};

function ProductPurchasePanel({
  product,
  displayPrice,
  discount,
  isAvailable,
  stock,
  sizes,
  colors,
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange,
  quantity,
  maxQuantity,
  onQuantityChange,
  onAdd,
  onBuy,
  reduceMotion,
}: PurchasePanelProps) {
  return (
    <motion.aside
      {...(reduceMotion ? { initial: false } : panelMotion)}
      className="lg:sticky lg:top-24 lg:self-start"
    >
      <div className="rounded-[24px] border border-border/50 bg-surface p-5 shadow-[0_24px_70px_rgba(0,0,0,0.07)] md:p-6 lg:p-7">
        {/* Tags + status */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {product.tags.includes('bán chạy') && <Badge variant="success">Bán chạy</Badge>}
          {product.tags.includes('mới') && <Badge variant="info">Mới</Badge>}
          {product.tags.includes('hot') && <Badge variant="warning">Hot</Badge>}
          <Badge variant={isAvailable ? 'success' : 'error'}>
            {isAvailable ? 'Còn hàng' : 'Hết hàng'}
          </Badge>
        </div>

        {/* Name */}
        <h1 className="text-[28px] font-bold tracking-tight text-text md:text-[34px] md:leading-tight">
          {product.name}
        </h1>

        {/* Rating */}
        <div className="mt-3">
          <StarRating rating={product.rating} size="md" showValue reviewCount={product.reviewCount} />
        </div>

        {/* Price */}
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <span className="text-3xl font-bold tracking-tight text-accent md:text-[34px]">
            {formatPrice(displayPrice)}
          </span>
          {product.compareAtPrice && (
            <span className="pb-1 text-base text-text2 line-through md:text-lg">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
          {discount > 0 && (
            <Badge variant="error">Tiết kiệm {discount}%</Badge>
          )}
        </div>

        {/* Short description */}
        <p className="mt-4 text-sm leading-6 text-text2 md:text-[15px]">
          {product.description}
        </p>

        <div className="mt-6 space-y-5">
          {/* Variants */}
          <VariantSelector
            label="Kích thước"
            value={selectedSize}
            options={sizes}
            onSelect={onSizeChange}
          />
          <VariantSelector
            label="Màu sắc"
            value={selectedColor}
            options={colors}
            onSelect={onColorChange}
          />

          {/* Quantity */}
          <div className="flex items-center justify-between gap-4 rounded-[12px] border border-border/50 bg-bg/50 p-3">
            <div>
              <div className="text-sm font-semibold text-text">Số lượng</div>
              <div className="text-xs text-text2">
                {isAvailable ? `Còn ${stock} sản phẩm` : 'Tạm hết hàng'}
              </div>
            </div>
            <QuantitySelector
              value={quantity}
              onChange={onQuantityChange}
              max={maxQuantity}
            />
          </div>

          {/* CTAs */}
          <div className="hidden gap-3 md:flex">
            <Button
              size="lg"
              className="flex-1 whitespace-nowrap bg-text text-bg shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)] dark:bg-text dark:text-bg dark:shadow-[0_4px_16px_rgba(230,237,243,0.12)] dark:hover:shadow-[0_10px_28px_rgba(230,237,243,0.18)]"
              icon={<ShoppingBag className="h-5 w-5" />}
              onClick={onAdd}
              disabled={!isAvailable}
            >
              Thêm vào giỏ
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 whitespace-nowrap"
              onClick={onBuy}
              disabled={!isAvailable}
            >
              Mua ngay
            </Button>
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-border/50 text-text2 transition-colors hover:bg-surface2 hover:text-text active:translate-y-px"
              aria-label="Yêu thích"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* Trust rail */}
          <TrustRail />
        </div>
      </div>
    </motion.aside>
  );
}

/* ---------- variant selector ---------- */

interface VariantSelectorProps {
  label: string;
  value: string | null;
  options: string[];
  onSelect: (value: string) => void;
}

function VariantSelector({ label, value, options, onSelect }: VariantSelectorProps) {
  if (options.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text">{label}</h2>
        {value && <span className="text-xs font-medium text-text2">{value}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              aria-pressed={selected}
              className={`min-h-10 rounded-[10px] border px-4 text-sm font-semibold transition-all active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text/20 ${
                selected
                  ? 'border-text/80 bg-text/10 text-text'
                  : 'border-border bg-surface text-text2 hover:bg-surface2 hover:text-text'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- trust rail ---------- */

function TrustRail() {
  const items = [
    { icon: Truck, title: 'Giao hàng nhanh', text: 'Miễn phí cho đơn trên 500.000₫' },
    { icon: RotateCcw, title: 'Đổi trả 30 ngày', text: 'Hoàn tiền 100%, đơn giản' },
    { icon: ShieldCheck, title: 'Thanh toán an toàn', text: 'Bảo mật thông tin tuyệt đối' },
    { icon: PackageCheck, title: 'Kiểm tra hàng', text: 'Nhận hàng mới thanh toán' },
  ];

  return (
    <div className="grid gap-2 border-t border-border/30 pt-5">
      {items.map((item) => (
        <div key={item.title} className="flex gap-3 rounded-[10px] p-2 text-sm text-text2">
          <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-text" />
          <div>
            <div className="font-semibold text-text">{item.title}</div>
            <div className="leading-relaxed">{item.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- product story / specs ---------- */

interface ProductStoryProps {
  product: Product;
  stock: number;
}

function ProductStory({ product, stock }: ProductStoryProps) {
  const specs = [
    {
      icon: PackageCheck,
      label: 'Tồn kho',
      value: stock > 0 ? `${stock} sản phẩm` : 'Hết hàng',
      text: 'Cập nhật theo lựa chọn hiện tại.',
    },
    {
      icon: Layers3,
      label: 'Biến thể',
      value: `${product.variants.length} lựa chọn`,
      text: 'Chọn đúng size hoặc màu trước khi mua.',
    },
    {
      icon: Sparkles,
      label: 'Đánh giá',
      value: `${product.rating.toFixed(1)}/5`,
      text: `${product.reviewCount} lượt đánh giá từ khách hàng.`,
    },
  ];

  return (
    <section className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
      <div className="max-w-xl">
        <h2 className="text-2xl font-bold tracking-tight text-text md:text-3xl">
          Thông tin sản phẩm
        </h2>
        <p className="mt-3 text-sm leading-7 text-text2 md:text-base">
          {product.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/50 bg-surface px-3 py-1 text-xs font-medium text-text2"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
        {specs.map((spec) => (
          <article key={spec.label} className="rounded-[16px] border border-border/50 bg-surface p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[8px] bg-text/5 text-text">
              <spec.icon className="h-4 w-4" />
            </div>
            <div className="text-xs font-semibold text-text2">{spec.label}</div>
            <div className="mt-1 text-lg font-bold text-text">{spec.value}</div>
            <p className="mt-1 text-sm leading-relaxed text-text2">{spec.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- skeleton ---------- */

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[90rem] px-4 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-5 md:pb-16 md:pt-8">
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:gap-8 xl:gap-10">
        <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <Skeleton variant="rectangular" className="aspect-[4/5] sm:aspect-square rounded-[24px]" />
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" className="h-14 w-14 shrink-0 rounded-[10px]" />
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-border/50 bg-surface p-5 md:p-6 lg:p-7">
          <div className="space-y-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-9 w-11/12" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- mobile sticky CTA ---------- */

interface MobileStickyCTAProps {
  name: string;
  price: number;
  isAvailable: boolean;
  onAdd: () => void;
  onBuy: () => void;
}

function MobileStickyCTA({ name, price, isAvailable, onAdd, onBuy }: MobileStickyCTAProps) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-50 border-t border-border bg-bg/95 px-3 py-3 shadow-[0_-18px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-text2">{name}</div>
          <div className="whitespace-nowrap text-sm font-bold text-accent">{formatPrice(price)}</div>
        </div>
        <Button
          size="md"
          className="h-11 flex-1 whitespace-nowrap px-3 text-sm bg-text text-bg"
          icon={<ShoppingBag className="h-4 w-4" />}
          onClick={onAdd}
          disabled={!isAvailable}
        >
          Thêm vào giỏ
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="h-11 flex-1 whitespace-nowrap px-3 text-sm"
          onClick={onBuy}
          disabled={!isAvailable}
        >
          Mua ngay
        </Button>
      </div>
    </div>
  );
}
