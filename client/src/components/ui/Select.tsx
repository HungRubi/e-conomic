'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps {
	value?: string;
	options: SelectOption[];
	onChange?: (event: { target: { value: string } }) => void;
	className?: string;
	disabled?: boolean;
}

export default function Select({ value, options, onChange, className = '', disabled = false }: SelectProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const selected = options.find(opt => opt.value === value) || options[0];

	useEffect(() => {
		const onPointerDown = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) setOpen(false);
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false);
		};

		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, []);

	return (
		<div ref={ref} className={`relative inline-flex ${className}`}>
			<button
				type='button'
				disabled={disabled}
				onClick={() => setOpen(prev => !prev)}
				className='inline-flex h-8 min-w-[132px] items-center justify-between gap-2 rounded-md border border-border bg-bg px-3 text-[13px] font-medium text-text transition-colors hover:bg-surface2 focus:outline-none focus:border-text2/40 focus:ring-2 focus:ring-border/50 disabled:cursor-not-allowed disabled:opacity-50'
				aria-haspopup='listbox'
				aria-expanded={open}
			>
				<span className='truncate'>{selected?.label}</span>
				<ChevronDown
					className={`h-3.5 w-3.5 shrink-0 text-text2 transition-transform ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{open && (
				<div className='absolute right-0 top-[calc(100%+6px)] z-50 w-52 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-[0_12px_32px_rgba(0,0,0,0.12)]'>
					<div role='listbox' className='space-y-0.5'>
						{options.map(opt => {
							const active = opt.value === selected?.value;
							return (
								<button
									key={opt.value}
									type='button'
									role='option'
									aria-selected={active}
									onClick={() => {
										onChange?.({ target: { value: opt.value } });
										setOpen(false);
									}}
									className={`flex h-8 w-full items-center justify-between rounded-md px-2.5 text-left text-[13px] transition-colors ${
										active
											? 'bg-surface2 text-text font-medium'
											: 'text-text2 hover:bg-surface2 hover:text-text'
									}`}
								>
									<span className='truncate'>{opt.label}</span>
									{active && <Check className='h-3.5 w-3.5 text-text' />}
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
