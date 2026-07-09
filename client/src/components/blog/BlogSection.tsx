'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import BlogCard from './BlogCard';
import type { BlogPost } from '@/types';

interface BlogSectionProps {
  posts: BlogPost[];
  loading?: boolean;
}

export default function BlogSection({ posts, loading }: BlogSectionProps) {
  if (loading) return <BlogSectionSkeleton />;
  if (!posts.length) return null;

  return (
    <section className="py-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">Bài viết & Hướng dẫn</h2>
            <p className="text-xs text-text2 mt-0.5">Mẹo hay, kiến thức & cảm hứng mua sắm</p>
          </div>
        </div>
        <Link
          href="/blog"
          className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors shrink-0"
        >
          Xem tất cả <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post, i) => (
          <BlogCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </section>
  );
}

export function BlogSectionSkeleton() {
  return (
    <section className="py-12">
      <div className="h-7 w-48 skeleton rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card !p-2 rounded-xl">
            <div className="aspect-[16/9] skeleton rounded-lg mb-3" />
            <div className="flex flex-col gap-2 p-2">
              <div className="h-3 w-20 skeleton rounded" />
              <div className="h-4 w-full skeleton rounded" />
              <div className="h-3 w-3/4 skeleton rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
