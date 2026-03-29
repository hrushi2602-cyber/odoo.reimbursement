import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id || label.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className={clsx("w-full mb-4", className)}>
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
        <select
          id={selectId}
          ref={ref}
          className={clsx(
            "block w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none bg-white",
            "focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
            error 
              ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500" 
              : "border-slate-300"
          )}
          {...props}
        >
          <option value="" disabled>Select an option</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
