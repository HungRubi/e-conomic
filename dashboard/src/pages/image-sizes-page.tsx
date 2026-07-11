import { useMemo } from 'react';

// ---------------------------------------------------------------------------
// Danh sách ảnh — ghi theo vị trí trang / phần / chức năng, kích thước hiển thị px
// ---------------------------------------------------------------------------

type ImageEntry = {
	location: string; // VD: "Trang chủ → Banner desktop"
	description?: string;
	/** Kích thước hiển thị thực tế trên giao diện (px) */
	displaySize: string;
	/** Kích thước ảnh upload khuyến nghị (px) */
	uploadSize: string;
	type: 'fill' | 'fixed' | 'img' | 'css';
	mode?: string;
};

const IMAGE_LIST: ImageEntry[] = [
	// ===== TRANG CHỦ =====
	{
		location: 'Trang chủ → Banner desktop',
		description: 'CSS background full viewport, ảnh gốc 1815×866',
		displaySize: 'toàn màn hình (≥1920×~866)',
		uploadSize: '≥1920×900',
		type: 'css',
		mode: 'bg-cover',
	},
	{
		location: 'Trang chủ → Banner mobile',
		description: 'CSS background viewport ≤640px, ảnh gốc 941×1672',
		displaySize: 'toàn màn hình (~390×~844)',
		uploadSize: '400×900 hoặc 941×1672',
		type: 'css',
		mode: 'bg-cover',
	},
	{
		location: 'Trang chủ → Video YouTube placeholder',
		description: 'Hình nền video YouTube',
		displaySize: 'aspect-video (rộng toàn container)',
		uploadSize: '1280×720 (16:9)',
		type: 'css',
		mode: 'bg-cover',
	},
	{
		location: 'Trang chủ → Thẻ danh mục chính (MainCollectionCategoryCard)',
		description: 'Grid danh mục — 4 thẻ, fill, min-h-72 (288px)',
		displaySize: 'mobile: 275×288 / desktop: ~277×288',
		uploadSize: '≥400×400 (crop vuông)',
		type: 'fill',
		mode: 'object-cover',
	},

	// ===== TRANG CHỦ → TheBotanicalCare =====
	{
		location: 'Trang chủ → Botanical Care (TheBotanicalCare)',
		description: 'Grid 4 card, col-span 7/5/5/7',
		displaySize: 'card lớn: ~700×525 / card nhỏ: ~500×375',
		uploadSize: '1200×900 (4:3)',
		type: 'fixed',
	},
	{
		location: 'Trang chủ → Botanical Care (bản sao 2)',
		displaySize: 'giống trên',
		uploadSize: '1200×900 (4:3)',
		type: 'fixed',
	},
	{
		location: 'Trang chủ → Botanical Care (bản sao 3)',
		displaySize: 'giống trên',
		uploadSize: '1200×900 (4:3)',
		type: 'fixed',
	},
	{
		location: 'Trang chủ → Botanical Care (bản sao 4)',
		displaySize: 'giống trên',
		uploadSize: '1200×900 (4:3)',
		type: 'fixed',
	},

	// ===== TRANG CHỦ → TheSoulJewelry =====
	{
		location: 'Trang chủ → Soul Jewelry — ảnh chính',
		description: 'col-span-2, ảnh lớn nhất',
		displaySize: '~500×~342',
		uploadSize: '1200×820',
		type: 'fixed',
	},
	{
		location: 'Trang chủ → Soul Jewelry — ảnh grid trái',
		description: '2 cột, grid phải',
		displaySize: '~240×~270',
		uploadSize: '800×900',
		type: 'fixed',
	},
	{
		location: 'Trang chủ → Soul Jewelry — ảnh grid phải',
		displaySize: '~240×~270',
		uploadSize: '800×900',
		type: 'fixed',
	},

	// ===== TRANG CHỦ → TheHealingSpace =====
	{
		location: 'Trang chủ → Healing Space — ảnh trái',
		description: 'col-span-2 trong grid 6 cột desktop',
		displaySize: '~200×~167 (desktop)',
		uploadSize: '1200×1000',
		type: 'fixed',
	},
	{
		location: 'Trang chủ → Healing Space — ảnh phải',
		description: 'col-span-4, ml-8 shadow lớn',
		displaySize: '~400×~503 (desktop)',
		uploadSize: '780×980',
		type: 'fixed',
	},
	{
		location: 'Trang chủ → Healing Space — ảnh mobile',
		description: 'sm:hidden, chỉ hiện trên mobile',
		displaySize: 'toàn ngang mobile (~352×~203)',
		uploadSize: '900×520',
		type: 'fixed',
	},

	// ===== TRANG SẢN PHẨM =====
	{
		location: 'Trang sản phẩm → Ảnh đại diện (ProductCard)',
		description: 'Grid sản phẩm — aspect-square, fill',
		displaySize: 'mobile: 158×158 / tablet: 169×169 / desktop: 230×230',
		uploadSize: '≥400×400 (crop vuông)',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Trang sản phẩm → Gallery thumbnail (ProductDetailGallery)',
		description: 'Thumb strip bên trái ảnh chính',
		displaySize: 'mobile: 63×63 / desktop: 84×84',
		uploadSize: '≥200×200 (crop vuông)',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Trang sản phẩm → Gallery ảnh chính',
		description: 'Ảnh lớn trung tâm, aspect-square',
		displaySize: 'mobile: ~351×351 / desktop: ~665×665',
		uploadSize: '≥800×800 (crop vuông, tối đa 1024×1024)',
		type: 'fill',
		mode: 'object-contain',
	},
	{
		location: 'Trang sản phẩm → Bộ chọn biến thể (VariantPicker)',
		description: 'Vòng tròn 44px, dùng <img>',
		displaySize: '44×44',
		uploadSize: '88×88 (2× cho Retina)',
		type: 'img',
	},
	{
		location: 'Trang sản phẩm → Bảng giá hạt (BraceletPriceDetail)',
		description: 'Thumb hạt/đá trong bảng chi tiết giá',
		displaySize: '44×44',
		uploadSize: '88×88 (2× cho Retina)',
		type: 'img',
	},
	{
		location: 'Trang sản phẩm → Button danh mục (ProductPageClient)',
		description: 'Horizontal scroll categories, min-h-72',
		displaySize: 'mobile: 304×288 / desktop: ~275×288',
		uploadSize: '≥400×400 (crop vuông)',
		type: 'fill',
		mode: 'object-cover',
	},

	// ===== GIỎ HÀNG =====
	{
		location: 'Giỏ hàng → Ảnh item (CartItem)',
		description: 'h-23 w-23 (92px) / sm:w-33 (132px)',
		displaySize: 'mobile: 92×92 / desktop: 132×132',
		uploadSize: '≥264×264 (2× cho Retina)',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Giỏ hàng → Bay animation (CartFlyToCartLayer)',
		description: 'Ảnh bay từ sản phẩm vào giỏ',
		displaySize: '160×160 (animation)',
		uploadSize: '≥320×320 (2× cho Retina)',
		type: 'fill',
		mode: 'object-cover',
	},

	// ===== ĐƠN HÀNG =====
	{
		location: 'Đơn hàng → Strip preview (OrderList)',
		description: '4 ảnh strip trong card đơn hàng, aspect-square w-44',
		displaySize: '176×176',
		uploadSize: '≥352×352 (2× cho Retina)',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Đơn hàng → Chi tiết item (OrderDetail)',
		description: 'h-20 w-20 (80px), fallback Package icon',
		displaySize: '80×80',
		uploadSize: '≥160×160',
		type: 'fill',
		mode: 'object-cover',
	},

	// ===== PAY =====
	{
		location: 'Pay → OrderPassport (PayV2)',
		displaySize: '48×48',
		uploadSize: '96×96 (2×)',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Pay → ItemsPanel (PayV2)',
		displaySize: '64×64',
		uploadSize: '128×128 (2×)',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Pay → Summary (PayV3)',
		displaySize: '40×40',
		uploadSize: '80×80 (2×)',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Pay → ProductsPanel (PayV3)',
		displaySize: '64×64',
		uploadSize: '128×128 (2×)',
		type: 'fill',
		mode: 'object-cover',
	},

	// ===== TRANG GIỚI THIỆU =====
	{
		location: 'Giới thiệu → Hero background layers',
		description: '3 lớp ảnh xếp chồng, opacity 0.35/0.22',
		displaySize: 'toàn màn hình (100vw)',
		uploadSize: '≥1920×1080',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Giới thiệu → SectionSplit — ảnh đơn',
		description: 'aspect-4/5 sm:aspect-5/6',
		displaySize: 'mobile: 100vw / desktop: 46vw (~590×~708)',
		uploadSize: '≥800×1000',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Giới thiệu → SectionSplit — grid 2 cột',
		displaySize: 'mobile: 50vw / desktop: 23vw (~295×~370)',
		uploadSize: '≥600×750 (4:5)',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Giới thiệu → Spotlight — ảnh đơn',
		description: 'aspect-4/5 lg:aspect-auto',
		displaySize: 'mobile: 100vw / desktop: 50vw (~640×~800)',
		uploadSize: '≥800×1000',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Giới thiệu → Spotlight — grid',
		description: 'min-h-40 (160px)',
		displaySize: 'mobile: 50vw / desktop: 25vw (~320×~160)',
		uploadSize: '≥600×400',
		type: 'fill',
		mode: 'object-cover',
	},

	// ===== BLOG =====
	{
		location: 'Blog → Ảnh bìa bài viết (BlogCoverMedia)',
		description: 'Conditional — chỉ hiện khi có cover',
		displaySize: 'mobile: 100vw / tablet: 50vw / desktop: 25vw',
		uploadSize: '≥1200×900 (4:3, dùng chung cho blog list + detail)',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Blog → Logo fallback khi không có ảnh bìa',
		displaySize: '100×100 (trung tâm)',
		uploadSize: '100×100 (png logo)',
		type: 'fixed',
	},
	{
		location: 'Blog → Hero backdrop (BlogAboutHero)',
		description: 'absolute inset-0, opacity-35',
		displaySize: 'toàn màn hình (100vw)',
		uploadSize: '≥1920×1080',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Blog → Hero logo fallback',
		displaySize: '112×112',
		uploadSize: '112×112 (png logo)',
		type: 'fixed',
	},
	{
		location: 'Blog → Article inspiration (DesignInspirationArticleList)',
		description: 'articles.map() — fallback logo khi !imageUrl',
		displaySize: 'mobile: 100vw / desktop: 25vw (~320×~240)',
		uploadSize: '≥600×450 (4:3)',
		type: 'fill',
		mode: 'object-cover',
	},

	// ===== DESIGN TOOL =====
	{
		location: 'Design → Material thumbnail (DesktopMaterialsSidebar)',
		description: 'Sidebar — aspect-square rounded-lg',
		displaySize: '50×50',
		uploadSize: '100×100 (2×)',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Design → Material selector (app/design/page)',
		description: 'Grid mobile — w-10 aspect-square',
		displaySize: '40×40',
		uploadSize: '80×80 (2×)',
		type: 'fill',
		mode: 'object-cover',
	},
	{
		location: 'Design → Saved design preview (app/my-design/page)',
		displaySize: 'mobile: 92vw / desktop: tối đa 720px',
		uploadSize: '720×? (tỉ lệ khung hình giữ nguyên)',
		type: 'fixed',
	},

	// ===== HEADER =====
	{
		location: 'Header → Logo mark (BrandMark)',
		description: 'h-8 w-8 rounded-full ring',
		displaySize: '20×20 (hiển thị trong h-8 w-8)',
		uploadSize: '40×40 (2× cho Retina)',
		type: 'fixed',
	},

	// ===== SHOP NAV =====
	{
		location: 'Menu → Dropdown feature card (ShopNav)',
		description: 'Collection card trong dropdown navigation',
		displaySize: 'desktop: 220px / mobile: 18vw',
		uploadSize: '≥220×220 (crop vuông)',
		type: 'fill',
		mode: 'object-cover',
	},

	// ===== LOADING SKELETON =====
	{
		location: 'Loading → Skeleton material grid (DesignBoneyard)',
		displaySize: '56×56 (skeleton)',
		uploadSize: '— (skeleton, không upload)',
		type: 'fill',
	},
	{
		location: 'Loading → Skeleton inMaterials',
		displaySize: '56×56 (skeleton)',
		uploadSize: '— (skeleton, không upload)',
		type: 'fill',
	},
	{
		location: 'Loading → Cart line fixture (boneyard-fixtures)',
		displaySize: '132×132 (skeleton)',
		uploadSize: '— (skeleton, không upload)',
		type: 'fill',
	},

	// ===== OG IMAGE (SEO) =====
	{
		location: 'SEO → Open Graph ảnh sản phẩm',
		description: '<img> trong ImageResponse SSR',
		displaySize: '500×500 (OG share)',
		uploadSize: '500×500',
		type: 'img',
	},
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TYPE_STYLES: Record<string, { label: string; badge: string }> = {
	fill: { label: 'fill', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300' },
	fixed: { label: 'fixed', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
	img: { label: '<img>', badge: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
	css: { label: 'CSS', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
};

export default function ImageSizesPage() {
	const stats = useMemo(() => {
		const typeCount: Record<string, number> = {};
		for (const img of IMAGE_LIST) {
			typeCount[img.type] = (typeCount[img.type] || 0) + 1;
		}
		return { images: IMAGE_LIST.length, typeCount };
	}, []);

	return (
		<div className='dashboard-fade-in space-y-6'>
			<div className='flex items-center gap-2'>
				<h1 className='text-2xl font-semibold tracking-tight'>Kích thước ảnh</h1>
				<span className='rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'>
					Miue.healing Website
				</span>
			</div>
			<p className='text-sm text-muted-foreground'>
				Danh sách tất cả ảnh trên website — kích thước hiển thị thực tế (px) và kích thước upload khuyến nghị.
				Dùng để chọn đúng font size ảnh khi upload.
			</p>

			{/* Summary */}
			<div className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6'>
				<div className='rounded-lg border bg-card p-3 text-center'>
					<div className='text-xl font-bold text-foreground'>{stats.images}</div>
					<div className='text-[11px] uppercase tracking-wide text-muted-foreground'>Tổng ảnh</div>
				</div>
				{Object.entries(stats.typeCount).map(([type, count]) => {
					const s = TYPE_STYLES[type];
					return (
						<div key={type} className='rounded-lg border bg-card p-3 text-center'>
							<div className='text-xl font-bold text-foreground'>{count}</div>
							<div className='text-[11px] uppercase tracking-wide text-muted-foreground'>
								{s?.label || type}
							</div>
						</div>
					);
				})}
			</div>

			{/* Bảng */}
			<div className='overflow-hidden rounded-xl border bg-card'>
				<div className='overflow-x-auto'>
					<table className='w-full text-sm'>
						<thead>
							<tr className='border-b bg-muted/30 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
								<th className='px-4 py-3'>Vị trí</th>
								<th className='px-4 py-3'>Kích thước hiển thị</th>
								<th className='px-4 py-3'>Upload khuyến nghị</th>
								<th className='px-4 py-3'>Kiểu</th>
							</tr>
						</thead>
						<tbody>
							{IMAGE_LIST.map(img => (
								<tr
									key={img.location}
									className='dashboard-row-enter border-b last:border-b-0 hover:bg-muted/20'
								>
									<td className='px-4 py-3'>
										<div className='font-medium text-foreground'>{img.location}</div>
										{img.description && (
											<div className='mt-0.5 text-xs leading-relaxed text-muted-foreground'>
												{img.description}
											</div>
										)}
										{img.mode && (
											<span className='mt-1 inline-block rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-600 dark:bg-sky-950 dark:text-sky-300'>
												{img.mode}
											</span>
										)}
									</td>
									<td className='whitespace-nowrap px-4 py-3 font-mono text-xs font-medium'>
										{img.displaySize}
									</td>
									<td className='whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-brand-button'>
										{img.uploadSize}
									</td>
									<td className='px-4 py-3'>
										<span
											className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
												TYPE_STYLES[img.type]?.badge || 'bg-muted text-muted-foreground'
											}`}
										>
											{img.type === 'fill'
												? 'Next/Image fill'
												: img.type === 'fixed'
													? 'Next/Image fixed'
													: img.type === 'img'
														? '<img>'
														: 'CSS bg'}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className='rounded-lg border bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground'>
				<p className='font-semibold'>Ghi chú:</p>
				<ul className='mt-1 list-inside list-disc space-y-0.5'>
					<li>
						<strong>fill</strong> — ảnh dùng <code>next/image fill</code> + <code>sizes</code> attribute,
						kích thước phụ thuộc viewport
					</li>
					<li>
						<strong>fixed</strong> — ảnh dùng <code>width</code> + <code>height</code> cố định
					</li>
					<li>
						<strong>&lt;img&gt;</strong> — thẻ img thường (không qua Next.js Image optimization)
					</li>
					<li>
						<strong>CSS bg</strong> — ảnh nền CSS <code>backgroundImage</code>
					</li>
					<li>Khuyến nghị upload 2× kích thước hiển thị cho ảnh cần Retina (logo, thumb nhỏ)</li>
				</ul>
			</div>
		</div>
	);
}
