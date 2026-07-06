'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'hero';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent text-white shadow-[0_4px_16px_var(--accent-glow)] hover:shadow-[0_10px_28px_var(--accent-glow)] active:translate-y-px',
  secondary:
    'bg-surface text-text border border-border hover:border-border hover:bg-surface2 active:translate-y-px',
  ghost:
    'text-text2 hover:text-text hover:bg-surface2 active:translate-y-px',
  outline:
    'border border-border text-text hover:border-border hover:bg-surface2 active:translate-y-px',
  hero:
    'bg-white/90 text-[#15191f] backdrop-blur-md shadow-md hover:bg-white active:translate-y-px',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-full',
  md: 'h-10 px-4 text-sm gap-2 rounded-full',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-full',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      disabled,
      className = '',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium
          transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-border
          focus-visible:ring-offset-2 focus-visible:ring-offset-bg
          disabled:opacity-50 disabled:pointer-events-none select-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `.trim()}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children && <span className="relative">{children}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
