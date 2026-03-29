import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, noPadding }) => {
  return (
    <div className={clsx("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)}>
      <div className={clsx(!noPadding && "p-6")}>
        {children}
      </div>
    </div>
  );
};

export const CardHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; className?: string }> = ({ 
  title, subtitle, action, className 
}) => (
  <div className={clsx("flex justify-between items-center mb-6", className)}>
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
