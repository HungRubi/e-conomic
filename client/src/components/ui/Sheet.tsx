'use client';

import { Drawer } from '@medusajs/ui';
import { type ReactNode } from 'react';

interface SheetProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
	title?: string;
	side?: 'left' | 'right';
	className?: string;
}

export default function Sheet({ open, onClose, children, title, side = 'right', className = '' }: SheetProps) {
	return (
		<Drawer open={open} onOpenChange={isOpen => !isOpen && onClose()}>
			<Drawer.Content className={className}>
				{title && (
					<Drawer.Header>
						<div className='flex items-center justify-between px-4 h-14'>
							<h2 className='text-lg font-semibold text-ui-fg-base'>{title}</h2>
							<Drawer.Close />
						</div>
					</Drawer.Header>
				)}
				<Drawer.Body className='p-4'>{children}</Drawer.Body>
				<Drawer.Footer />
			</Drawer.Content>
		</Drawer>
	);
}
