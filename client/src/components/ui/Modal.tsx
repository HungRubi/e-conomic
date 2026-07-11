'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
	title?: string;
	className?: string;
}

export default function Modal({ open, onClose, children, title, className = '' }: ModalProps) {
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

	return (
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
					/>
					<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
						<motion.div
							className={`
                bg-surface border border-border rounded-radius shadow-2xl
                w-full max-w-md max-h-[85vh] overflow-y-auto
                ${className}
              `.trim()}
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 12 }}
							transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
							onClick={e => e.stopPropagation()}
						>
							{title && (
								<div className='flex items-center justify-between px-6 h-14 border-b border-border'>
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
							<div className='p-6'>{children}</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
