import React, { useState, useEffect, useMemo } from 'react';
import { auditService } from '../../services/auditService';
import { AuditLog } from '../../types';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { TableSkeleton } from '../../components/Skeletons';
import { EmptyState } from '../../components/EmptyState';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  User,
  X,
  Code2,
} from 'lucide-react';
import { format } from 'date-fns';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = async () => {
    try {
      const data = await auditService.getAuditLogs(100);
      setLogs(data);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        log.action?.toLowerCase().includes(term) ||
        log.entity_type?.toLowerCase().includes(term) ||
        (log.entity_id && log.entity_id.toLowerCase().includes(term)) ||
        (log.user?.full_name && log.user.full_name.toLowerCase().includes(term));

      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [logs, searchTerm, actionFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Security & Operational Audit Trail"
        subtitle="Immutable log of all user logins, document requests, workflow state transitions, and administrative actions."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Audit Trail' },
        ]}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={handleRefresh}
          >
            Refresh Logs
          </Button>
        }
      />

      {/* 2. Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="search-audit-input"
            placeholder="Search action, user, or entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all h-9"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="filter-action-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium text-slate-700 h-9 w-full sm:w-auto cursor-pointer"
          >
            <option value="ALL">All Actions</option>
            <option value="REQUEST_CREATED">REQUEST_CREATED</option>
            <option value="STATUS_CHANGED">STATUS_CHANGED</option>
            <option value="PRIORITY_CHANGED">PRIORITY_CHANGED</option>
            <option value="PAYMENT_STATUS_CHANGED">PAYMENT_STATUS_CHANGED</option>
            <option value="DOCUMENT_TYPE_CREATED">DOCUMENT_TYPE_CREATED</option>
            <option value="DOCUMENT_TYPE_UPDATED">DOCUMENT_TYPE_UPDATED</option>
            <option value="INTERNAL_NOTE_ADDED">INTERNAL_NOTE_ADDED</option>
            <option value="USER_ROLE_UPDATED">USER_ROLE_UPDATED</option>
            <option value="SETTINGS_UPDATED">SETTINGS_UPDATED</option>
          </select>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={8} columns={5} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Audit Logs Found"
              description="There are no security audit log entries matching your current search or filter criteria."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchTerm('');
                setActionFilter('ALL');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Action Taken</th>
                  <th className="py-3 px-4">Entity / Target</th>
                  <th className="py-3 px-4 text-right">Audit Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 text-xs">
                {filtered.map((row) => {
                  const isReject = row.action.includes('REJECT');
                  const isSuccess =
                    row.action.includes('APPROVE') || row.action.includes('RELEASE');
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {row.created_at
                          ? format(new Date(row.created_at), 'yyyy-MM-dd HH:mm:ss')
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {row.user?.full_name || 'System / Service'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {row.user?.email || row.user_id || 'system'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${
                            isReject
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isSuccess
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {row.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                        <span className="font-medium">{row.entity_type}</span>{' '}
                        {row.entity_id && (
                          <span className="text-slate-400">
                            ({row.entity_id.slice(0, 8)}...)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(row)}
                          className="px-2 py-1 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View JSON
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. JSON Payload Inspection Modal */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title={`Audit Event: ${selectedLog.action}`}
          subtitle={`Entity: ${selectedLog.entity_type} (ID: ${selectedLog.entity_id || 'N/A'})`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span>
                Timestamp:{' '}
                <strong className="font-mono text-slate-700">
                  {selectedLog.created_at}
                </strong>
              </span>
              <span>
                Actor:{' '}
                <strong className="text-slate-700">
                  {selectedLog.user?.full_name || selectedLog.user_id || 'System'}
                </strong>
              </span>
            </div>

            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800 shadow-inner">
              <code>{JSON.stringify(selectedLog.details, null, 2)}</code>
            </pre>
          </div>
        </Modal>
      )}
    </div>
  );
};
