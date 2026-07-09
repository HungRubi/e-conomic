'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  UserIcon,
  Tag,
  Clock,
  Link2,
  Bookmark,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog';
import BlogCard from '@/components/blog/BlogCard';
import ImageWithFallback from '@/components/blog/ImageWithFallback';
import type { BlogPost } from '@/types';

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function calc() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
    }
    window.addEventListener('scroll', calc, { passive: true });
    return () => window.removeEventListener('scroll', calc);
  }, []);

  return (
    <div className="fixed top-16 left-0 right-0 z-50 h-0.5 bg-surface2">
      <div
        className="h-full bg-accent transition-all duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const shareLinks = [
    {
      label: 'Facebook',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: 'Twitter',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {shareLinks.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface2 text-text2 hover:text-text hover:bg-border transition-all"
          aria-label={`Chia sẻ lên ${s.label}`}
        >
          {s.svg}
        </a>
      ))}
      <button
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface2 text-text2 hover:text-text hover:bg-border transition-all"
        aria-label="Sao chép liên kết"
      >
        {copied ? (
          <span className="text-[10px] font-bold text-green">OK</span>
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function generateTOC(content: string): { id: string; title: string }[] {
  const lines = content.split('\n').filter((l) => l.startsWith('## '));
  return lines.map((l) => ({
    id: l.replace('## ', '').toLowerCase().replace(/\s+/g, '-'),
    title: l.replace('## ', ''),
  }));
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;

    getBlogPostBySlug(slug).then((data) => {
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPost(data);
      setLoading(false);
    });

    getBlogPosts().then((all) => {
      setRelated(all.filter((p) => p.slug !== slug).slice(0, 3));
    });
  }, [slug]);

  if (loading) {
    return (
      <>
        <div className="fixed top-16 left-0 right-0 z-50 h-0.5 bg-surface2">
          <div className="h-full w-0 bg-accent" />
        </div>
        <div className="py-6 max-w-3xl mx-auto">
          <div className="skeleton h-5 w-28 rounded mb-6" />
          <div className="skeleton aspect-[16/9] rounded-xl mb-8" />
          <div className="flex gap-3 mb-4">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-32 rounded" />
            <div className="skeleton h-5 w-28 rounded" />
          </div>
          <div className="skeleton h-9 w-3/4 rounded mb-3" />
          <div className="skeleton h-10 w-full rounded mb-6" />
          <div className="skeleton h-4 w-full rounded mb-2" />
          <div className="skeleton h-4 w-full rounded mb-2" />
          <div className="skeleton h-4 w-11/12 rounded mb-2" />
          <div className="skeleton h-4 w-full rounded mb-2" />
          <div className="skeleton h-4 w-3/4 rounded" />
        </div>
      </>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex min-h-[500px] items-center justify-center text-center py-12">
        <div className="max-w-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface2">
            <Bookmark className="h-8 w-8 text-text2" />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Không tìm thấy bài viết</h2>
          <p className="text-sm text-text2 mb-6 leading-relaxed">
            Bài viết không tồn tại hoặc đã bị xoá. Quay lại blog để khám phá các bài viết khác.
          </p>
          <Link
            href="/blog"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-bg transition-opacity hover:opacity-85"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại blog
          </Link>
        </div>
      </div>
    );
  }

  const readingTime = estimateReadingTime(post.excerpt);
  const toc = generateTOC(post.content);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <ReadingProgress />

      <div className="py-6">
        {/* ── Back link ── */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-text2 hover:text-text transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Quay lại blog
        </Link>

        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-10">
          {/* ─── MAIN CONTENT ─── */}
          <article>
            {/* Hero image */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-surface2 mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <ImageWithFallback
                src={post.image}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text2 mb-4">
              <span className="rounded-full bg-accent/10 px-3 py-1 font-semibold text-accent">
                {post.category}
              </span>
              <span className="flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} phút đọc
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {(post.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 900) + 100} lượt xem
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text leading-tight mb-4 tracking-tight">
              {post.title}
            </h1>

            {/* Excerpt lead */}
            <p className="text-base md:text-lg leading-relaxed text-text2/80 mb-8 border-l-2 border-accent/30 pl-4 italic">
              {post.excerpt}
            </p>

            {/* Article body */}
            <div ref={contentRef} className="prose prose-sm md:prose-base max-w-none text-text2">
              <div className="rounded-2xl border border-border bg-surface p-8 md:p-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Bookmark className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-text2 leading-relaxed">
                    Nội dung chi tiết đang được cập nhật. Hãy quay lại sau để đọc bài viết đầy đủ nhé!
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {['hướng dẫn', post.category.toLowerCase(), 'mẹo hay'].map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-surface2 px-3 py-1 text-xs font-medium text-text2"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-border">
                <Tag className="h-4 w-4 text-text2 shrink-0" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${tag}`}
                    className="rounded-full bg-surface2 px-3 py-1 text-xs font-medium text-text2 hover:text-text hover:bg-border transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile share — visible below md */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border md:hidden">
              <span className="text-xs font-medium text-text2">Chia sẻ bài viết</span>
              <ShareButton url={url} title={post.title} />
            </div>

            {/* Author card */}
            <div className="mt-8 p-6 rounded-2xl border border-border bg-surface">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-lg font-bold">
                  {post.author.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text">{post.author}</p>
                  <p className="text-xs text-text2 mt-0.5">
                    Biên tập viên tại e-conomic — chia sẻ kiến thức và cảm hứng mua sắm thông minh.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* ─── SIDEBAR (desktop) ─── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Share */}
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs font-semibold text-text2 uppercase tracking-wider mb-3">
                  Chia sẻ
                </p>
                <ShareButton url={url} title={post.title} />
              </div>

              {/* Table of Contents (placeholder — expands when content is real) */}
              {toc.length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-xs font-semibold text-text2 uppercase tracking-wider mb-3">
                    Nội dung
                  </p>
                  <nav className="space-y-1">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="flex items-start gap-2 text-xs text-text2 hover:text-text transition-colors py-1"
                      >
                        <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{item.title}</span>
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Mini related */}
              {related.length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-xs font-semibold text-text2 uppercase tracking-wider mb-3">
                    Bài viết cùng chuyên mục
                  </p>
                  <div className="space-y-3">
                    {related.slice(0, 2).map((p) => (
                      <Link
                        key={p.id}
                        href={`/blog/${p.slug}`}
                        className="group block"
                      >
                        <h4 className="text-sm font-medium text-text group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                          {p.title}
                        </h4>
                        <p className="text-[11px] text-text2 mt-1">{p.category}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* ─── RELATED POSTS ─── */}
        {related.length > 0 && (
          <section className="mt-14 pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text">Bài viết liên quan</h2>
              <Link
                href="/blog"
                className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors"
              >
                Xem tất cả <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((p, i) => (
                <BlogCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
