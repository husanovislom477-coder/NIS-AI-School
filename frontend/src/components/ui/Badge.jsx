import { forwardRef } from 'react';

/**
 * Reusable Badge Component
 * Variants: blue | deep | light | outline | success | warning | danger | navy
 * Sizes: sm | md
 */
export const Badge = forwardRef(function Badge(
  {
    children,
    variant = 'blue',
    size = 'md',
    dot = false,
    dotColor = null,
    icon = null,
    className = '',
    ...props
  },
  ref
) {
  const variants = {
    blue: 'bg-school-50 text-school-700 border border-school-200/80',
    deep: 'bg-school-700 text-white border border-school-800',
    light: 'bg-slate-100 text-slate-700 border border-slate-200/70',
    outline: 'bg-white text-school-700 border border-school-300',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    navy: 'bg-navy-900 text-white border border-navy-800',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full font-semibold tracking-wide',
    md: 'text-xs px-3 py-1 rounded-full font-semibold tracking-wide',
  };

  const defaultDotColors = {
    blue: 'bg-school-600',
    deep: 'bg-white',
    light: 'bg-slate-500',
    outline: 'bg-school-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    navy: 'bg-school-400',
  };

  const classes = [
    'inline-flex items-center gap-1.5 font-medium select-none transition-colors shrink-0',
    variants[variant] || variants.blue,
    sizes[size] || sizes.md,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span ref={ref} className={classes} {...props}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dotColor || defaultDotColors[variant] || 'bg-current'
          }`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
});

export default Badge;
