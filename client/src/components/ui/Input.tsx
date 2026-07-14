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
				{label && <label className='block txt-small-plus text-fg-base mb-1.5'>{label}</label>}
				<div className='relative'>
					{iconLeft && (
						<div className='absolute left-2 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none z-10'>
							{iconLeft}
						</div>
					)}
					<MedusaInput
						ref={ref}
						size={size}
						style={iconLeft || iconRight ? { paddingLeft: iconLeft ? '36px' : undefined, paddingRight: iconRight ? '36px' : undefined } : undefined}
						className={className || undefined}
						{...props}
					/>
					{iconRight && (
						<div className='absolute right-2 top-1/2 -translate-y-1/2 text-fg-subtle'>{iconRight}</div>
					)}
				</div>
				{error && <p className='mt-1 txt-compact-xsmall-plus text-ui-tag-red-text'>{error}</p>}
			</div>
		);
	}
);

Input.displayName = 'Input';
export default Input;
