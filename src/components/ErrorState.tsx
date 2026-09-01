import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  id?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load information',
  description = 'We encountered an error while communicating with the server. Please try refreshing or check your connection.',
  onRetry,
  className = '',
  id,
}) => {
  return (
    <div
      id={id}
      className={`py-10 px-4 text-center flex flex-col items-center justify-center bg-rose-50/50 rounded-xl border border-rose-200/80 shadow-2xs ${className}`}
    >
      <div className="w-11 h-11 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-rose-950 mb-1">{title}</h3>
      <p className="text-xs text-rose-700/90 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button
          size="sm"
          variant="secondary"
          icon={RefreshCw}
          onClick={onRetry}
          className="border-rose-200 hover:bg-rose-100/60 text-rose-900"
        >
          Retry Request
        </Button>
      )}
    </div>
  );
};
