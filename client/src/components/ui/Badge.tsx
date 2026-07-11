'use client';

import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
	children?: ReactNode;
	variant?: BadgeVariant;
	count?: number;
	dot?: boolean;
	max?: number;
	className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
	default: 'bg-surface2 text-text2 border-border',
	success: 'bg-green/10 text-green border-green/20',
	warning: 'bg-orange/10 text-orange border-orange/20',
	error: 'bg-red/10 text-red border-red/20',
	info: 'bg-accent/10 text-accent border-accent/20',
};

export default function Badge({ children, variant = 'default', count, dot, max = 99, className = '' }: BadgeProps) {
	// Dot indicator
	if (dot) {
		return (
			<span
				className={`inline-block w-2 h-2 rounded-full ${variantClasses[variant].split(' ')[0]} ${className}`}
				aria-label='indicator'
			/>
		);
	}

	// Count badge
	if (count !== undefined) {
		if (count <= 0) return null;
		return (
			<span
				className={`
          inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
          text-[10px] font-bold leading-none rounded-full
          bg-accent text-white
          ${className}
        `.trim()}
			>
				{count > max ? `${max}+` : count}
			</span>
		);
	}

	// Text badge
	return (
		<span
			className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium
        rounded-full border
        ${variantClasses[variant]}
        ${className}
      `.trim()}
		>
			{children}
		</span>
	);
}
