import { forwardRef } from 'react';

/**
 * Reusable Card Component
 * Variants: default | elevated | bordered | flat | glass | navy
 * Paddings: none | sm | md | lg
 */
export const Card = forwardRef(function Card(
  {
    children,
    variant = 'default',
    padding = 'md',
    hover = false,
    className = '',
    as: Component = 'div',
    onClick = null,
    ...props
  },
  ref
) {
  const variants = {
    default:
      'bg-white text-slate-900 border border-slate-100 shadow-card',
    elevated:
      'bg-white text-slate-900 border border-slate-100/80 shadow-md',
    bordered:
      'bg-white text-slate-900 border border-slate-200 shadow-subtle',
    flat:
      'bg-slate-50/80 text-slate-900 border border-slate-100',
    glass:
      'bg-white/80 backdrop-blur-md text-slate-900 border border-white/60 shadow-card',
    navy:
      'bg-navy-900 text-white border border-navy-800 shadow-card',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover
    ? 'hover:-translate-y-1 hover:shadow-card-hover hover:border-school-200 transition-all duration-300 cursor-pointer'
    : 'transition-all duration-200';

  const classes = [
    'rounded-2xl overflow-hidden',
    variants[variant] || variants.default,
    paddings[padding] || paddings.md,
    hoverStyles,
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component
      ref={ref}
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </Component>
  );
});

export default Card;
