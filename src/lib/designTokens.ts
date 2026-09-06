import React from 'react';
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
import { RequestStatus, RequestPriority, PaymentStatus } from '../types';

/**
 * Enterprise Design Tokens & Theme Configuration
 * IBA College of Mindanao - Registrar Management System
 */

export const THEME = {
  colors: {
    primaryBlue: '#1D4ED8', // blue-700
    darkNavy: '#0F172A',    // slate-900
    pageBg: '#F8FAFC',      // slate-50
    surface: '#FFFFFF',     // white
    border: '#E2E8F0',      // slate-200
    borderStrong: '#CBD5E1',// slate-300
    primaryText: '#0F172A', // slate-900
    secondaryText: '#64748B', // slate-500
    mutedText: '#94A3B8',   // slate-400
    success: '#16A34A',     // green-600
    warning: '#D97706',     // amber-600
    danger: '#DC2626',      // red-600
    info: '#2563EB',         // blue-600
    // School Institutional Accent (Used with tasteful restraint for crests/branding)
    maroon: '#8B1E23',
    gold: '#D97706',
  },
  typography: {
    fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  radius: {
    sm: 'rounded-md',    // 6px
    md: 'rounded-lg',    // 8px
    lg: 'rounded-xl',    // 12px
    full: 'rounded-full',
  },
} as const;

export interface StatusStyleConfig {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconName: string;
  dotColor: string;
  kpiColor: string;
}

export const STATUS_CONFIG: Record<string, StatusStyleConfig> = {
  PENDING: {
    label: 'Pending',
    badgeBg: 'bg-amber-50 text-amber-900',
    badgeText: 'text-amber-900 font-semibold',
    badgeBorder: 'border-amber-300 shadow-2xs',
    iconName: 'Clock',
    dotColor: 'bg-amber-500',
    kpiColor: 'text-amber-600',
  },
  SUBMITTED: {
    label: 'Submitted',
    badgeBg: 'bg-blue-50 text-blue-700',
    badgeText: 'text-blue-700 font-semibold',
    badgeBorder: 'border-blue-200 shadow-2xs',
    iconName: 'Send',
    dotColor: 'bg-blue-600',
    kpiColor: 'text-blue-600',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    badgeBg: 'bg-indigo-50 text-indigo-900',
    badgeText: 'text-indigo-900 font-semibold',
    badgeBorder: 'border-indigo-200 shadow-2xs',
    iconName: 'Clock',
    dotColor: 'bg-indigo-500',
    kpiColor: 'text-indigo-600',
  },
  FOR_APPROVAL: {
    label: 'For Approval',
    badgeBg: 'bg-purple-50 text-purple-800',
    badgeText: 'text-purple-800 font-semibold',
    badgeBorder: 'border-purple-200 shadow-2xs',
    iconName: 'FileCheck',
    dotColor: 'bg-purple-600',
    kpiColor: 'text-purple-600',
  },
  APPROVED: {
    label: 'Approved',
    badgeBg: 'bg-teal-50 text-teal-800',
    badgeText: 'text-teal-800 font-semibold',
    badgeBorder: 'border-teal-200 shadow-2xs',
    iconName: 'CheckCircle2',
    dotColor: 'bg-teal-500',
    kpiColor: 'text-teal-600',
  },
  PROCESSING: {
    label: 'Processing',
    badgeBg: 'bg-sky-50 text-sky-900',
    badgeText: 'text-sky-900 font-semibold',
    badgeBorder: 'border-sky-300 shadow-2xs',
    iconName: 'Package',
    dotColor: 'bg-sky-600 animate-pulse',
    kpiColor: 'text-sky-700',
  },
  READY_FOR_RELEASE: {
    label: 'Ready to Claim',
    badgeBg: 'bg-emerald-100 text-emerald-950',
    badgeText: 'text-emerald-950 font-bold',
    badgeBorder: 'border-emerald-400 ring-1 ring-emerald-400/30 shadow-2xs',
    iconName: 'CheckCircle2',
    dotColor: 'bg-emerald-600 ring-2 ring-emerald-200',
    kpiColor: 'text-emerald-700',
  },
  RELEASED: {
    label: 'Completed',
    badgeBg: 'bg-emerald-50 text-emerald-800',
    badgeText: 'text-emerald-800 font-semibold',
    badgeBorder: 'border-emerald-300 shadow-2xs',
    iconName: 'CheckCircle2',
    dotColor: 'bg-emerald-600',
    kpiColor: 'text-emerald-700',
  },
  COMPLETED: {
    label: 'Completed',
    badgeBg: 'bg-emerald-50 text-emerald-800',
    badgeText: 'text-emerald-800 font-semibold',
    badgeBorder: 'border-emerald-300 shadow-2xs',
    iconName: 'CheckCircle2',
    dotColor: 'bg-emerald-600',
    kpiColor: 'text-emerald-700',
  },
  REJECTED: {
    label: 'Rejected',
    badgeBg: 'bg-rose-50 text-rose-800',
    badgeText: 'text-rose-800 font-semibold',
    badgeBorder: 'border-rose-200 shadow-2xs',
    iconName: 'XCircle',
    dotColor: 'bg-rose-600',
    kpiColor: 'text-rose-600',
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeBg: 'bg-slate-100 text-slate-700',
    badgeText: 'text-slate-700 font-medium',
    badgeBorder: 'border-slate-300 shadow-2xs',
    iconName: 'XCircle',
    dotColor: 'bg-slate-400',
    kpiColor: 'text-slate-500',
  },
  NEEDS_INFORMATION: {
    label: 'Action Needed',
    badgeBg: 'bg-amber-100 text-amber-950',
    badgeText: 'text-amber-950 font-bold',
    badgeBorder: 'border-amber-400 ring-1 ring-amber-400/30 shadow-2xs',
    iconName: 'HelpCircle',
    dotColor: 'bg-amber-600 animate-pulse',
    kpiColor: 'text-amber-800',
  },
};

export const PRIORITY_CONFIG: Record<RequestPriority, { label: string; bg: string; text: string; border: string; dot: string }> = {
  NORMAL: {
    label: 'Normal',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  HIGH: {
    label: 'High',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  URGENT: {
    label: 'Urgent',
    bg: 'bg-rose-50',
    text: 'text-rose-800 font-semibold',
    border: 'border-rose-300',
    dot: 'bg-rose-600',
  },
};
