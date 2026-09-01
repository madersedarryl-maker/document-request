import React from 'react';
import { motion } from 'motion/react';
import {
  SearchX,
  FilterX,
  RotateCcw,
  Sparkles,
  X,
  FileSearch,
  Search,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Button } from './Button';

interface QueueEmptyStateProps {
  searchTerm?: string;
  statusFilter?: string;
  priorityFilter?: string;
  docTypeFilter?: string;
  paymentFilter?: string;
  overdueFilter?: boolean;
  onClearSearch?: () => void;
  onResetAllFilters?: () => void;
  onRefresh?: () => void;
  onClearStatusFilter?: () => void;
  onClearPriorityFilter?: () => void;
  onClearDocTypeFilter?: () => void;
  onClearPaymentFilter?: () => void;
  onClearOverdueFilter?: () => void;
  className?: string;
  id?: string;
}

export const QueueEmptyState: React.FC<QueueEmptyStateProps> = ({
  searchTerm = '',
  statusFilter = 'ALL',
  priorityFilter = 'ALL',
  docTypeFilter = 'ALL',
  paymentFilter = 'ALL',
  overdueFilter = false,
  onClearSearch,
  onResetAllFilters,
  onRefresh,
  onClearStatusFilter,
  onClearPriorityFilter,
  onClearDocTypeFilter,
  onClearPaymentFilter,
  onClearOverdueFilter,
  className = '',
  id = 'queue-empty-state',
}) => {
  const isSearchActive = Boolean(searchTerm.trim());
  const hasFilterActive =
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    docTypeFilter !== 'ALL' ||
    paymentFilter !== 'ALL' ||
    overdueFilter;
  const hasAnyActive = isSearchActive || hasFilterActive;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`py-12 px-6 sm:px-10 text-center flex flex-col items-center justify-center bg-white rounded-xl ${className}`}
    >
      {/* Visual Animated Icon Container */}
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/90 border border-slate-200 shadow-xs flex items-center justify-center text-slate-500 relative">
          {isSearchActive ? (
            <SearchX className="w-8 h-8 text-slate-500" strokeWidth={1.75} />
          ) : hasFilterActive ? (
            <FilterX className="w-8 h-8 text-slate-500" strokeWidth={1.75} />
          ) : (
            <FileSearch className="w-8 h-8 text-slate-400" strokeWidth={1.75} />
          )}

          {/* Decorative Corner Badge */}
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white border-2 border-white flex items-center justify-center shadow-xs">
            {isSearchActive ? (
              <Search className="w-3 h-3" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
          </div>
        </div>
      </div>

      {/* Title & Contextual Heading */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 tracking-tight">
        {isSearchActive ? (
          <>
            No requests matching <span className="text-blue-600 font-extrabold">&ldquo;{searchTerm}&rdquo;</span>
          </>
        ) : hasFilterActive ? (
          'No requests match the active filters'
        ) : (
          'No document requests found'
        )}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-5 leading-relaxed">
        {isSearchActive ? (
          <>
            We couldn&apos;t find any records with that student name, student ID, or reference number.
            Please verify the spelling or clear active filters to expand your search.
          </>
        ) : hasFilterActive ? (
          'None of the requests currently in the queue meet your specific status, priority, or document type combination.'
        ) : (
          'Your queue is clear or no student submissions have been recorded yet.'
        )}
      </p>

      {/* Active Filter Chips / Badges that can be individually cleared */}
      {hasAnyActive && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg mb-6 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase tracking-wider">
            Active Criteria:
          </span>

          {isSearchActive && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
              Search: <strong className="font-semibold">&ldquo;{searchTerm}&rdquo;</strong>
              {onClearSearch && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  title="Clear search term"
                  className="hover:bg-blue-200/60 rounded p-0.5 ml-0.5 cursor-pointer text-blue-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          )}

          {statusFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
              Status: <strong>{statusFilter.replace(/_/g, ' ')}</strong>
              {onClearStatusFilter && (
                <button
                  type="button"
                  onClick={onClearStatusFilter}
                  title="Remove status filter"
                  className="hover:bg-amber-200/60 rounded p-0.5 ml-0.5 cursor-pointer text-amber-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          )}

          {priorityFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium">
              Priority: <strong>{priorityFilter}</strong>
              {onClearPriorityFilter && (
                <button
                  type="button"
                  onClick={onClearPriorityFilter}
                  title="Remove priority filter"
                  className="hover:bg-rose-200/60 rounded p-0.5 ml-0.5 cursor-pointer text-rose-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          )}

          {docTypeFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-medium">
              Doc Type: <strong>{docTypeFilter}</strong>
              {onClearDocTypeFilter && (
                <button
                  type="button"
                  onClick={onClearDocTypeFilter}
                  title="Remove document type filter"
                  className="hover:bg-indigo-200/60 rounded p-0.5 ml-0.5 cursor-pointer text-indigo-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          )}

          {paymentFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
              Payment: <strong>{paymentFilter.replace(/_/g, ' ')}</strong>
              {onClearPaymentFilter && (
                <button
                  type="button"
                  onClick={onClearPaymentFilter}
                  title="Remove payment status filter"
                  className="hover:bg-emerald-200/60 rounded p-0.5 ml-0.5 cursor-pointer text-emerald-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          )}

          {overdueFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold shadow-2xs">
              SLA: <strong>&gt; 3 Business Days Pending</strong>
              {onClearOverdueFilter && (
                <button
                  type="button"
                  onClick={onClearOverdueFilter}
                  title="Remove overdue SLA filter"
                  className="hover:bg-amber-200 rounded p-0.5 ml-0.5 cursor-pointer text-amber-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          )}
        </div>
      )}

      {/* Helpful Search Suggestions Guidance */}
      <div className="text-left bg-slate-50/70 border border-slate-100 rounded-lg p-3.5 mb-6 max-w-md w-full">
        <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Suggestions to find what you need:
        </h4>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li>Check for typos in the reference number or student ID.</li>
          <li>Try searching with just the student&apos;s last name or partial ID.</li>
          <li>Reset status and priority filters to view requests across all stages.</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {hasAnyActive && onResetAllFilters && (
          <Button
            id="empty-state-reset-all-btn"
            size="sm"
            variant="primary"
            icon={RotateCcw}
            onClick={onResetAllFilters}
            className="shadow-xs cursor-pointer font-medium"
          >
            Clear All Filters & Search
          </Button>
        )}

        {isSearchActive && onClearSearch && (
          <Button
            id="empty-state-clear-search-btn"
            size="sm"
            variant="secondary"
            icon={X}
            onClick={onClearSearch}
            className="cursor-pointer"
          >
            Clear Search Only
          </Button>
        )}

        {onRefresh && (
          <Button
            id="empty-state-refresh-btn"
            size="sm"
            variant="outline"
            icon={RefreshCw}
            onClick={onRefresh}
            className="cursor-pointer text-slate-600"
          >
            Refresh Queue
          </Button>
        )}
      </div>
    </motion.div>
  );
};
