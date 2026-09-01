import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ToastAlert: React.FC = () => {
  const { latestToast, dismissToast } = useNotifications();
  const navigate = useNavigate();

  if (!latestToast) return null;

  const getIcon = () => {
    switch (latestToast.type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'ALERT':
        return <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-slide-up">
      <div
        onClick={() => {
          if (latestToast.request_id) {
            navigate(`/request/${latestToast.request_id}`);
          }
          dismissToast();
        }}
        className="p-4 bg-white rounded-xl shadow-2xl border border-zinc-200 cursor-pointer hover:border-blue-300 transition-all flex items-start space-x-3"
      >
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-zinc-900 truncate">{latestToast.title}</p>
          <p className="text-xs text-zinc-600 mt-0.5 line-clamp-2 leading-relaxed">
            {latestToast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dismissToast();
          }}
          className="text-zinc-400 hover:text-zinc-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
