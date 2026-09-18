import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'terracotta' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  trailingIcon?: React.ReactNode;
  leadingIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  trailingIcon,
  leadingIcon,
  className,
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-full gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-full gap-2',
    lg: 'px-7 py-3.5 text-base rounded-full gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#141312] text-white hover:bg-[#282623] dark:bg-[#F5F2EC] dark:text-[#141312] dark:hover:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]',
    terracotta:
      'bg-[#C85A32] text-white hover:bg-[#B34B24] active:bg-[#943A18] shadow-[0_1px_3px_rgba(200,90,50,0.25)]',
    secondary:
      'bg-[#F2EFEA] text-[#141312] hover:bg-[#E8E4DC] dark:bg-[#23211F] dark:text-[#EAE6DF] dark:hover:bg-[#2D2A28] border border-[#141312]/[0.06] dark:border-white/[0.08]',
    ghost:
      'bg-transparent text-[#141312] dark:text-[#EAE6DF] hover:bg-[#141312]/[0.04] dark:hover:bg-white/[0.06]',
  };

  return (
    <button
      disabled={disabled}
      className={clsx(
        'group inline-flex items-center justify-center font-medium transition-all duration-160 select-none whitespace-nowrap',
        'active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C85A32]/40',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-40 pointer-events-none cursor-not-allowed',
        className
      )}
      {...props}
    >
      {leadingIcon && (
        <span className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5">
          {leadingIcon}
        </span>
      )}
      <span>{children}</span>
      {trailingIcon && (
        <span
          className={clsx(
            'inline-flex items-center justify-center rounded-full shrink-0 transition-transform duration-200',
            size === 'sm' && 'w-5 h-5 -mr-1',
            size === 'md' && 'w-6 h-6 -mr-1.5',
            size === 'lg' && 'w-7 h-7 -mr-2',
            variant === 'primary' && 'bg-white/15 dark:bg-black/15',
            variant === 'terracotta' && 'bg-white/20',
            (variant === 'secondary' || variant === 'ghost') &&
              'bg-[#141312]/[0.06] dark:bg-white/[0.1]',
            'group-hover:translate-x-0.5'
          )}
        >
          {trailingIcon}
        </span>
      )}
    </button>
  );
};
