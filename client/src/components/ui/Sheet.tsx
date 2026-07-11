'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SheetProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
	title?: string;
	side?: 'left' | 'right';
	className?: string;
}

export default function Sheet({ open, onClose, children, title, side = 'right', className = '' }: SheetProps) {
	const handleEscape = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		},
		[onClose]
	);

	useEffect(() => {
		if (open) {
			document.addEventListener('keydown', handleEscape);
			document.body.style.overflow = 'hidden';
		}
		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = '';
		};
	}, [open, handleEscape]);

	const slideVariants = {
		left: { initial: { x: '-100%' }, exit: { x: '-100%' } },
		right: { initial: { x: '100%' }, exit: { x: '100%' } },
	};

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Overlay */}
					<motion.div
						className='fixed inset-0 bg-black/60 backdrop-blur-sm z-60'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
					/>

					{/* Sheet panel */}
					<motion.div
						className={`
              fixed top-0 bottom-0 z-60 w-full max-w-sm
              bg-surface border-l border-border shadow-2xl
              flex flex-col
              ${side === 'left' ? 'left-0 border-r' : 'right-0 border-l'}
              ${className}
            `.trim()}
						initial={slideVariants[side].initial}
						animate={{ x: 0 }}
						exit={slideVariants[side].exit}
						transition={{ type: 'spring', damping: 30, stiffness: 300 }}
					>
						{/* Header */}
						{title && (
							<div className='flex items-center justify-between px-4 h-14 border-b border-border shrink-0'>
								<h2 className='text-lg font-semibold'>{title}</h2>
								<button
									onClick={onClose}
									className='p-2 rounded-full hover:bg-surface2 transition-colors'
									aria-label='Close'
								>
									<X className='w-5 h-5' />
								</button>
							</div>
						)}

						{/* Content */}
						<div className='flex-1 overflow-y-auto p-4'>{children}</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
