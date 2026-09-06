import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import { SystemSettings } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { SystemSettingsSkeleton } from '../../components/Skeletons';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import {
  Settings,
  Building2,
  Phone,
  Mail,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Info,
  Zap,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { emailService } from '../../services/emailService';

export const SystemSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    school_name: 'IBA College of Mindanao',
    school_code: 'ICM-VALENCIA',
    office_name: 'Office of the College Registrar',
    office_address: 'Registrar Hall, Ground Floor, Main Campus, Valencia City, Bukidnon',
    contact_number: '(088) 828-2000',
    email: 'registrar@ibacollege.edu.ph',
    office_hours: 'Monday - Friday, 8:00 AM - 5:00 PM',
    release_instructions: 'Present your valid Student ID or official Authorization Letter upon claiming at Window 2.',
    default_processing_time_days: 3,
    max_upload_size_mb: 10,
    allowed_file_types: 'image/jpeg,image/png,application/pdf',
  });

  // Edge Function Testing State
  const [testEmail, setTestEmail] = useState('');
  const [testingEdge, setTestingEdge] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    provider: string;
    messageId: string;
    message: string;
  } | null>(null);

  const handleTestEdgeNotification = async (e: React.MouseEvent) => {
    e.preventDefault();
    const targetEmail = testEmail.trim() || user?.email || 'student.registrar.test@ibacmi.edu.ph';
    setTestingEdge(true);
    setTestResult(null);
    try {
      const res = await emailService.testEdgeFunction(targetEmail, 'READY_FOR_RELEASE');
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        provider: 'failed',
        messageId: 'N/A',
        message: err.message || 'Edge function test failed.',
      });
    } finally {
      setTestingEdge(false);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
      setFormData({
        school_name: data.school_name || 'IBA College of Mindanao',
        school_code: data.school_code || 'ICM-VALENCIA',
        office_name: data.office_name || 'Office of the College Registrar',
        office_address: data.office_address || 'Registrar Hall, Valencia City, Bukidnon',
        contact_number: data.contact_number || '(088) 828-2000',
        email: data.email || 'registrar@ibacollege.edu.ph',
        office_hours: data.office_hours || 'Monday - Friday, 8:00 AM - 5:00 PM',
        release_instructions:
          data.release_instructions ||
          'Present your valid Student ID or official Authorization Letter upon claiming at Window 2.',
        default_processing_time_days: data.default_processing_time_days || 3,
        max_upload_size_mb: data.max_upload_size_mb || 10,
        allowed_file_types: data.allowed_file_types || 'image/jpeg,image/png,application/pdf',
      });
    } catch (err: any) {
      console.error('Error fetching system settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await settingsService.updateSettings(formData, user?.id);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadSettings();
    } catch (err: any) {
      console.error('Update settings error:', err);
      setError(err.message || 'Failed to save system settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SystemSettingsSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="System Configuration & Institutional Settings"
        subtitle="Configure institution branding, registrar office info, claiming guidelines, and storage constraints."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'System Configuration' },
        ]}
      />

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Institutional configuration and operational settings updated successfully.</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-2xs space-y-6"
      >
        {/* University & Office Identity */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-blue-700" />
            Institutional Identity & Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                College / Institution Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.school_name}
                onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Institutional Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.school_code}
                onChange={(e) => setFormData({ ...formData, school_code: e.target.value })}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Office Department Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.office_name}
                onChange={(e) => setFormData({ ...formData, office_name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Physical Office Address / Hall <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.office_address}
                onChange={(e) => setFormData({ ...formData, office_address: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Contact & Hours */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Phone className="w-4 h-4 text-blue-700" />
            Contact & Operations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Registrar Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Telephone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Office Hours <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.office_hours}
                onChange={(e) => setFormData({ ...formData, office_hours: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Document Release & Claiming Instructions (Student-Facing) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formData.release_instructions}
              onChange={(e) => setFormData({ ...formData, release_instructions: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Upload Constraints */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <HardDrive className="w-4 h-4 text-blue-700" />
            File Storage & Attachment Constraints
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Max Upload Size Per File (MB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={formData.max_upload_size_mb}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_upload_size_mb: parseInt(e.target.value) || 10,
                  })
                }
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Allowed Attachment MIME Types <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.allowed_file_types}
                onChange={(e) => setFormData({ ...formData, allowed_file_types: e.target.value })}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Supabase Edge Function Automated Email Pipeline */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-700" />
              Automated Email Notification System (Supabase Edge Functions)
            </h2>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Function Active: send-status-email
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">
              When a document request changes status (e.g. Approved, Processing, Ready for Release, Rejected),
              the system automatically invokes the Supabase Edge Function{' '}
              <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">
                /supabase/functions/send-status-email
              </code>{' '}
              to transmit institutional email alerts and persist delivery logs in the database.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-800 block mb-1">Supported Dispatch Providers:</span>
                <ul className="text-slate-600 space-y-0.5 list-disc pl-4">
                  <li>Resend API (<code className="font-mono text-[10px]">RESEND_API_KEY</code>)</li>
                  <li>SendGrid API (<code className="font-mono text-[10px]">SENDGRID_API_KEY</code>)</li>
                  <li>Custom Webhook (<code className="font-mono text-[10px]">NOTIFICATION_WEBHOOK_URL</code>)</li>
                  <li>High-performance Deno Sandbox (Local / Integrated)</li>
                </ul>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-800 block mb-1">Trigger Mechanisms:</span>
                <ul className="text-slate-600 space-y-0.5 list-disc pl-4">
                  <li>Supabase Database Webhooks on <code className="font-mono text-[10px]">public.requests</code></li>
                  <li>PostgreSQL <code className="font-mono text-[10px]">pg_net</code> async triggers</li>
                  <li>Direct authenticated HTTP invokes from Registrar staff UI</li>
                </ul>
              </div>
            </div>

            {/* Test Invocation Strip */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Enter test recipient email address..."
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Send}
                loading={testingEdge}
                onClick={handleTestEdgeNotification}
              >
                Send Test Edge Notification
              </Button>
            </div>

            {/* Diagnostic Result */}
            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{testResult.message}</p>
                  <p className="text-[11px] font-mono mt-0.5 opacity-90">
                    Provider: {testResult.provider} &bull; Message ID: {testResult.messageId}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <Button
            type="submit"
            id="save-system-settings-btn"
            variant="primary"
            size="md"
            icon={Save}
            loading={saving}
          >
            Save Institutional Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
