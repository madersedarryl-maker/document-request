import React, { useState } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { User, GraduationCap, Building2, Phone, Mail, Shield, CheckCircle2 } from 'lucide-react';

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user, profile, studentProfile, staffProfile, role, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || studentProfile?.contact_number || '');
  const [program, setProgram] = useState(studentProfile?.program || '');
  const [yearLevel, setYearLevel] = useState(studentProfile?.year_level || '');
  const [emergencyContact, setEmergencyContact] = useState(studentProfile?.emergency_contact || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await authService.updateProfile(
        user.id,
        { full_name: fullName, phone },
        role === 'STUDENT'
          ? {
              program,
              year_level: yearLevel,
              contact_number: phone,
              emergency_contact: emergencyContact,
            }
          : undefined
      );
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Account Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role & Email Badge */}
        <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80 text-xs">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 font-bold">
              {role === 'STUDENT' ? <GraduationCap className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-bold text-zinc-900">{profile?.email}</p>
              <p className="text-[11px] text-zinc-500 font-mono">
                {role === 'STUDENT' ? `Student ID: ${studentProfile?.student_id || 'N/A'}` : `Employee ID: ${staffProfile?.employee_id || 'N/A'}`}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600 text-white uppercase tracking-wider">
            {role}
          </span>
        </div>

        {error && (
          <div className="p-2.5 text-xs text-rose-700 bg-rose-50 rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        {success && (
          <div className="p-2.5 text-xs text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Contact / Mobile Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {role === 'STUDENT' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                    Degree / Program
                  </label>
                  <input
                    type="text"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    placeholder="e.g. BS Computer Science"
                    className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                    Year Level
                  </label>
                  <input
                    type="text"
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    placeholder="e.g. 3rd Year"
                    className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Emergency Contact / Guardian
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Guardian Name & Phone"
                  className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {role !== 'STUDENT' && staffProfile && (
            <div className="p-3 bg-zinc-50 rounded-lg text-xs space-y-1 text-zinc-600 border border-zinc-200">
              <p><strong>Department:</strong> {staffProfile.department}</p>
              <p><strong>Designation:</strong> {staffProfile.designation}</p>
              <p><strong>Approval Authority:</strong> {staffProfile.can_approve ? 'Enabled' : 'Disabled'}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
