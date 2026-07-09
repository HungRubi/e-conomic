'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarIcon, ArrowRight } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import type { BlogPost } from '@/types';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  const date = new Date(post.createdAt).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div className="card h-full overflow-hidden !p-2 rounded-xl border-border/80 bg-surface/90 shadow-[0_18px_60px_rgba(0,0,0,0.06)] hover:border-border hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)] transition-all duration-300">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-surface2">
            <ImageWithFallback
              src={post.image}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col gap-2 p-3">
            <div className="flex items-center gap-2 text-[11px] text-text2">
              <span className="rounded-full bg-surface2 px-2 py-0.5 font-medium">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {date}
              </span>
            </div>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text transition-colors group-hover:text-accent">
              {post.title}
            </h3>
            <p className="line-clamp-2 text-xs leading-relaxed text-text2">
              {post.excerpt}
            </p>
            <div className="mt-auto flex items-center gap-1 pt-1 text-xs font-medium text-accent">
              Đọc tiếp <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
