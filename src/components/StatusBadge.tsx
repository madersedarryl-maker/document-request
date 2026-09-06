import React from 'react';
import { RequestStatus, RequestPriority, PaymentStatus } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../lib/designTokens';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileCheck,
  Package,
  HelpCircle,
  Send,
  AlertTriangle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus | string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDot?: boolean;
  className?: string;
}

const normalizeStatusKey = (st: string): string => {
  if (!st) return 'SUBMITTED';
  const clean = st.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (clean === 'PENDING' || clean === 'WAITING') return 'PENDING';
  if (clean === 'PROCESSING' || clean === 'IN_PROGRESS' || clean === 'PRINTING') return 'PROCESSING';
  if (clean === 'COMPLETED' || clean === 'COMPLETE' || clean === 'FINISHED') return 'COMPLETED';
  if (clean === 'RELEASED') return 'RELEASED';
  if (clean === 'READY' || clean === 'READY_FOR_PICKUP') return 'READY_FOR_RELEASE';
  if (clean === 'SUBMITTED') return 'SUBMITTED';
  if (clean === 'UNDER_REVIEW' || clean === 'REVIEWING') return 'UNDER_REVIEW';
  if (clean === 'FOR_APPROVAL' || clean === 'PENDING_APPROVAL') return 'FOR_APPROVAL';
  if (clean === 'APPROVED') return 'APPROVED';
  if (clean === 'REJECTED' || clean === 'DENIED') return 'REJECTED';
  if (clean === 'CANCELLED' || clean === 'CANCELED') return 'CANCELLED';
  if (clean === 'NEEDS_INFORMATION' || clean === 'ACTION_REQUIRED' || clean === 'NEEDS_INFO') return 'NEEDS_INFORMATION';
  return clean;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  showDot = false,
  className = '',
}) => {
  const normalized = normalizeStatusKey(String(status));
  const config = STATUS_CONFIG[normalized] || {
    label: String(status).replace(/_/g, ' '),
    badgeBg: 'bg-slate-50 text-slate-700',
    badgeText: 'text-slate-700 font-medium',
    badgeBorder: 'border-slate-200',
    iconName: 'AlertCircle',
    dotColor: 'bg-slate-400',
    kpiColor: 'text-slate-600',
  };

  const renderIcon = () => {
    const iconClass =
      size === 'xs'
        ? 'w-2.5 h-2.5 mr-1 shrink-0'
        : size === 'sm'
        ? 'w-3 h-3 mr-1 shrink-0'
        : 'w-3.5 h-3.5 mr-1.5 shrink-0';

    switch (normalized) {
      case 'PENDING':
        return <Clock className={`${iconClass} text-amber-600`} />;
      case 'SUBMITTED':
        return <Send className={`${iconClass} text-blue-600`} />;
      case 'UNDER_REVIEW':
        return <Clock className={`${iconClass} text-indigo-600`} />;
      case 'FOR_APPROVAL':
        return <FileCheck className={`${iconClass} text-purple-600`} />;
      case 'APPROVED':
        return <CheckCircle2 className={`${iconClass} text-teal-600`} />;
      case 'PROCESSING':
        return (
          <Package
            className={`${iconClass} text-sky-600 animate-pulse`}
            style={{ animationDuration: '1.8s' }}
          />
        );
      case 'READY_FOR_RELEASE':
        return <CheckCircle2 className={`${iconClass} text-emerald-700`} strokeWidth={2.5} />;
      case 'RELEASED':
      case 'COMPLETED':
        return <CheckCircle2 className={`${iconClass} text-emerald-600`} strokeWidth={2.2} />;
      case 'REJECTED':
        return <XCircle className={`${iconClass} text-rose-600`} />;
      case 'CANCELLED':
        return <XCircle className={`${iconClass} text-slate-500`} />;
      case 'NEEDS_INFORMATION':
        return <HelpCircle className={`${iconClass} text-amber-700`} />;
      default:
        return <AlertCircle className={`${iconClass} text-slate-500`} />;
    }
  };

  const sizeClasses =
    size === 'xs'
      ? 'text-[10px] px-2 py-0.5 leading-tight font-medium'
      : size === 'sm'
      ? 'text-[11px] px-2.5 py-0.5 leading-tight font-semibold'
      : size === 'lg'
      ? 'text-xs px-3.5 py-1.5 leading-tight font-bold shadow-xs'
      : 'text-xs px-3 py-1 leading-tight font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-full border whitespace-nowrap tracking-tight transition-colors ${config.badgeBg} ${config.badgeText} ${config.badgeBorder} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${config.dotColor}`}
        />
      )}
      {showIcon && renderIcon()}
      <span>{config.label}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{
  priority: RequestPriority;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}> = ({ priority, size = 'sm', showDot = true, className = '' }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.NORMAL;
  const isUrgent = priority === 'URGENT';
  const isHigh = priority === 'HIGH';

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border tracking-wide uppercase font-semibold transition-colors ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${config.dot} ${
            isUrgent ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};

export const PaymentBadge: React.FC<{
  status: PaymentStatus;
  fee: number;
  className?: string;
}> = ({ status, fee, className = '' }) => {
  if (status === 'NOT_REQUIRED' || fee === 0) {
    return (
      <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 font-medium ${className}`}>
        Gratis (₱0.00)
      </span>
    );
  }

  const map = {
    PENDING: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
    PAID: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    FAILED: 'bg-rose-50 text-rose-800 border-rose-200 font-medium',
    REFUNDED: 'bg-purple-50 text-purple-800 border-purple-200 font-medium',
    NOT_REQUIRED: 'bg-slate-50 text-slate-600 border-slate-200 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-md border ${map[status]} ${className}`}
    >
      {status === 'PAID' ? 'Paid' : status === 'PENDING' ? 'Unpaid' : status} (₱{Number(fee).toFixed(2)})
    </span>
  );
};
