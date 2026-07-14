'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Shirt,
	Monitor,
	Home,
	Sparkles,
	Trophy,
	BookOpen,
	Heart,
	ToyBrick,
	Car,
	ShoppingBasket,
	HeartPulse,
	Tablet,
	Watch,
	Footprints,
	Handbag,
	Clock,
	PawPrint,
	Headphones,
	Zap,
	Ticket,
	Gamepad2,
	ChevronRight,
	Truck,
	TrendingUp,
	Gift,
	Percent,
	Star,
	User,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { categories } from '@/lib/categories';
import Sheet from '@/components/ui/Sheet';
import type { ReactNode } from 'react';

const CATEGORY_ICONS: Record<string, ReactNode> = {
	'thoi-trang': <Shirt className='w-4 h-4' />,
	'dien-tu': <Monitor className='w-4 h-4' />,
	'nha-cua': <Home className='w-4 h-4' />,
	'sac-dep': <Sparkles className='w-4 h-4' />,
	'the-thao': <Trophy className='w-4 h-4' />,
	'sach': <BookOpen className='w-4 h-4' />,
	'me-va-be': <Heart className='w-4 h-4' />,
	'do-choi': <ToyBrick className='w-4 h-4' />,
	'o-to-xe-may': <Car className='w-4 h-4' />,
	'bach-hoa': <ShoppingBasket className='w-4 h-4' />,
	'suc-khoe': <HeartPulse className='w-4 h-4' />,
	'thiet-bi-so': <Tablet className='w-4 h-4' />,
	'phu-kien': <Watch className='w-4 h-4' />,
	'giay-dep': <Footprints className='w-4 h-4' />,
	'tui-vi': <Handbag className='w-4 h-4' />,
	'dong-ho': <Clock className='w-4 h-4' />,
	'thu-cung': <PawPrint className='w-4 h-4' />,
	'am-thanh': <Headphones className='w-4 h-4' />,
};

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
	const pathname = usePathname();
	const activeSlug = pathname === '/' ? null : pathname.slice(1);

	const linkBase = 'mx-2 flex items-center gap-3 px-3 py-2 rounded-lg txt-medium transition-colors';

	return (
		<div className='flex flex-col gap-1 overscroll-contain'>
			{/* ── User account (mobile only) ── */}
			<div className='md:hidden mx-2 mb-2'>
				<Link
					href='/dang-nhap'
					onClick={onLinkClick}
					className='focus-ring flex items-center gap-3 px-3 py-3 rounded-lg bg-surface2/80 hover:bg-surface2 transition-colors'
				>
					<span className='flex items-center justify-center w-9 h-9 rounded-full bg-accent/10 text-accent shrink-0'>
						<User className='w-4 h-4' />
					</span>
					<div className='min-w-0'>
						<div className='text-sm font-semibold text-text'>Đăng nhập / Đăng ký</div>
						<div className='txt-compact-xsmall-plus text-text2'>Tích luỹ điểm thưởng</div>
					</div>
					<ChevronRight className='w-4 h-4 ml-auto shrink-0 text-text2/50' />
				</Link>
			</div>

			{/* ── Hot deals countdown ── */}
			<div className='mx-2 my-1 rounded-radius-btn bg-gradient-to-r from-red/10 to-orange/10 border border-red/20 p-3'>
				<div className='flex items-center gap-2 mb-1.5'>
					<Clock className='w-3.5 h-3.5 text-red' />
					<span className='text-xs font-bold text-red'>Flash sale kết thúc trong</span>
				</div>
				<div className='flex gap-1.5'>
					{['08', '45', '32'].map((v, i) => (
						<span
							key={i}
							className='w-8 h-6 flex items-center justify-center rounded-md bg-red text-white text-xs font-bold'
						>
							{v}
						</span>
					))}
					<span className='text-xs text-text2 self-center ml-auto font-medium'>Đã bán 1.2K</span>
				</div>
				<div className='mt-1.5 h-1.5 rounded-full bg-red/20 overflow-hidden'>
					<div className='h-full w-[65%] bg-red rounded-full' />
				</div>
			</div>

			{/* ── Categories ── */}
			<div className='space-y-0.5 mt-1'>
				<p className='txt-compact-xsmall-plus text-text2 uppercase tracking-wider px-3 mb-1'>Danh mục</p>
				<Link
					href='/'
					onClick={onLinkClick}
					className={`focus-ring ${linkBase} ${
						!activeSlug
							? 'bg-accent/10 text-accent font-medium'
							: 'text-text2 hover:text-text hover:bg-surface2'
					}`}
				>
					<span className='flex items-center justify-center w-4 h-4'>
						<ChevronRight className='w-3.5 h-3.5' />
					</span>
					Gợi ý cho bạn
				</Link>
				{categories.map(cat => (
					<Link
						key={cat.id}
						href={`/${cat.slug}`}
						onClick={onLinkClick}
						className={`focus-ring ${linkBase} ${
							activeSlug === cat.slug
								? 'bg-accent/10 text-accent font-medium'
								: 'text-text2 hover:text-text hover:bg-surface2'
						}`}
					>
						<span className='flex items-center justify-center w-4 h-4 shrink-0'>
							{CATEGORY_ICONS[cat.slug] || <ChevronRight className='w-3.5 h-3.5' />}
						</span>
						{cat.name}
					</Link>
				))}
			</div>

			<div className='border-t border-border my-2' />

			{/* ── Quick services ── */}
			<div className='space-y-1 px-0'>
				<p className='txt-compact-xsmall-plus text-text2 uppercase tracking-wider px-1 mb-1'>Tiện ích</p>
				<Link
					href='/don-hang-cua-ban'
					onClick={onLinkClick}
					className={`${linkBase} text-text2 hover:text-text hover:bg-surface2`}
				>
					<Truck className='w-4 h-4' /> Tra cứu đơn hàng
				</Link>
				<Link
					href='/?sort=rating'
					onClick={onLinkClick}
					className={`${linkBase} text-text2 hover:text-text hover:bg-surface2`}
				>
					<TrendingUp className='w-4 h-4' /> Bán chạy nhất
				</Link>
				<Link
					href='/?tag=new'
					onClick={onLinkClick}
					className={`${linkBase} text-text2 hover:text-text hover:bg-surface2`}
				>
					<Star className='w-4 h-4' /> Hàng mới về
				</Link>
			</div>

			{/* ── Promo sections ── */}
			<div className='space-y-2 px-0 mt-2'>
				<Link
					href='/?tag=sale'
					onClick={onLinkClick}
					className='focus-ring mx-2 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface2 hover:bg-border transition-colors group'
				>
					<span className='flex items-center justify-center w-7 h-7 rounded-full bg-red/10 text-red shrink-0'>
						<Zap className='w-3.5 h-3.5' />
					</span>
					<div className='min-w-0'>
						<div className='text-sm font-semibold text-text group-hover:text-accent transition-colors'>
							Siêu sale — Giá tốc
						</div>
						<div className='txt-compact-xsmall-plus text-text2'>Flash sale 12h–14h mỗi ngày</div>
					</div>
				</Link>

				<Link
					href='#'
					onClick={onLinkClick}
					className='focus-ring mx-2 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface2 hover:bg-border transition-colors group'
				>
					<span className='flex items-center justify-center w-7 h-7 rounded-full bg-green/10 text-green shrink-0'>
						<Ticket className='w-3.5 h-3.5' />
					</span>
					<div className='min-w-0'>
						<div className='text-sm font-semibold text-text group-hover:text-accent transition-colors'>
							Mã giảm giá
						</div>
						<div className='txt-compact-xsmall-plus text-text2'>Giảm đến 50% cho đơn từ 500K</div>
					</div>
				</Link>

				<Link
					href='#'
					onClick={onLinkClick}
					className='focus-ring mx-2 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface2 hover:bg-border transition-colors group'
				>
					<span className='flex items-center justify-center w-7 h-7 rounded-full bg-purple/10 text-purple shrink-0'>
						<Gamepad2 className='w-3.5 h-3.5' />
					</span>
					<div className='min-w-0'>
						<div className='text-sm font-semibold text-text group-hover:text-accent transition-colors'>
							Mini Game
						</div>
						<div className='txt-compact-xsmall-plus text-text2'>Quay số trúng thưởng mỗi ngày</div>
					</div>
				</Link>

				<Link
					href='#'
					onClick={onLinkClick}
					className='focus-ring mx-2 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface2 hover:bg-border transition-colors group'
				>
					<span className='flex items-center justify-center w-7 h-7 rounded-full bg-teal/10 text-teal shrink-0'>
						<Gift className='w-3.5 h-3.5' />
					</span>
					<div className='min-w-0'>
						<div className='text-sm font-semibold text-text group-hover:text-accent transition-colors'>
							Quà tặng & Ưu đãi
						</div>
						<div className='txt-compact-xsmall-plus text-text2'>Tích điểm đổi quà hấp dẫn</div>
					</div>
				</Link>

				<Link
					href='#'
					onClick={onLinkClick}
					className='focus-ring mx-2 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface2 hover:bg-border transition-colors group'
				>
					<span className='flex items-center justify-center w-7 h-7 rounded-full bg-blue/10 text-blue shrink-0'>
						<Percent className='w-3.5 h-3.5' />
					</span>
					<div className='min-w-0'>
						<div className='text-sm font-semibold text-text group-hover:text-accent transition-colors'>
							Giảm giá theo giờ
						</div>
						<div className='txt-compact-xsmall-plus text-text2'>Deal sốc mỗi khung giờ vàng</div>
					</div>
				</Link>
			</div>

			<div className='border-t border-border my-2' />

			{/* ── Promo banner ── */}
			<Link
				href='/'
				onClick={onLinkClick}
				className='relative mx-2 mb-1 overflow-hidden rounded-radius h-20 block group'
			>
				<div
					className='absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105'
					style={{
						backgroundImage:
							'url(https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop)',
					}}
				/>
				<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
				<div className='absolute bottom-2 left-3 right-3'>
					<div className='text-xs font-bold text-white'>Ưu đãi đặc biệt</div>
					<div className='txt-compact-xsmall-plus text-white/80'>Miễn phí vận chuyển từ 500K</div>
				</div>
			</Link>
		</div>
	);
}

export default function ShopSidebar() {
	const { sidebarOpen, toggleSidebar } = useUIStore();

	return (
		<>
			<aside className='hidden md:block w-56 lg:w-64 shrink-0 self-stretch pb-5'>
				<div className='sticky top-20'>
					<div className='bg-surface border border-border rounded-xl px-3 py-4 overflow-y-auto scrollbar-hover max-h-[calc(100vh-5.5rem)]'>
						<SidebarContent />
					</div>
				</div>
			</aside>

			<Sheet side='left' title='Danh mục' open={sidebarOpen} onClose={toggleSidebar}>
				<SidebarContent onLinkClick={toggleSidebar} />
			</Sheet>
		</>
	);
}
