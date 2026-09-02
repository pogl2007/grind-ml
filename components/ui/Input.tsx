'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = '', id, ...rest },
  ref
) {
  const inputId = id ?? label;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs text-text-secondary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors duration-150 ease-out focus:border-accent ${error ? 'border-danger' : 'border-border-strong'} ${className}`}
        {...rest}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
});
