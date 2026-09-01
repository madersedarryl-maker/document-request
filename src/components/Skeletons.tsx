import React from 'react';

/**
 * Base Shimmer Skeleton component with pulse animation
 */
export const Skeleton: React.FC<{
  className?: string;
  id?: string;
}> = ({ className = 'h-4 bg-slate-200 rounded', id }) => {
  return <div id={id} className={`animate-pulse bg-slate-200/90 ${className}`} />;
};

/**
 * KPI Stat Cards Skeleton for Dashboard (Student, Staff, Admin)
 */
export const DashboardStatsSkeleton: React.FC<{
  count?: number;
  cols?: string;
}> = ({ count = 6, cols = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' }) => {
  return (
    <div className={`grid ${cols} gap-3.5`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-7 w-12 rounded-md" />
          <Skeleton className="h-2.5 w-24 rounded" />
        </div>
      ))}
    </div>
  );
};

/**
 * Table Loading Skeleton with realistic multi-column shapes
 */
export const TableSkeleton: React.FC<{
  rows?: number;
  columnsCount?: number;
}> = ({ rows = 5 }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
      {/* Table Header Skeleton */}
      <div className="bg-slate-50/90 px-4 py-3.5 border-b border-slate-200 flex items-center justify-between">
        <div className="grid grid-cols-6 gap-4 w-full">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-28 rounded col-span-2" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-16 rounded justify-self-end" />
        </div>
      </div>

      {/* Rows Skeleton */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="px-4 py-3.5 flex items-center justify-between gap-4 animate-pulse"
          >
            {/* Col 1: Code / Request # */}
            <div className="w-28 shrink-0">
              <Skeleton className="h-4 w-24 rounded bg-amber-100/60" />
            </div>

            {/* Col 2: Title & Subtitle */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <Skeleton className="h-3.5 w-48 rounded bg-slate-300/80" />
              <Skeleton className="h-2.5 w-32 rounded bg-slate-200" />
            </div>

            {/* Col 3: Metadata / Date */}
            <div className="hidden sm:block w-24">
              <Skeleton className="h-3 w-20 rounded" />
            </div>

            {/* Col 4: Status Badge Pill */}
            <div className="w-24">
              <Skeleton className="h-5 w-20 rounded-full bg-slate-200/90" />
            </div>

            {/* Col 5: Action Button */}
            <div className="w-24 text-right flex justify-end">
              <Skeleton className="h-6 w-16 rounded-lg bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Full Requests Page Skeleton (Header + Search/Filters Bar + Table)
 */
export const RequestsPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 rounded-lg bg-slate-300" />
          <Skeleton className="h-3 w-80 rounded" />
        </div>
        <Skeleton className="h-9 w-44 rounded-xl bg-slate-300 shrink-0" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <Skeleton className="h-9 w-full sm:w-80 rounded-xl" />
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-36 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={7} />
    </div>
  );
};

/**
 * Executive Reports & Analytics Skeleton Screen
 */
export const ReportsAnalyticsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-7 w-7 rounded-xl bg-slate-200" />
            </div>
            <Skeleton className="h-9 w-20 rounded-md bg-slate-300" />
            <Skeleton className="h-2.5 w-36 rounded" />
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-col chart card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48 rounded bg-slate-300" />
              <Skeleton className="h-3 w-64 rounded" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Bar Chart Skeletons */}
          <div className="space-y-4 pt-2">
            {Array.from({ length: 5 }).map((_, bIdx) => (
              <div key={bIdx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <Skeleton className="h-3.5 w-40 rounded" />
                  <Skeleton className="h-3.5 w-12 rounded" />
                </div>
                <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-200 rounded-full animate-pulse"
                    style={{ width: `${85 - bIdx * 15}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1-col status breakdown card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36 rounded bg-slate-300" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>

          <div className="space-y-3 pt-2">
            {Array.from({ length: 6 }).map((_, sIdx) => (
              <div
                key={sIdx}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50"
              >
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-2.5 h-2.5 rounded-full" />
                  <Skeleton className="h-3.5 w-24 rounded" />
                </div>
                <Skeleton className="h-4 w-8 rounded font-mono font-bold" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Document Catalog Grid Skeleton
 */
export const DocumentCatalogSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-14 rounded bg-amber-100/60" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <Skeleton className="h-5 w-14 rounded font-black" />
            </div>

            <div className="space-y-1.5">
              <Skeleton className="h-4 w-4/5 rounded bg-slate-300" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-3/4 rounded" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Detailed Request View Skeleton Screen
 */
export const RequestDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36 rounded" />
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>

      {/* Main Request Header Card */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-28 rounded-md bg-amber-100/70" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
            <Skeleton className="h-7 w-64 rounded-lg bg-slate-300" />
          </div>
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>

        {/* 4-col Spec Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
              <Skeleton className="h-2.5 w-16 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Stepper Timeline & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-col timeline & requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stepper Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <Skeleton className="h-4 w-40 rounded bg-slate-300" />
            <div className="grid grid-cols-5 gap-2 pt-2">
              {Array.from({ length: 5 }).map((_, sIdx) => (
                <div key={sIdx} className="flex flex-col items-center space-y-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-2.5 w-12 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Activity / Audit History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <Skeleton className="h-4 w-36 rounded bg-slate-300" />
            <div className="space-y-4 pt-2">
              {Array.from({ length: 3 }).map((_, aIdx) => (
                <div key={aIdx} className="flex items-start space-x-3">
                  <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-48 rounded" />
                    <Skeleton className="h-2.5 w-32 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1-col instructions & contact */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <Skeleton className="h-4 w-32 rounded bg-slate-300" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-5/6 rounded" />
            <Skeleton className="h-3 w-4/6 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * System Settings Configuration Skeleton Screen
 */
export const SystemSettingsSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64 rounded-lg bg-slate-300" />
        <Skeleton className="h-3 w-96 rounded" />
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-36 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-36 rounded" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>

        <div className="pt-4 flex justify-end">
          <Skeleton className="h-10 w-36 rounded-xl bg-slate-300" />
        </div>
      </div>
    </div>
  );
};
