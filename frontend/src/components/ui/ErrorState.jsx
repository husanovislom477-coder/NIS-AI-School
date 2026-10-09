import { FiAlertCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import Button from './Button';

/**
 * Reusable ErrorState Component
 */
export function ErrorState({
  title = 'Xatolik yuz berdi',
  message = "Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
  onRetry = null,
  retryText = "Qayta urinish",
  backTo = '/',
  backText = 'Bosh sahifa',
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl border border-rose-100 shadow-subtle max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
        <FiAlertCircle size={28} />
      </div>
      <h3 className="text-lg font-bold font-display text-slate-900 mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">
        {message}
      </p>

      <div className="flex items-center gap-3">
        {onRetry && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FiRefreshCw size={14} />}
            onClick={onRetry}
          >
            {retryText}
          </Button>
        )}
        {backTo && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FiArrowLeft size={14} />}
            to={backTo}
          >
            {backText}
          </Button>
        )}
      </div>
    </div>
  );
}

export default ErrorState;
