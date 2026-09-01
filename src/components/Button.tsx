import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  children,
  className = '',
  id,
  type = 'button',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8 min-h-[32px]',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2 h-10 min-h-[40px]',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 h-11 min-h-[44px]',
  };

  const variantClasses = {
    primary:
      'bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white shadow-2xs focus-visible:ring-blue-600',
    secondary:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs hover:border-slate-300 focus-visible:ring-slate-400',
    outline:
      'bg-transparent hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300 focus-visible:ring-blue-600',
    tertiary:
      'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700 focus-visible:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-2xs focus-visible:ring-rose-500',
    success:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-2xs focus-visible:ring-emerald-500',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  const iconElement = Icon ? <Icon className={`${iconSizes[size]} shrink-0`} /> : null;

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin shrink-0`} />
      ) : (
        iconPosition === 'left' && iconElement
      )}
      <span className="whitespace-nowrap">{children}</span>
      {!loading && iconPosition === 'right' && iconElement}
    </button>
  );
};
