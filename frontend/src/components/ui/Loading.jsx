/**
 * Reusable Loading Component
 * Types: spinner | page | skeleton | overlay
 * Sizes: sm | md | lg
 */
export function Loading({
  type = 'spinner',
  size = 'md',
  text = 'Yuklanmoqda...',
  count = 3,
  className = '',
}) {
  const spinnerSizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  if (type === 'page') {
    return (
      <div
        className={`min-h-[50vh] flex flex-col items-center justify-center p-8 text-center ${className}`}
      >
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-school-600 to-school-800 flex items-center justify-center shadow-glow animate-pulse">
            <span className="text-white font-bold font-display text-lg">NIS</span>
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-school-400/30 border-t-school-600 animate-spin" />
        </div>
        {text && (
          <p className="text-sm font-medium text-slate-500 tracking-wide font-sans">
            {text}
          </p>
        )}
      </div>
    );
  }

  if (type === 'overlay') {
    return (
      <div
        className={`absolute inset-0 bg-white/75 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 rounded-2xl ${className}`}
      >
        <div
          className={`${spinnerSizes[size] || spinnerSizes.md} rounded-full border-slate-200 border-t-school-600 animate-spin mb-2`}
        />
        {text && <p className="text-xs font-semibold text-slate-600">{text}</p>}
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className={`space-y-4 animate-pulse w-full ${className}`}>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3"
          >
            <div className="h-5 bg-slate-200/80 rounded-md w-1/3" />
            <div className="h-4 bg-slate-200/50 rounded-md w-3/4" />
            <div className="h-4 bg-slate-200/40 rounded-md w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`${spinnerSizes[size] || spinnerSizes.md} rounded-full border-slate-200 border-t-school-600 animate-spin shrink-0`}
      />
      {text && <span className="text-sm text-slate-600 font-medium">{text}</span>}
    </div>
  );
}

export default Loading;
