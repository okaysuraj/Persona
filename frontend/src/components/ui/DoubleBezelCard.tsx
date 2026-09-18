import React from 'react';
import clsx from 'clsx';

interface DoubleBezelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  variant?: 'default' | 'subtle' | 'interactive';
  onClick?: () => void;
}

/**
 * DoubleBezelCard implements the "Doppelrand / Nested Architecture"
 * from the high-end-visual-design protocol: an outer precision bezel
 * and an inner concentric core for physical hardware depth.
 */
export const DoubleBezelCard: React.FC<DoubleBezelCardProps> = ({
  children,
  className,
  innerClassName,
  variant = 'default',
  onClick,
  ...props
}) => {
  const isInteractive = variant === 'interactive' || Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      className={clsx(
        'group relative p-1.5 rounded-3xl transition-all duration-300',
        'bg-[#141312]/[0.03] dark:bg-white/[0.04]',
        'ring-1 ring-[#141312]/[0.06] dark:ring-white/[0.08]',
        isInteractive && [
          'cursor-pointer',
          'hover:ring-[#C85A32]/40 dark:hover:ring-[#C85A32]/50',
          'hover:bg-[#C85A32]/[0.02] dark:hover:bg-[#C85A32]/[0.04]',
          'active:scale-[0.985] transition-transform duration-150',
        ],
        className
      )}
      {...props}
    >
      <div
        className={clsx(
          'relative rounded-[calc(1.5rem-0.375rem)] transition-colors duration-200',
          'bg-white dark:bg-[#181716]',
          'border border-[#141312]/[0.06] dark:border-white/[0.06]',
          'shadow-[0_2px_12px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)]',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};
