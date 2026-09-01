import React from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyAction?: React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  emptyTitle = 'No records found',
  emptySubtitle = 'There are no items matching your criteria.',
  emptyAction,
  pagination,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/90 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {loading ? (
              Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((col, cIdx) => {
                    const isCodeCol = cIdx === 0;
                    const isActionCol = cIdx === columns.length - 1;
                    const isBadgeCol = (col.header || '').toLowerCase().includes('status') || (col.header || '').toLowerCase().includes('priority') || (col.header || '').toLowerCase().includes('payment');
                    const isDateCol = (col.header || '').toLowerCase().includes('date') || (col.header || '').toLowerCase().includes('time');

                    return (
                      <td key={cIdx} className={`px-4 py-3.5 ${col.className || ''}`}>
                        {isCodeCol ? (
                          <div className="h-4 bg-amber-100/70 rounded-md w-24" />
                        ) : isActionCol ? (
                          <div className="h-6 bg-slate-200 rounded-lg w-20 ml-auto" />
                        ) : isBadgeCol ? (
                          <div className="h-5 bg-slate-200/90 rounded-full w-20" />
                        ) : isDateCol ? (
                          <div className="h-3.5 bg-slate-200 rounded w-20" />
                        ) : (
                          <div className="space-y-1.5">
                            <div className="h-3.5 bg-slate-300/80 rounded w-36" />
                            <div className="h-2.5 bg-slate-200 rounded w-24" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">{emptyTitle}</p>
                    <p className="text-xs text-slate-500 max-w-sm">{emptySubtitle}</p>
                    {emptyAction && <div className="pt-2">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-amber-50/40' : 'hover:bg-slate-50/70'
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 py-3.5 text-slate-800 ${col.className || ''}`}>
                      {col.cell
                        ? col.cell(row)
                        : typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : col.accessor
                        ? (row[col.accessor] as any)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-bold text-slate-800">
              {Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.totalRecords)}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)}
            </span>{' '}
            of <span className="font-bold text-slate-800">{pagination.totalRecords}</span> entries
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="px-2.5 py-1 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg">
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
