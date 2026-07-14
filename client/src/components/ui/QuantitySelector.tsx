'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	size?: 'sm' | 'md';
}

export default function QuantitySelector({ value, onChange, min = 1, max = 99, size = 'md' }: QuantitySelectorProps) {
	const isSm = size === 'sm';
	const totalH = isSm ? 'h-8' : 'h-10';
	const btnW = isSm ? 'w-8' : 'w-9';
	const iconSize = isSm ? 'h-3.5 w-3.5' : 'h-4 w-4';
	const txtW = isSm ? 'w-8' : 'w-9';
	const txtSize = isSm ? 'text-sm' : 'text-sm';

	return (
		<div className={`inline-flex items-center ${totalH} rounded-lg border border-border-base/60 bg-bg-base`}>
			<button
				onClick={() => onChange(Math.max(min, value - 1))}
				disabled={value <= min}
				className={`${btnW} ${totalH} flex items-center justify-center rounded-l-lg text-fg-subtle transition-colors hover:bg-bg-subtle active:opacity-60 disabled:pointer-events-none disabled:opacity-20`}
				aria-label='Decrease'
			>
				<Minus className={iconSize} strokeWidth={1.5} />
			</button>

			<span
				className={`flex items-center justify-center ${txtW} ${totalH} tabular-nums ${txtSize} font-medium text-fg-base`}
			>
				{value}
			</span>

			<button
				onClick={() => onChange(Math.min(max, value + 1))}
				disabled={value >= max}
				className={`${btnW} ${totalH} flex items-center justify-center rounded-r-lg text-fg-subtle transition-colors hover:bg-bg-subtle active:opacity-60 disabled:pointer-events-none disabled:opacity-20`}
				aria-label='Increase'
			>
				<Plus className={iconSize} strokeWidth={1.5} />
			</button>
		</div>
	);
}
