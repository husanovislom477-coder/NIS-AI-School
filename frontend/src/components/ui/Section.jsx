import { forwardRef } from 'react';
import Container from './Container';

/**
 * Reusable Section Component
 * Bg variants: white | soft | blue-tint | navy | subtle-grid | gradient
 * Py variants: none | sm | md | lg | xl
 */
export const Section = forwardRef(function Section(
  {
    children,
    id = null,
    bg = 'white',
    py = 'lg',
    containerSize = 'xl',
    badge = null,
    title = null,
    subtitle = null,
    align = 'center',
    action = null,
    className = '',
    headerClassName = '',
    useContainer = true,
    ...props
  },
  ref
) {
  const backgrounds = {
    white: 'bg-white text-slate-900',
    soft: 'bg-slate-50/70 text-slate-900 border-y border-slate-100/80',
    'blue-tint': 'bg-school-50/50 text-slate-900 border-y border-school-100/60',
    navy: 'bg-navy-900 text-white',
    'subtle-grid': 'bg-white bg-subtle-grid text-slate-900',
    'subtle-dots': 'bg-white bg-subtle-dots text-slate-900',
    gradient: 'bg-gradient-to-b from-white via-school-50/30 to-white text-slate-900',
  };

  const paddings = {
    none: 'py-0',
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-24',
    xl: 'py-20 sm:py-32',
  };

  const alignment = {
    center: 'text-center mx-auto items-center',
    left: 'text-left items-start',
    right: 'text-right items-end',
  };

  const hasHeader = badge || title || subtitle || action;

  const headerContent = hasHeader && (
    <div
      className={`mb-12 sm:mb-16 flex flex-col ${alignment[align]} ${
        align === 'center' ? 'max-w-3xl' : 'max-w-2xl'
      } ${headerClassName}`}
    >
      {badge && <div className="mb-3">{badge}</div>}
      {title && (
        <h2
          className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-display tracking-tight leading-tight ${
            bg === 'navy' ? 'text-white' : 'text-slate-900'
          }`}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          className={`mt-3 text-base sm:text-lg leading-relaxed ${
            bg === 'navy' ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {subtitle}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );

  return (
    <section
      ref={ref}
      id={id}
      className={`relative ${backgrounds[bg] || backgrounds.white} ${
        paddings[py] || paddings.lg
      } ${className}`}
      {...props}
    >
      {useContainer ? (
        <Container size={containerSize}>
          {headerContent}
          {children}
        </Container>
      ) : (
        <>
          {headerContent}
          {children}
        </>
      )}
    </section>
  );
});

export default Section;
