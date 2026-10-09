import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Button Component
 * Variants: primary | secondary | outline | ghost | white | danger | navy
 * Sizes: sm | md | lg
 */
export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    leftIcon = null,
    rightIcon = null,
    loading = false,
    disabled = false,
    fullWidth = false,
    to = null,
    href = null,
    className = '',
    onClick,
    type = 'button',
    ...props
  },
  ref
) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

  const variants = {
    primary:
      'bg-school-600 hover:bg-school-700 text-white shadow-sm hover:shadow-glow focus-visible:ring-school-600 border border-transparent',
    secondary:
      'bg-school-50 hover:bg-school-100 text-school-700 border border-school-200/80 hover:border-school-300 focus-visible:ring-school-500',
    outline:
      'bg-white hover:bg-school-50/60 text-slate-700 hover:text-school-700 border border-slate-200 hover:border-school-300 shadow-sm focus-visible:ring-school-500',
    ghost:
      'bg-transparent hover:bg-school-50/70 text-slate-600 hover:text-school-700 border border-transparent focus-visible:ring-school-500',
    white:
      'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/80 shadow-sm hover:shadow focus-visible:ring-slate-400',
    navy:
      'bg-navy-900 hover:bg-navy-800 text-white border border-navy-700 shadow-sm focus-visible:ring-navy-600',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus-visible:ring-rose-500 border border-transparent',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-medium',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2 font-semibold',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5 font-semibold',
  };

  const classes = [
    baseStyles,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {loading ? (
        <span
          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
});

export default Button;
