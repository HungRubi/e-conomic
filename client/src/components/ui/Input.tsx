'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, iconLeft, iconRight, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[13px] font-medium text-text mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text2 pointer-events-none">
              {iconLeft}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full h-9 text-[13px] rounded-full bg-surface2 border
              text-text placeholder:text-text2/60
              transition-all duration-200
              focus:outline-none focus:border-border/80 focus:ring-1 focus:ring-border/40
              disabled:opacity-50 disabled:cursor-not-allowed
              ${iconLeft ? 'pl-10' : 'pl-3'}
              ${iconRight ? 'pr-10' : 'pr-3'}
              ${error ? 'border-red' : 'border-border'}
              ${className}
            `.trim()}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text2">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-[11px] text-red">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
