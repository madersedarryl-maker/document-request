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
} from 'lucide-react';

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
