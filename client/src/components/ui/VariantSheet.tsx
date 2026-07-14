'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Check, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { Product } from '@/types';

/* ------------------------------------------------------------------ */
/*  VariantSheet — bottom sheet (mobile) / centered modal (desktop)   */
/* ------------------------------------------------------------------ */

interface VariantSheetOptions {
	size?: string;
	color?: string;
	quantity: number;
}

interface VariantSheetProps {
	open: boolean;
	onClose: () => void;
	onAddToCart: (options: VariantSheetOptions) => void;
	onBuyNow: (options: VariantSheetOptions) => void;
	product: Product;
}

export default function VariantSheet({ open, onClose, onAddToCart, onBuyNow, product }: VariantSheetProps) {
	const isMobile = useIsMobile();

	/* ── internal variant state ── */
	const sizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))] as string[];
	const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))] as string[];

	const [selectedSize, setSelectedSize] = useState<string | null>(null);
	const [selectedColor, setSelectedColor] = useState<string | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [added, setAdded] = useState(false);

	// Reset when sheet opens
	useEffect(() => {
		if (open) {
			setSelectedSize(sizes[0] ?? null);
			setSelectedColor(colors[0] ?? null);
			setQuantity(1);
			setAdded(false);
		}
	}, [open]); // eslint-disable-line react-hooks/exhaustive-deps

	/* ── lock scroll ── */
	useEffect(() => {
		if (open) document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	/* ── Escape key ── */
	useEffect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [open, onClose]);

	/* ── derived price / stock ── */
	const selectedVariant =
		product.variants.find(v => {
			const sizeMatch = sizes.length === 0 || v.size === selectedSize;
			const colorMatch = colors.length === 0 || v.color === selectedColor;
			return sizeMatch && colorMatch;
		}) ?? product.variants[0];

	const displayPrice = selectedVariant?.price ?? product.price;
	const stock = selectedVariant?.stock ?? 0;
	const maxQty = Math.max(1, stock);
	const canConfirm = stock > 0;

	const comparePrice =
		product.compareAtPrice && product.compareAtPrice > displayPrice ? product.compareAtPrice : null;
	const discount = comparePrice ? Math.round((1 - displayPrice / comparePrice) * 100) : 0;

	const fmtPrice = (p: number) => `${p.toLocaleString('vi-VN')}₫`;

	const getOptions = (): VariantSheetOptions => ({
		size: selectedSize || undefined,
		color: selectedColor || undefined,
		quantity,
	});

	const handleAddToCart = () => {
		setAdded(true);
		onAddToCart(getOptions());
		setTimeout(() => {
			onClose();
			setAdded(false);
		}, 400);
	};

	const handleBuyNow = () => {
		setAdded(true);
		onBuyNow(getOptions());
	};

	/* ── drag-to-dismiss (mobile only, handle-area only) ── */
	const sheetRef = useRef<HTMLDivElement>(null);
	const dragHandleRef = useRef<HTMLDivElement>(null);
	const [dragY, setDragY] = useState(0);
	const isDragging = useRef(false);

	const handlePointerDown = (e: React.PointerEvent) => {
		if (e.button !== 0) return;
		isDragging.current = true;
		const startY = e.clientY;
		const node = sheetRef.current;
		if (node) node.style.transition = 'none';

		const onMove = (ev: PointerEvent) => {
			if (!isDragging.current) return;
			const dy = ev.clientY - startY;
			if (dy > 0) setDragY(dy);
		};

		const onUp = (ev: PointerEvent) => {
			if (!isDragging.current) return;
			isDragging.current = false;
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			if (node) node.style.transition = '';

			const dy = ev.clientY - startY;
			if (dy > 100) {
				onClose();
			} else {
				setDragY(0);
			}
		};

		window.addEventListener('pointermove', onMove, { passive: true });
		window.addEventListener('pointerup', onUp);
	};

	useEffect(() => {
		if (!open) setDragY(0);
	}, [open]);

	/* ── Pill chip for size/color ── */
	function OptionChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
		return (
			<button
				type='button'
				onClick={onClick}
				className={`
          relative inline-flex items-center gap-1.5 h-[34px] rounded-full px-4
          text-xs font-semibold tracking-wide
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          active:scale-[0.96]
          ${
				active
					? 'bg-fg-base text-bg-base shadow-[0_1px_6px_rgba(0,0,0,0.12)]'
					: 'bg-bg-subtle/60 text-fg-subtle border border-border-base/40 hover:border-fg-base/30 hover:text-fg-base'
			}
        `}
			>
				{active && <Check className='h-3 w-3 shrink-0' strokeWidth={2.5} />}
				{label}
			</button>
		);
	}

	/* ── Inline quantity ── */
	function QtyControl({ value, onChange, max }: { value: number; onChange: (v: number) => void; max: number }) {
		return (
			<div className='inline-flex items-center gap-3 rounded-full bg-surface2/70 border border-border-base/30 px-1'>
				<button
					type='button'
					onClick={() => onChange(Math.max(1, value - 1))}
					disabled={value <= 1}
					className='flex h-8 w-8 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-bg-subtle active:bg-bg-subtle/80 disabled:opacity-20 disabled:pointer-events-none'
					aria-label='Giảm'
				>
					<Minus className='h-3.5 w-3.5' strokeWidth={1.8} />
				</button>
				<span className='min-w-[24px] text-center text-sm font-semibold text-fg-base tabular-nums'>
					{value}
				</span>
				<button
					type='button'
					onClick={() => onChange(Math.min(max, value + 1))}
					disabled={value >= max}
					className='flex h-8 w-8 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-bg-subtle active:bg-bg-subtle/80 disabled:opacity-20 disabled:pointer-events-none'
					aria-label='Tăng'
				>
					<Plus className='h-3.5 w-3.5' strokeWidth={1.8} />
				</button>
			</div>
		);
	}

	/* ══ sheet content ══ */
	const sheetContent = (
		<div className='flex flex-col gap-0 h-full' data-variant-sheet>
			{/* ── Product summary ── */}
			<div className='flex items-center gap-4 pb-4 border-b border-border-base/10 shrink-0'>
				<div className='relative h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-surface2 ring-1 ring-border/10'>
					<Image src={product.images[0]} alt={product.name} fill className='object-cover' sizes='64px' />
				</div>
				<div className='min-w-0 flex-1'>
					<h3 className='text-sm font-semibold text-fg-base leading-snug line-clamp-1'>{product.name}</h3>
					<div className='mt-1 flex items-baseline gap-2.5'>
						<span className='text-xl font-bold text-fg-base tracking-tight'>{fmtPrice(displayPrice)}</span>
						{comparePrice && (
							<span className='text-sm text-fg-subtle/70 line-through'>{fmtPrice(comparePrice)}</span>
						)}
						{discount > 0 && (
							<span className='text-[11px] font-bold text-tag-red-text bg-tag-red-bg/30 px-1.5 py-0.5 rounded-md'>
								-{discount}%
							</span>
						)}
					</div>
				</div>
			</div>

			{/* ── options area ── */}
			<div className='flex-1 overflow-y-auto min-h-0 scrollbar-none pt-3'>
				{sizes.length > 0 && (
					<div className='pb-2'>
						<div className='flex items-center justify-between mb-3'>
							<span className='text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle/60'>
								Kích thước
							</span>
							{selectedSize && (
								<span className='text-[13px] font-medium text-fg-base'>{selectedSize}</span>
							)}
						</div>
						<div className='flex flex-wrap gap-2'>
							{sizes.map(s => (
								<OptionChip
									key={s}
									label={s}
									active={selectedSize === s}
									onClick={() => setSelectedSize(s)}
								/>
							))}
						</div>
					</div>
				)}

				{colors.length > 0 && (
					<div className='py-2'>
						<div className='flex items-center justify-between mb-3'>
							<span className='text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle/60'>
								Màu sắc
							</span>
							{selectedColor && (
								<span className='text-[13px] font-medium text-fg-base'>{selectedColor}</span>
							)}
						</div>
						<div className='flex flex-wrap gap-2'>
							{colors.map(c => (
								<OptionChip
									key={c}
									label={c}
									active={selectedColor === c}
									onClick={() => setSelectedColor(c)}
								/>
							))}
						</div>
					</div>
				)}

				<div className='flex items-center justify-between py-2'>
					<span className='text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle/60'>
						Số lượng
					</span>
					<QtyControl value={quantity} onChange={setQuantity} max={maxQty} />
				</div>
			</div>

			{/* ── Dual CTAs ── */}
			<div className='shrink-0 pt-4 border-t border-border-base/10 grid grid-cols-2 gap-3'>
				<button
					type='button'
					disabled={!canConfirm || added}
					onClick={handleAddToCart}
					className={`
            h-[46px] rounded-full text-[14px] font-semibold
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            active:scale-[0.98]
            flex items-center justify-center gap-2
            ${
				added
					? 'bg-tag-green-bg/30 text-tag-green-text border border-tag-green-border scale-95'
					: canConfirm
						? 'border border-border-base/60 text-fg-base bg-bg-base hover:bg-bg-subtle cursor-pointer'
						: 'border border-border-base/20 text-fg-subtle/40 bg-surface2/30 cursor-not-allowed'
			}
          `}
				>
					{added ? (
						<>
							<Check className='h-4 w-4' strokeWidth={2.5} /> Đã thêm
						</>
					) : (
						<>
							<ShoppingBag className='h-4 w-4' strokeWidth={1.8} /> Thêm giỏ
						</>
					)}
				</button>

				<button
					type='button'
					disabled={!canConfirm || added}
					onClick={handleBuyNow}
					className={`
            h-[46px] rounded-full text-[14px] font-semibold
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            active:scale-[0.98]
            flex items-center justify-center gap-2
            ${
				added
					? 'bg-tag-green-bg text-white scale-95 shadow-none'
					: canConfirm
						? 'bg-fg-base text-bg-base shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.14)] cursor-pointer'
						: 'bg-bg-subtle/60 text-fg-subtle/40 cursor-not-allowed'
			}
          `}
				>
					{added ? (
						<>
							<Check className='h-4 w-4' strokeWidth={2.5} /> Đã thêm
						</>
					) : (
						<>
							<ShoppingBag className='h-4 w-4' strokeWidth={1.8} /> Mua ngay{' '}
							<ArrowRight className='h-4 w-4' strokeWidth={2} />
						</>
					)}
				</button>
			</div>
		</div>
	);

	return (
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						className='fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={onClose}
					/>

					{isMobile ? (
						<motion.div
							ref={sheetRef}
							className='fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-bg-base shadow-2xl overflow-hidden'
							style={{
								borderTopLeftRadius: 20,
								borderTopRightRadius: 20,
								height: '72dvh',
								transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
							}}
							initial={{ y: '100%' }}
							animate={{ y: 0 }}
							exit={{ y: '100%' }}
							transition={{ type: 'spring', damping: 32, stiffness: 300, mass: 1 }}
						>
							<div
								ref={dragHandleRef}
								className='flex shrink-0 items-center justify-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing touch-none'
								onPointerDown={handlePointerDown}
								style={{ touchAction: 'none' }}
							>
								<div className='h-1 w-9 rounded-full bg-border/40' />
							</div>
							<div className='flex shrink-0 items-center justify-center px-5 pb-0.5'>
								<span className='text-[13px] font-semibold uppercase tracking-[0.08em] text-fg-subtle/60'>
									Tuỳ chọn sản phẩm
								</span>
							</div>
							<div
								className='flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-3 scrollbar-none flex flex-col'
								style={{ WebkitOverflowScrolling: 'touch' }}
							>
								{sheetContent}
							</div>
						</motion.div>
					) : (
						<div className='fixed inset-0 z-50 flex items-center justify-center p-4' onClick={onClose}>
							<motion.div
								className='relative w-[440px] bg-bg-base shadow-2xl overflow-hidden'
								style={{ borderRadius: 24 }}
								initial={{ opacity: 0, scale: 0.94, y: 16 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.94, y: 16 }}
								transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
								onClick={e => e.stopPropagation()}
							>
								<button
									type='button'
									onClick={onClose}
									className='absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-bg-base/80 backdrop-blur-sm border border-border-base/20 text-fg-subtle hover:text-fg-base transition-colors'
									aria-label='Đóng'
								>
									<svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
										<path
											d='M3 3l8 8M11 3l-8 8'
											stroke='currentColor'
											strokeWidth='1.5'
											strokeLinecap='round'
										/>
									</svg>
								</button>
								<div className='max-h-[82vh] overflow-y-auto px-6 py-6 scrollbar-hover flex flex-col'>
									{sheetContent}
								</div>
							</motion.div>
						</div>
					)}
				</>
			)}
		</AnimatePresence>
	);
}
