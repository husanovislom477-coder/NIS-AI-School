import { forwardRef } from 'react';

/**
 * Reusable Container Component
 * Sizes: sm (max-w-3xl) | md (max-w-5xl) | lg (max-w-6xl) | xl (max-w-7xl) | 2xl (max-w-[1400px]) | full
 */
export const Container = forwardRef(function Container(
  {
    children,
    size = 'xl',
    className = '',
    as: Component = 'div',
    ...props
  },
  ref
) {
  const maxSizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-[1400px]',
    full: 'max-w-full',
  };

  const classes = [
    'w-full mx-auto px-4 sm:px-6 lg:px-8',
    maxSizes[size] || maxSizes.xl,
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
});

export default Container;
