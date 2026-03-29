import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className={clsx("w-full mb-4", className)}>
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            "block w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none",
            "focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
            error 
              ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500" 
              : "border-slate-300 placeholder-slate-400"
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
