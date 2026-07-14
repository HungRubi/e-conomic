'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { StarRating } from '@/components';
import VariantSheet from '@/components/ui/VariantSheet';
import { useCartStore } from '@/stores/cart-store';
import { toast } from '@medusajs/ui';
import { useFlyingCart } from './FlyingCartProvider';
import type { Product } from '@/types';

interface ProductCardProps {
	product: Product;
	index?: number;
	showBuyNow?: boolean;
}

export default function ProductCard({ product, index = 0, showBuyNow = true }: ProductCardProps) {
	const addItem = useCartStore(s => s.addItem);
	const { flyFromRect } = useFlyingCart();
	const cardRef = useRef<HTMLDivElement>(null);
	const [imgLoaded, setImgLoaded] = useState(false);
	const [variantSheetOpen, setVariantSheetOpen] = useState(false);

	const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
	const primaryTag = product.tags[0];
	const soldCount = (product.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 200) + 50;

	const triggerFlying = useCallback(() => {
		const img = cardRef.current?.querySelector('img');
		const rect = img?.getBoundingClientRect();
		if (rect) flyFromRect(rect, product.images[0]);
	}, [product.images, flyFromRect]);

	const handleAddToCart = useCallback(
		(options: { size?: string; color?: string; quantity: number }) => {
			addItem({
				productId: product.id,
				name: product.name,
				price: product.price,
				image: product.images[0],
				quantity: options.quantity,
				size: options.size,
				color: options.color,
			});
			triggerFlying();
			toast.success(`Đã thêm "${product.name}" vào giỏ`);
		},
		[product, addItem, triggerFlying]
	);

	const handleBuyNowVariant = useCallback(
		(options: { size?: string; color?: string; quantity: number }) => {
			addItem({
				productId: product.id,
				name: product.name,
				price: product.price,
				image: product.images[0],
				quantity: options.quantity,
				size: options.size,
				color: options.color,
			});
			triggerFlying();
			setTimeout(() => {
				window.location.href = '/thanh-toan';
			}, 500);
		},
		[product, addItem, triggerFlying]
	);

	const openSheet = useCallback(() => {
		setVariantSheetOpen(true);
	}, []);

	const handleAdd = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.preventDefault();
			e.stopPropagation();
			openSheet();
		},
		[openSheet]
	);

	const handleBuyNow = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();
		// Open variant sheet so user can choose size/color
		setVariantSheetOpen(true);
	}, []);

	return (
		<motion.article
			ref={cardRef}
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			viewport={{ once: true, margin: '-40px' }}
			transition={{ delay: index * 0.04, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
			className='product-card group h-full'
		>
			<div className='card h-full overflow-hidden !p-2 rounded-xl border-border/80 bg-surface/90 shadow-[0_18px_60px_rgba(0,0,0,0.06)] hover:border-border hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]'>
				<div className='relative aspect-square overflow-hidden rounded-lg bg-surface2'>
					<Link href={`/san-pham/${product.slug}`} aria-label={product.name}>
						<Image
							src={product.images[0]}
							alt={product.name}
							fill
							sizes='(max-width: 768px) 50vw, 25vw'
							className={`product-card-image object-cover transition-[opacity,filter,transform,object-position] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-95 group-hover:saturate-110 group-hover:scale-105 ${
								imgLoaded ? 'opacity-100' : 'opacity-0'
							}`}
							onLoad={() => setImgLoaded(true)}
						/>
					</Link>

					{!imgLoaded && <div className='skeleton absolute inset-0' />}
					<div className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100'>
						<div className='product-image-sheen absolute inset-0' />
					</div>

					{/* Left side: discount + tag */}
					<div className='absolute left-2 top-2 flex items-center gap-1 max-w-[calc(100%-3.5rem)]'>
						{discount > 0 && (
							<span className='shrink-0 rounded-full bg-red px-2 py-0.5 txt-compact-xsmall-plus text-white leading-none'>
								-{discount}%
							</span>
						)}
						{primaryTag && (
							<span className='truncate rounded-full border border-border bg-surface/85 px-2 py-0.5 txt-compact-xsmall-plus text-text backdrop-blur-md leading-none'>
								{primaryTag}
							</span>
						)}
					</div>

					{/* Right side: cart icon */}
					<button
						onClick={handleAdd}
						className='absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface/85 text-text shadow-sm backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-border hover:bg-surface2 active:translate-y-px'
						aria-label='Thêm vào giỏ'
					>
						<ShoppingBag className='h-3.5 w-3.5' />
					</button>
				</div>

				<div className='flex flex-col px-1.5 pb-1 pt-2.5 gap-1'>
					<Link href={`/san-pham/${product.slug}`} className='block'>
						<h3 className='line-clamp-2 text-xs font-medium leading-snug text-text transition-colors group-hover:text-accent'>
							{product.name}
						</h3>
					</Link>

					<p className='line-clamp-1 text-xs leading-relaxed text-text2'>{product.description}</p>

					<div className='flex items-center justify-between gap-2'>
						<StarRating rating={product.rating} reviewCount={product.reviewCount} />
						<span className='shrink-0 txt-xsmall text-text2/60'>Đã bán {soldCount}</span>
					</div>

					<div className='flex flex-wrap items-end justify-between gap-x-1 pt-1'>
						<div className='min-w-0'>
							<div className='text-xs font-semibold text-text leading-tight'>
								{product.price.toLocaleString('vi-VN')}₫
							</div>
							{product.compareAtPrice && (
								<div className='txt-xsmall text-text2 line-through leading-tight'>
									{product.compareAtPrice.toLocaleString('vi-VN')}₫
								</div>
							)}
						</div>

						{showBuyNow && (
							<button
								type='button'
								onClick={handleBuyNow}
								className='focus-ring mt-1.5 w-full sm:w-auto inline-flex h-7 items-center justify-center gap-1 rounded-full bg-text px-3 txt-compact-xsmall-plus text-bg shadow-sm transition-all duration-300 touch-manipulation ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-85 active:translate-y-px'
							>
								<ShoppingCart className='h-3 w-3' />
								Mua ngay
							</button>
						)}
					</div>
				</div>
			</div>

			<VariantSheet
				open={variantSheetOpen}
				onClose={() => setVariantSheetOpen(false)}
				onAddToCart={handleAddToCart}
				onBuyNow={handleBuyNowVariant}
				product={product}
			/>
		</motion.article>
	);
}
