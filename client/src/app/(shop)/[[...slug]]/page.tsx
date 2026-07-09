'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import BlogSection from '@/components/blog/BlogSection';
import AdBanner from '@/components/ads/AdBanner';
import { Select } from '@/components';
import { ProductCardSkeleton, ProductGridSkeleton } from '@/components/ui/Skeleton';
import { type Product, type BlogPost } from '@/types';
import { getProducts, getFeaturedProducts, getNewArrivals } from '@/lib/products';
import { getRecentBlogPosts } from '@/lib/blog';
import { ads } from '@/lib/ads';
import { categories } from '@/lib/categories';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=640&fit=crop',
  },
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=640&fit=crop',
  },
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=640&fit=crop',
  },
];

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: Thấp → Cao' },
  { value: 'price_desc', label: 'Giá: Cao → Thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
];

function HomeContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug?.[0] || null;
  const selectedCategory = categories.find((c) => c.slug === slug)?.slug || null;
  const sortParam = searchParams.get('sort');

  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogLoading, setBlogLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [slideIdx, setSlideIdx] = useState(0);

  // Product listing state
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [sort, setSort] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(6);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const isCategoryView = !!(selectedCategory || sortParam);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((p) => (p + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = useCallback(() => setSlideIdx((p) => (p + 1) % slides.length), []);
  const prevSlide = useCallback(() => setSlideIdx((p) => (p + slides.length - 1) % slides.length), []);

  // Load static sections
  useEffect(() => {
    async function load() {
      const [f, n] = await Promise.all([getFeaturedProducts(), getNewArrivals()]);
      setFeatured(f);
      setNewArrivals(n);
      setLoading(false);
    }
    load();

    async function loadBlog() {
      const posts = await getRecentBlogPosts(3);
      setBlogPosts(posts);
      setBlogLoading(false);
    }
    loadBlog();
  }, []);

  // Load category/sort products
  useEffect(() => {
    if (!selectedCategory && !sortParam) return;
    let active = true;

    const catId = selectedCategory
      ? categories.find((c) => c.slug === selectedCategory)?.id
      : undefined;

    async function load() {
      setCatLoading(true);
      const data = await getProducts({
        categoryId: catId,
        sort: sortParam || sort,
      });
      if (!active) return;
      setCategoryProducts(data);
      setSort(sortParam || 'newest');
      setVisibleCount(6);
      setCatLoading(false);
    }

    load();
    return () => { active = false; };
  }, [selectedCategory, sortParam, sort]);

  useEffect(() => {
    if (!isCategoryView) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + 6, categoryProducts.length));
        }
      },
      { rootMargin: '420px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isCategoryView, categoryProducts.length]);

  const visibleProducts = categoryProducts.slice(0, visibleCount);
  const hasMore = visibleCount < categoryProducts.length;
  const categoryName = selectedCategory
    ? categories.find((c) => c.slug === selectedCategory)?.name || 'Danh mục'
    : '';

  // Scroll to top when category changes
  useEffect(() => {
    if (selectedCategory) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);

  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="mt-4 group relative overflow-hidden rounded-xl bg-bg" style={{ height: 'clamp(180px, 25vh, 250px)' }}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={slideIdx}
            className="absolute inset-0"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, mass: 0.8 }}
          >
            <Image
              src={slides[slideIdx].image}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100" aria-label="Previous">
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100" aria-label="Next">
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === slideIdx ? 'bg-accent w-6' : 'bg-accent/35 hover:bg-accent/65'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES — always visible ─── */}
      <section className="py-5">
        <div className="grid grid-flow-col grid-rows-2 gap-x-4 gap-y-3 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hover md:flex md:gap-4 md:overflow-x-auto md:overflow-y-hidden md:flex-nowrap md:pb-0 md:scrollbar-hover">
          {categories.map((cat, i) => {
            const isActive = cat.slug === selectedCategory;
            return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Link
                href={`/${cat.slug}`}
                className="flex flex-col items-center gap-2 group w-[76px]"
              >
                <div className={`w-[60px] h-[60px] rounded-full overflow-hidden border bg-surface shadow-sm group-hover:border-border group-hover:shadow-md transition-all ${isActive ? 'border-accent/50' : 'border-border'}`}>
                  <Image
                    src={cat.image!}
                    alt={cat.name}
                    width={60}
                    height={60}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className={`min-h-[2rem] text-xs font-medium text-center leading-tight line-clamp-2 transition-colors ${isActive ? 'text-text' : 'text-text2 group-hover:text-text'}`}>
                  {cat.name}
                </span>
              </Link>
            </motion.div>
            );
          })}
        </div>
      </section>

      {isCategoryView ? (
        /* ─── CATEGORY PRODUCT LISTING ─── */
        <section className="py-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-semibold tracking-tight text-text">{categoryName}</h1>
                {!catLoading && (
                  <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs font-medium text-text2">
                    {categoryProducts.length} sản phẩm
                  </span>
                )}
              </div>
              {catLoading && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-text2 border-t-transparent" />
                  Đang tải danh mục...
                </p>
              )}
            </div>
            <Select
              value={sort}
              options={sortOptions}
              onChange={(e) => {
                setSort(e.target.value);
                setCatLoading(true);
                const catId = selectedCategory
                  ? categories.find((c) => c.slug === selectedCategory)?.id
                  : undefined;
                getProducts({ categoryId: catId, sort: e.target.value })
                  .then((data) => { setCategoryProducts(data); setVisibleCount(6); setCatLoading(false); });
              }}
            />
          </div>

          {catLoading ? (
            <ProductGridSkeleton />
          ) : categoryProducts.length === 0 ? (
            <div className="flex min-h-[420px] items-center justify-center py-12 text-center">
              <div className="max-w-sm">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface2 text-text2">
                  <PackageSearch className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-lg font-semibold tracking-tight text-text">Danh mục đang được cập nhật</h3>
                <p className="text-sm leading-6 text-text2">
                  Chưa có sản phẩm trong danh mục này. Nội dung mới sẽ được bổ sung sớm.
                </p>
                <Link
                  href="/"
                  className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-medium text-bg transition-opacity hover:opacity-85"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Quay lại trang chủ
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
              <div ref={loadMoreRef} className="flex h-16 items-center justify-center text-sm text-text2">
                {hasMore ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-text2 border-t-transparent rounded-full animate-spin" />
                    Đang tải thêm...
                  </span>
                ) : null}
              </div>
            </>
          )}
        </section>
      ) : (
        /* ─── HOME SECTIONS ─── */
        <>
          {/* FEATURED */}
          <section className="py-5">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-text">Sản phẩm bán chạy</h2>
              <Link href="/?sort=rating" className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
                Xem tất cả <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : featured.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
            </div>
          </section>

          {/* NEW ARRIVALS */}
          <section className="py-5">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-text">Hàng mới về</h2>
              <Link href="/?sort=newest" className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
                Xem tất cả <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : newArrivals.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
            </div>
          </section>

          {/* AD BANNER 1 */}
          <section className="py-5">
            <AdBanner ad={ads[0]} index={0} />
          </section>

          {/* BLOG SECTION */}
          <BlogSection posts={blogPosts} loading={blogLoading} />

          {/* AD BANNER 2 */}
          <section className="pt-5 pb-4">
            <AdBanner ad={ads[1]} index={1} />
          </section>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="mt-4">
        <div className="skeleton h-[180px] rounded-xl mb-6" />
        <ProductGridSkeleton />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
