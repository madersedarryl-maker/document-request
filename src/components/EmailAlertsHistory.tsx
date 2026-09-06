import React, { useState, useEffect } from 'react';
import { EmailNotificationLog, RequestStatus } from '../types';
import { emailService } from '../services/emailService';
import {
  Mail,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Zap,
  ShieldCheck,
  Send,
  AlertCircle,
  X,
  Radio,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface EmailAlertsHistoryProps {
  requestId: string;
  requestNumber?: string;
  recipientEmail?: string;
  isStaff?: boolean;
  onSendCustomNotification?: () => void;
}

export const EmailAlertsHistory: React.FC<EmailAlertsHistoryProps> = ({
  requestId,
  requestNumber,
  recipientEmail,
  isStaff = false,
  onSendCustomNotification,
}) => {
  const [logs, setLogs] = useState<EmailNotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<EmailNotificationLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const items = await emailService.getEmailLogsForRequest(requestId);
      setLogs(items);
    } catch (err) {
      console.warn('Error fetching email alerts logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchLogs();
    }
  }, [requestId]);

  // Listen for custom event if new email is dispatched in same tab
  useEffect(() => {
    const handleSent = (e: any) => {
      const detail = e.detail;
      if (detail && Array.isArray(detail.logs)) {
        const matching = detail.logs.filter((l: EmailNotificationLog) => l.request_id === requestId);
        if (matching.length > 0) {
          fetchLogs();
        }
      }
    };
    window.addEventListener('ibacmi:bulk_emails_sent', handleSent);
    return () => window.removeEventListener('ibacmi:bulk_emails_sent', handleSent);
  }, [requestId]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-700" />
            Automated Email Alerts
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              Supabase Edge Functions
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Real-time notifications dispatched to{' '}
            <strong className="text-slate-700 font-mono">
              {recipientEmail || 'student registered email'}
            </strong>{' '}
            upon every status transition.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1 font-semibold"
            title="Refresh Email Delivery Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {isStaff && onSendCustomNotification && (
            <button
              type="button"
              onClick={onSendCustomNotification}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Status Email</span>
            </button>
          )}
        </div>
      </div>

      {/* Edge Function Pipeline Status Banner */}
      <div className="px-4 py-2.5 bg-sky-50/70 border-b border-sky-100 text-xs flex items-center justify-between gap-2 text-sky-900">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <strong>Edge Function Active:</strong>{' '}
            <code className="text-[11px] font-mono bg-sky-100/70 px-1.5 py-0.5 rounded text-sky-950">
              send-status-email
            </code>{' '}
            triggers automatically on database updates & intake.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Authenticated Gateway</span>
        </div>
      </div>

      {/* Email Notification Logs List */}
      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span>Checking Supabase email delivery records...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
            <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No Email Alerts Dispatched Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              When this request’s status is updated (e.g. Under Review, Approved, Ready for Claiming),
              an automated email alert will be transmitted immediately via Supabase Edge Functions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const formattedDate = new Date(log.sent_at).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <div
                  key={log.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={log.status} size="sm" />
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Delivered
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.delivery_provider || 'supabase_edge_function'}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 truncate">
                      {log.subject}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formattedDate}
                      </span>
                      <span>•</span>
                      <span>To: {log.recipient_email}</span>
                      {log.provider_message_id && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-slate-400 truncate max-w-[160px]">
                            ID: {log.provider_message_id}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Email</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Email Preview Modal Dialog */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Email Notification Preview</h4>
                  <p className="text-xs text-slate-500">
                    Dispatched via Supabase Edge Function: <code className="font-mono">{selectedLog.delivery_provider || 'send-status-email'}</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Metadata */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-200 text-xs space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">To:</span>
                  <span className="font-bold text-slate-900">{selectedLog.recipient_name} &lt;{selectedLog.recipient_email}&gt;</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Sent Timestamp:</span>
                  <span className="text-slate-800 font-medium">
                    {new Date(selectedLog.sent_at).toLocaleString('en-US', {
                      dateStyle: 'full',
                      timeStyle: 'medium',
                    })}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Subject Line:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedLog.subject}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <StatusBadge status={selectedLog.status} size="sm" />
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                  Status: Delivered
                </span>
                {selectedLog.provider_message_id && (
                  <span className="font-mono text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                    MsgID: {selectedLog.provider_message_id}
                  </span>
                )}
              </div>
            </div>

            {/* Email Body */}
            <div className="p-5 overflow-y-auto flex-1 text-xs">
              {selectedLog.body_html ? (
                <div
                  className="rounded-lg border border-slate-200 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: selectedLog.body_html }}
                />
              ) : (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800">
                  {selectedLog.body_text}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Registrar Email Record
              </span>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
