import { FiInbox } from 'react-icons/fi';
import Button from './Button';

/**
 * Reusable EmptyState Component
 */
export function EmptyState({
  icon = null,
  title = "Ma'lumot topilmadi",
  description = "Hozircha hech qanday ma'lumot mavjud emas.",
  actionText = null,
  onAction = null,
  actionTo = null,
  action = null,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-subtle max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-school-50 text-school-600 flex items-center justify-center mb-4 border border-school-100">
        {icon || <FiInbox size={28} />}
      </div>
      <h3 className="text-lg font-bold font-display text-slate-900 mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      {action ? (
        action
      ) : actionText && (onAction || actionTo) ? (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          to={actionTo}
        >
          {actionText}
        </Button>
      ) : null}
    </div>
  );
}

export default EmptyState;
