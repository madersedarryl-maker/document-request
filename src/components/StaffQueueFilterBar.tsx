import React, { useState } from 'react';
import {
  Search,
  X,
  Calendar,
  CalendarDays,
  FileText,
  User,
  SlidersHorizontal,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  Filter,
  Check,
} from 'lucide-react';
import { format, subDays, startOfMonth, isValid, parseISO } from 'date-fns';
import { DocumentType } from '../types';

export type DatePreset = 'ALL' | 'TODAY' | '7_DAYS' | '30_DAYS' | 'THIS_MONTH' | 'CUSTOM';
export type SearchTarget = 'ALL' | 'STUDENT_NAME';

export interface StaffQueueFilterBarProps {
  // Search
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  searchTarget: SearchTarget;
  onSearchTargetChange: (target: SearchTarget) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;

  // Document Type
  docTypeFilter: string;
  onDocTypeFilterChange: (docTypeId: string) => void;
  docTypes: DocumentType[];
  docTypeCounts?: Record<string, number>;

  // Date Range
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
  onDateRangeChange: (from: string, to: string, preset: DatePreset) => void;
  datePreset: DatePreset;

  // Status & Priority
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;

  // SLA Overdue
  overdueOnly: boolean;
  onToggleOverdue: () => void;
  overdueCount: number;

  // Counts & Reset
  totalFilteredCount: number;
  totalRequestsCount: number;
  onResetAllFilters: () => void;
}

