'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarIcon, UserIcon, Tag } from 'lucide-react';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog';
import BlogCard from '@/components/blog/BlogCard';
import type { BlogPost } from '@/types';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
      <div className="py-6 max-w-3xl mx-auto">
        <div className="skeleton h-6 w-32 rounded mb-6" />
        <div className="skeleton h-[300px] rounded-xl mb-6" />
        <div className="skeleton h-8 w-3/4 rounded mb-3" />
        <div className="skeleton h-4 w-full rounded mb-2" />
        <div className="skeleton h-4 w-full rounded mb-2" />
        <div className="skeleton h-4 w-2/3 rounded" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-center py-12">
        <div className="max-w-sm">
          <h2 className="text-xl font-bold text-text mb-2">Không tìm thấy bài viết</h2>
          <p className="text-sm text-text2 mb-5">Bài viết không tồn tại hoặc đã bị xoá.</p>
          <Link
            href="/blog"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-medium text-bg transition-opacity hover:opacity-85"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại blog
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(post.createdAt).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-text2 hover:text-text transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại blog
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-surface2 mb-8">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text2 mb-4">
            <span className="rounded-full bg-surface2 px-2.5 py-1 font-medium text-text">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              {date}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-text leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-base leading-relaxed text-text2 mb-8">{post.excerpt}</p>

          <div className="prose prose-sm max-w-none text-text2">
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <p className="text-text2 italic">
                Nội dung chi tiết đang được cập nhật...
              </p>
            </div>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-border">
              <Tag className="h-4 w-4 text-text2" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface2 px-2.5 py-1 text-xs font-medium text-text2"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {related.length > 0 && (
        <section className="mt-16 pt-8 border-t border-border">
          <h2 className="text-xl font-bold text-text mb-6">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((p, i) => (
              <BlogCard key={p.id} post={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
