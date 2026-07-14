'use client';

import { Button as MedusaButton } from '@medusajs/ui';
import { forwardRef, type ReactNode } from 'react';

type MedusaVariant = 'primary' | 'secondary' | 'transparent' | 'danger';
type MedusaSize = 'small' | 'base' | 'large' | 'xlarge';

interface ButtonProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'size'> {
	variant?: MedusaVariant;
	size?: MedusaSize;
	loading?: boolean;
	icon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ variant = 'primary', size = 'base', loading, icon, children, className, ...props }, ref) => {
		return (
			<MedusaButton
				ref={ref}
				variant={variant}
				size={size}
				isLoading={loading}
				className={className}
				{...(props as Record<string, unknown>)}
			>
				{icon && <span className='shrink-0'>{icon}</span>}
				{children}
			</MedusaButton>
		);
	}
);

Button.displayName = 'Button';
export default Button;