export const StaffQueueFilterBar: React.FC<StaffQueueFilterBarProps> = ({
  searchTerm,
  onSearchTermChange,
  searchTarget,
  onSearchTargetChange,
  searchInputRef,
  docTypeFilter,
  onDocTypeFilterChange,
  docTypes,
  docTypeCounts = {},
  dateFrom,
  dateTo,
  onDateRangeChange,
  datePreset,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  overdueOnly,
  onToggleOverdue,
  overdueCount,
  totalFilteredCount,
  totalRequestsCount,
  onResetAllFilters,
}) => {
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  // Helper for applying date presets
  const handleApplyPreset = (preset: DatePreset) => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    if (preset === 'ALL') {
      onDateRangeChange('', '', 'ALL');
    } else if (preset === 'TODAY') {
      onDateRangeChange(todayStr, todayStr, 'TODAY');
    } else if (preset === '7_DAYS') {
      const past7 = format(subDays(today, 6), 'yyyy-MM-dd');
      onDateRangeChange(past7, todayStr, '7_DAYS');
    } else if (preset === '30_DAYS') {
      const past30 = format(subDays(today, 29), 'yyyy-MM-dd');
      onDateRangeChange(past30, todayStr, '30_DAYS');
    } else if (preset === 'THIS_MONTH') {
      const firstDay = format(startOfMonth(today), 'yyyy-MM-dd');
      onDateRangeChange(firstDay, todayStr, 'THIS_MONTH');
    } else if (preset === 'CUSTOM') {
      onDateRangeChange(dateFrom, dateTo, 'CUSTOM');
    }
  };

  // Helper for manual date input changes
  const handleDateFromChange = (newFrom: string) => {
    onDateRangeChange(newFrom, dateTo, 'CUSTOM');
  };

  const handleDateToChange = (newTo: string) => {
    onDateRangeChange(dateFrom, newTo, 'CUSTOM');
  };

  const handleClearDateRange = () => {
    onDateRangeChange('', '', 'ALL');
  };

  // Format date range label for badge
  const getDateRangeLabel = () => {
    if (!dateFrom && !dateTo) return null;
    try {
      if (dateFrom && dateTo) {
        if (dateFrom === dateTo) {
          return `Date: ${format(parseISO(dateFrom), 'MMM dd, yyyy')}`;
        }
        return `Date: ${format(parseISO(dateFrom), 'MMM dd')} - ${format(parseISO(dateTo), 'MMM dd, yyyy')}`;
      }
      if (dateFrom) {
        return `From: ${format(parseISO(dateFrom), 'MMM dd, yyyy')}`;
      }
      if (dateTo) {
        return `Until: ${format(parseISO(dateTo), 'MMM dd, yyyy')}`;
      }
    } catch {
      return `Date: ${dateFrom || 'Start'} to ${dateTo || 'End'}`;
    }
    return null;
  };

  const selectedDocTypeObj = docTypes.find((dt) => dt.id === docTypeFilter);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    docTypeFilter !== 'ALL' ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    overdueOnly;

  return (
    <div
      id="staff-queue-filter-bar"
      className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3.5 transition-all"
    >
      {/* ------------------------------------------------------------- */}
      {/* Row 1: Primary Controls (Search, Document Type, Date Range)   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Field (Student Name, ID, Reference Number) */}
        <div className="md:col-span-5 relative">
          <div className="flex items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef as any}
                type="text"
                id="search-queue-input"
                placeholder={
                  searchTarget === 'STUDENT_NAME'
                    ? 'Filter strictly by student name or surname...'
                    : 'Search student name, ID, or reference number...'
                }
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className={`w-full text-xs pl-9 pr-16 py-2 bg-slate-50 border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors h-9.5 ${
                  searchTarget === 'STUDENT_NAME' ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
                }`}
                aria-label="Filter requests by student name or reference number"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchTermChange('');
                      searchInputRef?.current?.focus();
                    }}
                    title="Clear search (Esc)"
                    className="p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
                    /
                  </kbd>
                )}
              </div>
            </div>

            {/* Scope Toggle: All Fields vs Student Name Only */}
            <button
              type="button"
              id="toggle-student-name-scope-btn"
              onClick={() =>
                onSearchTargetChange(searchTarget === 'STUDENT_NAME' ? 'ALL' : 'STUDENT_NAME')
              }
              className={`ml-1.5 shrink-0 px-2.5 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 h-9.5 cursor-pointer ${
                searchTarget === 'STUDENT_NAME'
                  ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title={
                searchTarget === 'STUDENT_NAME'
                  ? 'Filtering by Student Name only (Click to search all fields)'
                  : 'Click to filter strictly by Student Name'
              }
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">
                {searchTarget === 'STUDENT_NAME' ? 'Student Name' : 'All Fields'}
              </span>
            </button>
          </div>
        </div>

        {/* Document Type Selector */}
        <div className="md:col-span-3">
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </div>
            <select
              id="filter-queue-doctype"
              value={docTypeFilter}
              onChange={(e) => onDocTypeFilterChange(e.target.value)}
              className="w-full text-xs pl-8.5 pr-6 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 h-9.5 cursor-pointer transition-colors"
              aria-label="Filter requests by document type"
            >
              <option value="ALL">All Document Types</option>
              {docTypes.map((dt) => {
                const count = docTypeCounts[dt.id];
                return (
                  <option key={dt.id} value={dt.id}>
                    {dt.name} {dt.code ? `(${dt.code})` : ''} {count !== undefined ? `• ${count}` : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Date Range Selector Dropdown / Popover Trigger */}
        <div className="md:col-span-4">
          <div className="relative">
            <button
              type="button"
              id="date-range-filter-trigger"
              onClick={() => setIsDatePopoverOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg border h-9.5 cursor-pointer transition-colors ${
                dateFrom || dateTo
                  ? 'bg-blue-50 text-blue-800 border-blue-300 font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
              }`}
              aria-label="Filter requests by date range"
              aria-expanded={isDatePopoverOpen}
            >
              <div className="flex items-center gap-2 truncate">
                <Calendar className={`w-4 h-4 shrink-0 ${dateFrom || dateTo ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="truncate">
                  {getDateRangeLabel() || (
                    datePreset === 'ALL'
                      ? 'Date Range: All Time'
                      : datePreset === 'TODAY'
                      ? 'Date: Today'
                      : datePreset === '7_DAYS'
                      ? 'Date: Past 7 Days'
                      : datePreset === '30_DAYS'
                      ? 'Date: Past 30 Days'
                      : datePreset === 'THIS_MONTH'
                      ? 'Date: This Month'
                      : 'Specific Date Range'
                  )}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isDatePopoverOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Date Range Popover Dropdown Panel */}
            {isDatePopoverOpen && (
              <div
                id="date-range-popover-panel"
                className="absolute right-0 top-full mt-1.5 z-30 w-72 sm:w-84 bg-white border border-slate-200 rounded-xl shadow-lg p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    <span>Filter by Date Range</span>
                  </div>
                  {(dateFrom || dateTo) && (
                    <button
                      type="button"
                      onClick={handleClearDateRange}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Quick Presets
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('ALL')}
                      className={`px-2 py-1 rounded text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                        datePreset === 'ALL' && !dateFrom && !dateTo
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      All Time
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('TODAY')}
                      className={`px-2 py-1 rounded text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                        datePreset === 'TODAY'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('7_DAYS')}
                      className={`px-2 py-1 rounded text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                        datePreset === '7_DAYS'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Past 7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('30_DAYS')}
                      className={`px-2 py-1 rounded text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                        datePreset === '30_DAYS'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Past 30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('THIS_MONTH')}
                      className={`px-2 py-1 rounded text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                        datePreset === 'THIS_MONTH'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      This Month
                    </button>
                  </div>
                </div>

                {/* Specific Custom Date Inputs */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Custom Date Range
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label htmlFor="filter-date-from" className="block text-[11px] text-slate-600 font-medium mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        id="filter-date-from"
                        value={dateFrom}
                        onChange={(e) => handleDateFromChange(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label htmlFor="filter-date-to" className="block text-[11px] text-slate-600 font-medium mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        id="filter-date-to"
                        value={dateTo}
                        onChange={(e) => handleDateToChange(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Popover Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {dateFrom && dateTo ? 'Date filter active' : 'Filter by request submission date'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDatePopoverOpen(false)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Row 2: Secondary Filters (Status, Priority)                   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1 border-t border-slate-100">
        {/* Status Filter */}
        <div className="lg:col-span-6">
          <select
            id="filter-queue-status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 h-9 cursor-pointer transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">All Pending / Action Needed</option>
            <option value="SUBMITTED">Submitted (New)</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="NEEDS_INFORMATION">Needs Information</option>
            <option value="FOR_APPROVAL">For Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY_FOR_RELEASE">Ready for Release</option>
            <option value="RELEASED">Released / Claimed</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="lg:col-span-6">
          <select
            id="filter-queue-priority"
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 h-9 cursor-pointer transition-colors"
          >
            <option value="ALL">All Priorities</option>
            <option value="NORMAL">Normal Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="URGENT">Urgent Priority</option>
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Row 3: Active Filter Feedback Chips & Quick Reset             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-600">
            Found <strong className="text-slate-900 font-bold">{totalFilteredCount}</strong> of{' '}
            <strong className="text-slate-900 font-semibold">{totalRequestsCount}</strong> requests
          </span>

          {/* Active Search Term Chip */}
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
              {searchTarget === 'STUDENT_NAME' ? (
                <>
                  <User className="w-3 h-3 text-blue-600" />
                  <span>Student: &ldquo;{searchTerm}&rdquo;</span>
                </>
              ) : (
                <>
                  <Search className="w-3 h-3 text-blue-600" />
                  <span>Search: &ldquo;{searchTerm}&rdquo;</span>
                </>
              )}
              <button
                type="button"
                onClick={() => onSearchTermChange('')}
                className="hover:text-blue-900 ml-0.5 cursor-pointer"
                title="Clear search term"
              >
                <X className="w-3 h-3 inline" />
              </button>
            </span>
          )}

          {/* Active Document Type Chip */}
          {docTypeFilter !== 'ALL' && selectedDocTypeObj && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-medium">
              <FileText className="w-3 h-3 text-slate-600" />
              <span>Doc: {selectedDocTypeObj.name}</span>
              <button
                type="button"
                onClick={() => onDocTypeFilterChange('ALL')}
                className="hover:text-slate-950 ml-0.5 cursor-pointer"
                title="Clear document type filter"
              >
                <X className="w-3 h-3 inline" />
              </button>
            </span>
          )}

          {/* Active Date Range Chip */}
          {(dateFrom || dateTo) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
              <Calendar className="w-3 h-3 text-emerald-600" />
              <span>{getDateRangeLabel()}</span>
              <button
                type="button"
                onClick={handleClearDateRange}
                className="hover:text-emerald-950 ml-0.5 cursor-pointer"
                title="Clear date range filter"
              >
                <X className="w-3 h-3 inline" />
              </button>
            </span>
          )}

          {/* Active Status Chip */}
          {statusFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-medium">
              <span>Status: {statusFilter.replace(/_/g, ' ')}</span>
              <button
                type="button"
                onClick={() => onStatusFilterChange('ALL')}
                className="hover:text-slate-950 ml-0.5 cursor-pointer"
                title="Clear status filter"
              >
                <X className="w-3 h-3 inline" />
              </button>
            </span>
          )}

          {/* Active Priority Chip */}
          {priorityFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium">
              <span>Priority: {priorityFilter}</span>
              <button
                type="button"
                onClick={() => onPriorityFilterChange('ALL')}
                className="hover:text-amber-950 ml-0.5 cursor-pointer"
                title="Clear priority filter"
              >
                <X className="w-3 h-3 inline" />
              </button>
            </span>
          )}

          {/* Overdue SLA Toggle Button */}
          {overdueCount > 0 && (
            <button
              type="button"
              id="toggle-overdue-sla-btn"
              onClick={onToggleOverdue}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border shadow-2xs ${
                overdueOnly
                  ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-400 font-extrabold'
                  : 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
              }`}
              title="Filter to requests that have been in pending status for longer than 3 business days"
            >
              <AlertTriangle className="w-3 h-3 text-amber-800 shrink-0" />
              <span>
                {overdueOnly
                  ? `Showing ${overdueCount} Overdue SLA Only`
                  : `${overdueCount} Pending > 3 Days`}
              </span>
              {overdueOnly && <X className="w-3 h-3 ml-0.5" />}
            </button>
          )}
        </div>

        {/* Reset All Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            id="reset-all-filters-btn"
            onClick={onResetAllFilters}
            className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 hover:underline font-semibold cursor-pointer text-xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset all filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
