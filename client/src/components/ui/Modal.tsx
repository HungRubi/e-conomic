'use client';

import { FocusModal } from '@medusajs/ui';
import { type ReactNode } from 'react';

interface ModalProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
	title?: string;
	className?: string;
}

export default function Modal({ open, onClose, children, title, className = '' }: ModalProps) {
	return (
		<FocusModal open={open} onOpenChange={isOpen => !isOpen && onClose()}>
			<FocusModal.Content
				className={className}
				overlayProps={{ onClick: onClose }}
			>
				{title && (
					<FocusModal.Header>
						<div className='flex items-center justify-between px-6 h-14'>
							<h2 className='text-lg font-semibold text-ui-fg-base'>{title}</h2>
							<FocusModal.Close />
						</div>
					</FocusModal.Header>
				)}
				<FocusModal.Body className='p-6'>{children}</FocusModal.Body>
			</FocusModal.Content>
		</FocusModal>
	);
}
