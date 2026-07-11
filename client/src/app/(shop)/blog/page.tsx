'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';
import { getBlogPosts } from '@/lib/blog';
import type { BlogPost } from '@/types';

export default function BlogPage() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	useEffect(() => {
		getBlogPosts().then(data => {
			setPosts(data);
			setLoading(false);
		});
	}, []);

	const categories = [...new Set(posts.map(p => p.category))];

	const filtered = posts.filter(p => {
		const matchSearch =
			!search ||
			p.title.toLowerCase().includes(search.toLowerCase()) ||
			p.excerpt.toLowerCase().includes(search.toLowerCase());
		const matchCategory = !selectedCategory || p.category === selectedCategory;
		return matchSearch && matchCategory;
	});

	return (
		<div className='py-6'>
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className='mb-8'
			>
				<div className='flex items-center gap-3 mb-2'>
					<div className='flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent'>
						<BookOpen className='h-5 w-5' />
					</div>
					<div>
						<h1 className='text-2xl font-bold text-text'>Bài viết & Hướng dẫn</h1>
						<p className='text-sm text-text2 mt-0.5'>Kiến thức, mẹo hay & cảm hứng mua sắm</p>
					</div>
				</div>

				<div className='mt-6 flex flex-col sm:flex-row gap-3'>
					<div className='relative flex-1 max-w-sm'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text2' />
						<input
							type='text'
							placeholder='Tìm bài viết...'
							value={search}
							onChange={e => setSearch(e.target.value)}
							className='w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text2 outline-none focus:border-accent/50 transition-colors'
						/>
					</div>
					<div className='flex gap-2 flex-wrap'>
						<button
							onClick={() => setSelectedCategory(null)}
							className={`h-9 px-3 rounded-full text-xs font-medium transition-all ${
								!selectedCategory ? 'bg-accent text-bg' : 'bg-surface2 text-text2 hover:text-text'
							}`}
						>
							Tất cả
						</button>
						{categories.map(cat => (
							<button
								key={cat}
								onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
								className={`h-9 px-3 rounded-full text-xs font-medium transition-all ${
									selectedCategory === cat
										? 'bg-accent text-bg'
										: 'bg-surface2 text-text2 hover:text-text'
								}`}
							>
								{cat}
							</button>
						))}
					</div>
				</div>
			</motion.div>

			{loading ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className='card !p-2 rounded-xl'>
							<div className='aspect-[16/9] skeleton rounded-lg mb-3' />
							<div className='flex flex-col gap-2 p-2'>
								<div className='h-3 w-20 skeleton rounded' />
								<div className='h-4 w-full skeleton rounded' />
								<div className='h-3 w-3/4 skeleton rounded' />
							</div>
						</div>
					))}
				</div>
			) : filtered.length === 0 ? (
				<div className='flex min-h-[300px] items-center justify-center text-center'>
					<div className='max-w-sm'>
						<div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface2 text-text2'>
							<BookOpen className='h-7 w-7' />
						</div>
						<h3 className='text-lg font-semibold text-text mb-1'>Không tìm thấy bài viết</h3>
						<p className='text-sm text-text2'>
							{search ? 'Thử từ khoá khác hoặc bỏ lọc danh mục' : 'Đang cập nhật nội dung mới'}
						</p>
					</div>
				</div>
			) : (
				<>
					<p className='text-sm text-text2 mb-4'>{filtered.length} bài viết</p>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
						{filtered.map((post, i) => (
							<BlogCard key={post.id} post={post} index={i} />
						))}
					</div>
				</>
			)}
		</div>
	);
}
