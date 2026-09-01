import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KpiCardProps {
  label: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  variant?: 'neutral' | 'blue' | 'amber' | 'indigo' | 'sky' | 'emerald' | 'rose' | 'teal';
  badge?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  id?: string;
  highlighted?: boolean;
  highlightText?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  description,
  icon: Icon,
  variant = 'neutral',
  badge,
  onClick,
  active = false,
  className = '',
  id,
  highlighted = false,
  highlightText = 'New intake',
}) => {
  // Semantic color styling for icon, text & subtle border highlight
  const variantStyles = {
    neutral: {
      iconColor: 'text-slate-500',
      iconBg: 'bg-slate-100',
      valueColor: 'text-slate-900',
      labelColor: 'text-slate-500',
      borderActive: 'border-slate-400 ring-1 ring-slate-400',
      highlightBorder: 'ring-2 ring-slate-400/80 border-slate-400 bg-slate-50/40 shadow-[0_0_16px_rgba(100,116,139,0.2)]',
      highlightDot: 'bg-slate-500',
      highlightPing: 'bg-slate-400',
    },
    blue: {
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      valueColor: 'text-blue-700',
      labelColor: 'text-blue-600',
      borderActive: 'border-blue-500 ring-1 ring-blue-500',
      highlightBorder: 'ring-2 ring-blue-500/80 border-blue-400 bg-blue-50/40 shadow-[0_0_18px_rgba(59,130,246,0.25)]',
      highlightDot: 'bg-blue-600',
      highlightPing: 'bg-blue-400',
    },
    amber: {
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      valueColor: 'text-amber-700',
      labelColor: 'text-amber-700',
      borderActive: 'border-amber-500 ring-1 ring-amber-500',
      highlightBorder: 'ring-2 ring-amber-500/80 border-amber-400 bg-amber-50/40 shadow-[0_0_18px_rgba(245,158,11,0.25)]',
      highlightDot: 'bg-amber-600',
      highlightPing: 'bg-amber-400',
    },
    indigo: {
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      valueColor: 'text-indigo-700',
      labelColor: 'text-indigo-700',
      borderActive: 'border-indigo-500 ring-1 ring-indigo-500',
      highlightBorder: 'ring-2 ring-indigo-500/80 border-indigo-400 bg-indigo-50/40 shadow-[0_0_18px_rgba(99,102,241,0.25)]',
      highlightDot: 'bg-indigo-600',
      highlightPing: 'bg-indigo-400',
    },
    sky: {
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50',
      valueColor: 'text-sky-700',
      labelColor: 'text-sky-700',
      borderActive: 'border-sky-500 ring-1 ring-sky-500',
      highlightBorder: 'ring-2 ring-sky-500/80 border-sky-400 bg-sky-50/40 shadow-[0_0_18px_rgba(14,165,233,0.25)]',
      highlightDot: 'bg-sky-600',
      highlightPing: 'bg-sky-400',
    },
    emerald: {
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      valueColor: 'text-emerald-700',
      labelColor: 'text-emerald-700',
      borderActive: 'border-emerald-500 ring-1 ring-emerald-500',
      highlightBorder: 'ring-2 ring-emerald-500/80 border-emerald-400 bg-emerald-50/40 shadow-[0_0_18px_rgba(16,185,129,0.25)]',
      highlightDot: 'bg-emerald-600',
      highlightPing: 'bg-emerald-400',
    },
    rose: {
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
      valueColor: 'text-rose-700',
      labelColor: 'text-rose-700',
      borderActive: 'border-rose-500 ring-1 ring-rose-500',
      highlightBorder: 'ring-2 ring-rose-500/80 border-rose-400 bg-rose-50/40 shadow-[0_0_18px_rgba(244,63,94,0.25)]',
      highlightDot: 'bg-rose-600',
      highlightPing: 'bg-rose-400',
    },
    teal: {
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50',
      valueColor: 'text-teal-700',
      labelColor: 'text-teal-700',
      borderActive: 'border-teal-500 ring-1 ring-teal-500',
      highlightBorder: 'ring-2 ring-teal-500/80 border-teal-400 bg-teal-50/40 shadow-[0_0_18px_rgba(20,184,166,0.25)]',
      highlightDot: 'bg-teal-600',
      highlightPing: 'bg-teal-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.neutral;
  const isClickable = Boolean(onClick);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      id={id}
      onClick={onClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      animate={
        highlighted
          ? {
              scale: [1, 1.025, 1],
              transition: { duration: 0.8, repeat: 1, ease: 'easeInOut' },
            }
          : { scale: 1 }
      }
      className={`relative bg-white p-4 rounded-xl border transition-[border-color,box-shadow,background-color] duration-300 flex flex-col justify-between select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
        highlighted
          ? style.highlightBorder
          : active
          ? style.borderActive
          : 'border-slate-200 hover:border-slate-300 shadow-2xs'
      } ${isClickable ? 'cursor-pointer hover:shadow-xs active:scale-[0.99]' : ''} ${className}`}
    >
      {/* Realtime Pulse Indicator Pill */}
      <AnimatePresence>
        {highlighted && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="absolute -top-2.5 right-3 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-semibold shadow-md tracking-wide"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.highlightPing}`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${style.highlightDot}`}
              />
            </span>
            <span>{highlightText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header: Label + Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${style.labelColor}`}>
          {label}
        </span>
        <div className={`w-7 h-7 rounded-lg ${style.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${style.iconColor}`} />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-1.5 flex items-baseline justify-between gap-2">
        <div className={`text-2xl font-bold tracking-tight ${style.valueColor}`}>
          {value}
        </div>
        {highlighted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80"
          >
            <Sparkles className="w-2.5 h-2.5 shrink-0 animate-pulse" />
            <span>Live Sync</span>
          </motion.div>
        )}
      </div>

      {/* Subtitle / Explanation */}
      {description && (
        <p className="text-[11px] text-slate-500 font-normal truncate">
          {description}
        </p>
      )}

      {badge && (
        <span className="mt-1 self-start text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
          {badge}
        </span>
      )}
    </motion.div>
  );
};

