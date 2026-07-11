'use client';

import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppTheme } from '@/providers/theme-provider';
import {
	Search,
	ShoppingBag,
	Menu,
	User,
	Sun,
	Moon,
	X,
	ChevronDown,
	Package,
	Heart,
	Settings,
	LogOut,
	BookOpen,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useCartStore } from '@/stores/cart-store';
import { useFlyingCart } from '@/components/product/FlyingCartProvider';
import Badge from '@/components/ui/Badge';

const user = {
	name: 'Nguyễn Văn A',
	email: 'nguyenvan.a@email.com',
};

const accountLinks = [
	{ href: '/don-hang-cua-ban', icon: Package, label: 'Đơn hàng của tôi' },
	{ href: '/wishlist', icon: Heart, label: 'Sản phẩm yêu thích' },
	{ href: '/blog', icon: BookOpen, label: 'Bài viết & Hướng dẫn' },
	{ href: '/settings', icon: Settings, label: 'Cài đặt tài khoản' },
];

export default function Header() {
	const { searchOpen, toggleSearch, toggleSidebar } = useUIStore();
	const totalItems = useCartStore(s => s.totalItems());
	const { theme, toggleTheme, mounted } = useAppTheme();
	const { bumpCart } = useFlyingCart();
	const [bumpKey, setBumpKey] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const [query, setQuery] = useState('');
	const [accountOpen, setAccountOpen] = useState(false);
	const accountRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (searchOpen) {
			inputRef.current?.focus();
		} else {
			setQuery('');
		}
	}, [searchOpen]);

	// Bump badge when flying item lands
	useEffect(() => {
		if (bumpCart > 0) setBumpKey(k => k + 1);
	}, [bumpCart]);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
				setAccountOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<>
			<header className='sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl'>
				<div className='max-w-[90rem] mx-auto px-3 md:px-4 h-16 flex items-center justify-between gap-4'>
					{/* Logo */}
					<Link
						href='/'
						className='text-xl font-bold tracking-tight text-text hover:text-accent transition-colors shrink-0'
					>
						e‑conomic
					</Link>

					{/* Spacer */}
					<div className='flex-1' />

					{/* Right: Icons */}
					<div className='flex items-center gap-1 shrink-0'>
						{/* ── Animated search ── */}
						<div className='relative flex items-center'>
							<AnimatePresence mode='wait'>
								{searchOpen ? (
									<motion.div
										key='expanded'
										initial={{ width: 0, opacity: 0 }}
										animate={{ width: 'auto', opacity: 1 }}
										exit={{ width: 0, opacity: 0 }}
										transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
										className='overflow-hidden'
									>
										<div className='flex h-9 items-center gap-0 rounded-full border border-border bg-surface2/80 has-[:focus]:border-text/40 has-[:focus]:bg-surface transition-all duration-300'>
											<div className='flex items-center pl-3 pr-1 text-text2/60 pointer-events-none shrink-0'>
												<Search className='w-4 h-4' />
											</div>
											<input
												ref={inputRef}
												type='text'
												value={query}
												onChange={e => setQuery(e.target.value)}
												placeholder='Tìm sản phẩm...'
												className='w-[140px] sm:w-[200px] bg-transparent py-2 pr-1 text-sm text-text outline-none placeholder:text-text2/50'
												onKeyDown={e => {
													if (e.key === 'Escape') toggleSearch();
												}}
											/>
											{query && (
												<button
													onClick={() => setQuery('')}
													className='mr-0.5 p-1 rounded-full text-text2/60 hover:text-text hover:bg-surface2 transition-colors shrink-0'
												>
													<X className='w-3.5 h-3.5' />
												</button>
											)}
											<button
												onClick={toggleSearch}
												className='mr-1 p-1 rounded-full text-text2/60 hover:text-text hover:bg-surface2 transition-colors shrink-0'
												aria-label='Close search'
											>
												<X className='w-4 h-4' />
											</button>
										</div>
									</motion.div>
								) : (
									<motion.button
										key='collapsed'
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.15 }}
										onClick={toggleSearch}
										className='p-2 rounded-full text-text2 hover:text-text hover:bg-surface2 transition-all'
										aria-label='Search'
									>
										<Search className='w-5 h-5' />
									</motion.button>
								)}
							</AnimatePresence>
						</div>
						{/* Theme toggle */}
						{mounted && (
							<button
								onClick={toggleTheme}
								className='p-2 rounded-full text-text2 hover:text-text hover:bg-surface2 transition-all'
								aria-label='Toggle theme'
							>
								<AnimatePresence mode='wait' initial={false}>
									{theme === 'dark' ? (
										<motion.span
											key='sun'
											initial={{ opacity: 0, rotate: -70 }}
											animate={{ opacity: 1, rotate: 0 }}
											exit={{ opacity: 0, rotate: 70 }}
											transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
										>
											<Sun className='w-5 h-5' />
										</motion.span>
									) : (
										<motion.span
											key='moon'
											initial={{ opacity: 0, rotate: 70 }}
											animate={{ opacity: 1, rotate: 0 }}
											exit={{ opacity: 0, rotate: -70 }}
											transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
										>
											<Moon className='w-5 h-5' />
										</motion.span>
									)}
								</AnimatePresence>
							</button>
						)}

						{/* ── Account dropdown ── */}
						<div ref={accountRef} className='relative hidden md:block'>
							<button
								onClick={() => setAccountOpen(!accountOpen)}
								className='flex items-center gap-1.5 p-1.5 pr-2 rounded-full text-text2 hover:text-text hover:bg-surface2 transition-all'
								aria-label='Account'
							>
								<span className='flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold'>
									{user.name.charAt(0)}
								</span>
								<ChevronDown
									className={`w-3.5 h-3.5 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}
								/>
							</button>

							<AnimatePresence>
								{accountOpen && (
									<motion.div
										initial={{ opacity: 0, y: 6, scale: 0.96 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 6, scale: 0.96 }}
										transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
										className='absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-surface shadow-[0_18px_60px_rgba(0,0,0,0.12)] overflow-hidden'
									>
										{/* User info */}
										<div className='px-4 py-3 border-b border-border'>
											<p className='text-sm font-semibold text-text'>{user.name}</p>
											<p className='text-xs text-text2 truncate'>{user.email}</p>
										</div>

										{/* Links */}
										<div className='p-1.5'>
											{accountLinks.map(item => (
												<Link
													key={item.href}
													href={item.href}
													onClick={() => setAccountOpen(false)}
													className='flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text2 hover:text-text hover:bg-surface2 transition-colors'
												>
													<item.icon className='w-4 h-4' />
													{item.label}
												</Link>
											))}
										</div>

										{/* Logout */}
										<div className='border-t border-border p-1.5'>
											<button
												onClick={() => setAccountOpen(false)}
												className='flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-text2 hover:text-red hover:bg-red/5 transition-colors'
											>
												<LogOut className='w-4 h-4' />
												Đăng xuất
											</button>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
						<Link
							href='/gio-hang'
							className='relative p-2 rounded-full text-text2 hover:text-text hover:bg-surface2 transition-all'
							aria-label='Cart'
						>
							<ShoppingBag className='w-5 h-5' />
							{mounted && totalItems > 0 && (
								<motion.span
									key={`${totalItems}-${bumpKey}`}
									className='absolute -top-0.5 -right-0.5'
									initial={{ opacity: 0, scale: 0.6 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={
										bumpKey > 0
											? { type: 'spring', stiffness: 500, damping: 10, mass: 0.6 }
											: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
									}
								>
									<Badge count={totalItems} />
								</motion.span>
							)}
						</Link>
						<button
							onClick={toggleSidebar}
							className='md:hidden p-2 rounded-full text-text2 hover:text-text hover:bg-surface2 transition-all'
							aria-label='Menu'
						>
							<Menu className='w-5 h-5' />
						</button>
					</div>
				</div>
			</header>
		</>
	);
}
