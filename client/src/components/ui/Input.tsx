'use client';

import { Input as MedusaInput } from '@medusajs/ui';
import { forwardRef, type ReactNode } from 'react';

interface InputProps extends Omit<React.ComponentPropsWithoutRef<typeof MedusaInput>, 'size'> {
	label?: string;
	error?: string;
	iconLeft?: ReactNode;
	iconRight?: ReactNode;
	size?: 'small' | 'base';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, iconLeft, iconRight, size = 'base', className = '', ...props }, ref) => {
		return (
			<div className='w-full'>
				{label && <label className='block text-[13px] font-medium text-fg-base mb-1.5'>{label}</label>}
				<div className='relative'>
					{iconLeft && (
						<div className='absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none z-10'>
							{iconLeft}
						</div>
					)}
					<MedusaInput
						ref={ref}
						size={size}
						className={`
							${iconLeft ? '!pl-10' : ''}
							${iconRight ? '!pr-10' : ''}
							${error ? '!border-ui-border-error' : ''}
							${className}
						`.trim()}
						{...props}
					/>
					{iconRight && (
						<div className='absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle'>{iconRight}</div>
					)}
				</div>
				{error && <p className='mt-1 text-[11px] text-ui-tag-red-text'>{error}</p>}
			</div>
		);
	}
);

Input.displayName = 'Input';
export default Input;
