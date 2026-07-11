'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  PackageCheck,
  Sparkles,
} from 'lucide-react';
import { FaStar } from 'react-icons/fa';
import { Button, Badge, StarRating, Skeleton, ReviewSection } from '@/components';
import ProductCard from '@/components/product/ProductCard';
import VariantSheet from '@/components/ui/VariantSheet';
import { useFlyingCart } from '@/components/product/FlyingCartProvider';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';
import { type Product } from '@/types';
import { products, getProductBySlug, getRelatedProducts } from '@/lib/products';

/* ---------- helpers ---------- */

function formatPrice(price: number) {
  return `${price.toLocaleString('vi-VN')}₫`;
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
  const [quantity, setQuantity] = useState(1);
  const [variantSheetOpen, setVariantSheetOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { flyFromRect } = useFlyingCart();

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
      <div className="mx-auto max-w-360 px-3 md:px-4 py-20 text-center">
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

  const selectedVariant = product.variants[0];
  const displayPrice = selectedVariant?.price ?? product.price;
  const image = product.images[selectedImage] ?? product.images[0];
  const stock = selectedVariant?.stock ?? 0;
  const isAvailable = stock > 0;
  const discount = product.compareAtPrice
    ? Math.round((1 - displayPrice / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = (options: { size?: string; color?: string; quantity: number }) => {
    const payload = {
      productId: product.id,
      name: product.name,
      price: displayPrice,
      image,
      quantity: options.quantity,
      size: options.size,
      color: options.color,
    };
    addItem(payload);

    // Flying image from sheet position
    const sheetContent = document.querySelector('[data-variant-sheet]');
    if (sheetContent) {
      const img = sheetContent.querySelector('img');
      if (img) flyFromRect(img.getBoundingClientRect(), product.images[0]);
    }

    toast.success('Đã thêm vào giỏ hàng!');
  };

  const handleBuyNow = (options: { size?: string; color?: string; quantity: number }) => {
    const payload = {
      productId: product.id,
      name: product.name,
      price: displayPrice,
      image,
      quantity: options.quantity,
      size: options.size,
      color: options.color,
    };
    addItem(payload);

    const sheetContent = document.querySelector('[data-variant-sheet]');
    if (sheetContent) {
      const img = sheetContent.querySelector('img');
      if (img) flyFromRect(img.getBoundingClientRect(), product.images[0]);
    }

    setVariantSheetOpen(false);
    setTimeout(() => {
      window.location.href = '/thanh-toan';
    }, 500);
  };

  const openVariantSheet = () => {
    if (!isAvailable) return;
    setVariantSheetOpen(true);
  };

  return (
    <div className="pb-20 pt-5 md:pb-9 md:pt-3.5">
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
          quantity={quantity}
          onAdd={openVariantSheet}
          onBuy={openVariantSheet}
          reduceMotion={Boolean(reduceMotion)}
        />
      </section>

      <ProductStory product={product} stock={stock} />

      <ReviewSection
        productId={product.id}
        rating={product.rating}
        reviewCount={product.reviewCount}
      />

      {related.length > 0 && (
        <section className="mt-14 md:mt-18">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-text md:text-3xl">
              Có thể bạn cũng thích
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text2">
              Danh sách kéo dài để bạn tiếp tục khám phá sản phẩm phù hợp.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, round) =>
              products
                .filter((p) => p.id !== product?.id)
                .map((p) => ({ ...p, feedKey: `${p.id}-rel-${round}` })),
            )
              .flat()
              .map((item, i) => (
                <ProductCard key={item.feedKey} product={item} index={i % products.length} />
              ))}
          </div>
        </section>
      )}

      <MobileStickyCTA isAvailable={isAvailable} onAdd={openVariantSheet} onBuy={openVariantSheet} />

      <VariantSheet
        open={variantSheetOpen}
        onClose={() => setVariantSheetOpen(false)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        product={product}
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
  const images = product.images;
  const total = images.length;
  const curr = Math.max(0, Math.min(selectedImage, total - 1));
  const imageUrl = images[curr] ?? images[0];
  const prevRef = useRef(curr);
  const dir = curr > prevRef.current ? 1 : curr < prevRef.current ? -1 : 0;
  prevRef.current = curr;

  const paginate = (delta: number) => {
    const next = (curr + delta + total) % total;
    setSelectedImage(next);
  };

  const swipeConfidenceThreshold = 40;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 300 : -300, opacity: 0 }),
  };

  return (
    <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface2">
        <AnimatePresence custom={dir} mode="popLayout">
          <motion.div
            key={imageUrl}
            custom={dir}
            variants={reduceMotion ? undefined : variants}
            initial={reduceMotion ? false : 'enter'}
            animate="center"
            exit="exit"
            transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            drag={total > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -swipeConfidenceThreshold) paginate(1);
              else if (swipe > swipeConfidenceThreshold) paginate(-1);
            }}
            className="no-css-transition relative aspect-4/5 sm:aspect-square cursor-grab active:cursor-grabbing"
          >
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover pointer-events-none"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 56vw, 760px"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {discount > 0 && (
          <div className="pointer-events-none absolute left-3 top-3 md:left-4 md:top-4">
            <span className="inline-flex rounded-full bg-red px-3 py-1 text-xs font-bold text-white shadow-sm">
              -{discount}%
            </span>
          </div>
        )}

        {/* Image counter — mobile only */}
        <div className="absolute bottom-3 right-3 md:hidden">
          <span className="inline-flex h-6 min-w-[44px] items-center justify-center rounded-full bg-black/40 px-2.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
            {curr + 1}/{total}
          </span>
        </div>
      </div>

      {/* Desktop thumbnails */}
      {total > 1 && (
        <div
          className="hidden md:flex gap-2 overflow-x-auto pb-1 scrollbar-none"
          role="list"
          aria-label="Ảnh sản phẩm"
        >
          {images.map((thumbnail, index) => {
            const selected = index === curr;
            return (
              <button
                key={thumbnail}
                type="button"
                onClick={() => setSelectedImage(index)}
                aria-label={`Xem ảnh ${index + 1}`}
                aria-pressed={selected}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] border transition-all md:h-18 md:w-18 ${
                  selected
                    ? 'border-star/60 ring-1 ring-star/20'
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
  quantity: number;
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
  quantity,
  onAdd,
  onBuy,
  reduceMotion,
}: PurchasePanelProps) {
  return (
    <motion.aside
      {...(reduceMotion ? { initial: false } : panelMotion)}
      className="lg:sticky lg:top-24 lg:self-start"
    >
      <div className="rounded-3xl border border-border/50 bg-surface p-5 shadow-[0_24px_70px_rgba(0,0,0,0.07)] md:p-6 lg:p-7">
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
        <h1 className="text-2xl font-bold tracking-tight text-text md:text-[28px] md:leading-tight">
          {product.name}
        </h1>

        {/* Rating */}
        <div className="mt-3">
          <StarRating
            rating={product.rating}
            size="md"
            showValue
            reviewCount={product.reviewCount}
          />
        </div>

        {/* Price */}
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <span className="text-2xl font-bold tracking-tight text-accent md:text-[26px]">
            {formatPrice(displayPrice)}
          </span>
          {product.compareAtPrice && (
            <span className="pb-1 text-base text-text2 line-through md:text-lg">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
          {discount > 0 && <Badge variant="error">Tiết kiệm {discount}%</Badge>}
        </div>

        {/* Short description */}
        <p className="mt-4 text-sm leading-6 text-text2 md:text-[15px]">{product.description}</p>

        <div className="mt-6 space-y-5">
          {/* CTAs — mở variant sheet để chọn size/màu/số lượng */}
          <div className="hidden gap-3 md:flex">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 whitespace-nowrap"
              icon={<ShoppingBag className="h-5 w-5" />}
              onClick={onAdd}
              disabled={!isAvailable}
            >
              Thêm vào giỏ
            </Button>
            <Button
              size="lg"
              className="flex-1 whitespace-nowrap bg-text text-bg shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)] dark:bg-text dark:text-bg dark:shadow-[0_4px_16px_rgba(230,237,243,0.12)] dark:hover:shadow-[0_10px_28px_rgba(230,237,243,0.18)]"
              onClick={onBuy}
              disabled={!isAvailable}
            >
              Mua ngay
            </Button>
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border/50 text-text2 transition-colors hover:bg-surface2 hover:text-text active:translate-y-px"
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
  return (
    <section className="mt-12 md:mt-16 max-w-3xl">
      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-8 bg-accent/50" />
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-text2">
            Chi tiết sản phẩm
          </span>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-text leading-tight">
          {product.name}
        </h2>

        <div className="mt-6 space-y-4 text-base leading-7 text-text2">
          <p className="text-[15px] leading-[1.7]">{product.description}</p>
          <p className="text-[15px] leading-[1.7]">
            <strong className="font-semibold text-text">Chất liệu:</strong> Sợi cotton tự nhiên 100%
            được chọn lọc từ những cánh đồng bông chất lượng cao. Vải dệt kim mịn, dày dặn nhưng vẫn
            đảm bảo độ thoáng khí tối ưu cho làn da.
          </p>
          <p className="text-[15px] leading-[1.7]">
            <strong className="font-semibold text-text">Thiết kế:</strong> Form regular fit ôm vừa
            phải, không quá chật cũng không quá rộng. Cổ tròn bo gân chắc chắn, giữ form sau nhiều
            lần giặt. Đường may chỉ kép tại các vị trí chịu lực (vai, nách, sườn) đảm bảo độ bền
            vượt trội.
          </p>
          <p className="text-[15px] leading-[1.7]">
            <strong className="font-semibold text-text">Hướng dẫn bảo quản:</strong> Giặt ở nhiệt độ
            dưới 30°C, không dùng chất tẩy mạnh, phơi trong bóng râm để giữ màu sắc bền lâu. Không
            là ủi trực tiếp lên vùng in/họa tiết (nếu có).
          </p>
          <p className="text-[15px] leading-[1.7]">
            <strong className="font-semibold text-text">Ưu điểm nổi bật:</strong> Công nghệ dệt
            Pre-Shrunk giúp hạn chế co rút sau giặt. Sợi vải được xử lý kháng khuẩn, khử mùi, an
            toàn cho da nhạy cảm. Chứng nhận OEKO-TEX Standard 100.
          </p>
        </div>

        {/* Quick info tags */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {stock > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green/20 bg-green/5 px-3 py-1.5 text-xs font-medium text-green">
              <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
              Còn {stock} sản phẩm
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red/20 bg-red/5 px-3 py-1.5 text-xs font-medium text-red">
              <span className="h-1.5 w-1.5 rounded-full bg-red" />
              Hết hàng
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-surface px-3 py-1.5 text-xs font-medium text-text2">
            <FaStar className="text-[12px] text-star/40" /> {product.rating.toFixed(1)} ({product.reviewCount} đánh giá)
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-surface px-3 py-1.5 text-xs font-medium text-text2">
            🧩 {product.variants.length} lựa chọn
          </span>
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/50 bg-surface px-3.5 py-1.5 text-xs font-medium text-text2 capitalize hover:bg-surface2 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Mobile unchanged */}
      <div className="lg:hidden grid gap-8">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold tracking-tight text-text md:text-3xl">
            Thông tin sản phẩm
          </h2>
          <p className="mt-3 text-sm leading-7 text-text2 md:text-base">{product.description}</p>
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
          <article className="rounded-2xl border border-border/50 bg-surface p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-text/5 text-text">
              <PackageCheck className="h-4 w-4" />
            </div>
            <div className="text-xs font-semibold text-text2">Tồn kho</div>
            <div className="mt-1 text-lg font-bold text-text">
              {stock > 0 ? `${stock} sản phẩm` : 'Hết hàng'}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-text2">
              Cập nhật theo lựa chọn hiện tại.
            </p>
          </article>
          <article className="rounded-2xl border border-border/50 bg-surface p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-text/5 text-text">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-xs font-semibold text-text2">Đánh giá</div>
            <div className="mt-1 text-lg font-bold text-text">{product.rating.toFixed(1)}/5</div>
            <p className="mt-1 text-sm leading-relaxed text-text2">
              {product.reviewCount} lượt đánh giá từ khách hàng.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ---------- skeleton ---------- */

function ProductDetailSkeleton() {
  return (
    <div className="pt-5 pb-20 md:pb-12 md:pt-8">
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:gap-8 xl:gap-10">
        <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <Skeleton variant="rectangular" className="aspect-4/5 sm:aspect-square rounded-3xl" />
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                className="h-14 w-14 shrink-0 rounded-[10px]"
              />
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-surface p-5 md:p-6 lg:p-7">
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
  isAvailable: boolean;
  onAdd: () => void;
  onBuy: () => void;
}

function MobileStickyCTA({ isAvailable, onAdd, onBuy }: MobileStickyCTAProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg/95 px-3 py-3 shadow-[0_-18px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2">
        <Button
          variant="secondary"
          size="md"
          className="h-12 flex-1 whitespace-nowrap px-3 text-sm rounded-full border-border"
          icon={<ShoppingBag className="h-4 w-4" />}
          onClick={onAdd}
          disabled={!isAvailable}
        >
          Thêm vào giỏ
        </Button>
        <Button
          size="md"
          className="h-12 flex-1 whitespace-nowrap px-3 text-sm bg-text text-bg rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
          onClick={onBuy}
          disabled={!isAvailable}
        >
          Mua ngay
        </Button>
      </div>
    </div>
  );
}
