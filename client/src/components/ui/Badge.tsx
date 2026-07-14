'use client';

import { Badge as MedusaBadge } from '@medusajs/ui';
import type { ReactNode } from 'react';

type MedusaBadgeColor = 'green' | 'red' | 'blue' | 'orange' | 'grey' | 'purple';

interface BadgeProps {
	children?: ReactNode;
	variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
	count?: number;
	dot?: boolean;
	max?: number;
	className?: string;
}

const colorMap: Record<string, MedusaBadgeColor> = {
	default: 'grey',
	success: 'green',
	warning: 'orange',
	error: 'red',
	info: 'blue',
};

export default function Badge({ children, variant = 'default', count, dot, max = 99, className = '' }: BadgeProps) {
	// Dot indicator
	if (dot) {
		return (
			<span
				className={`inline-block w-2 h-2 rounded-full bg-ui-tag-${colorMap[variant]}-icon ${className}`}
				aria-label='indicator'
			/>
		);
	}

	// Count badge
	if (count !== undefined) {
		if (count <= 0) return null;
		return (
			<span
				className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none rounded-full bg-ui-fg-interactive text-ui-fg-on-color ${className}`}
			>
				{count > max ? `${max}+` : count}
			</span>
		);
	}

	// Text badge
	return (
		<MedusaBadge color={colorMap[variant] ?? 'grey'} size='xsmall' rounded='full' className={className}>
			{children}
		</MedusaBadge>
	);
}
