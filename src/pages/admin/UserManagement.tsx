import React, { useState, useEffect, useMemo } from 'react';
import { authService } from '../../services/authService';
import { UserProfile, UserRole } from '../../types';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { TableSkeleton } from '../../components/Skeletons';
import { EmptyState } from '../../components/EmptyState';
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  RefreshCw,
  Edit2,
  X,
  ShieldAlert,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { format } from 'date-fns';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Edit user modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [selectedStatus, setSelectedStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleOpenEdit = (u: UserProfile) => {
    setEditingUser(u);
    setSelectedRole(u.role);
    setSelectedStatus(u.status);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);

    try {
      await authService.updateUserRoleAndStatus(editingUser.id, selectedRole, selectedStatus);
      setEditingUser(null);
      await loadUsers();
    } catch (err: any) {
      console.error('Update user error:', err);
      alert(err.message || 'Failed to update user record.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        u.full_name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        (u.student_profile?.student_id && u.student_profile.student_id.toLowerCase().includes(term)) ||
        (u.staff_profile?.employee_id && u.staff_profile.employee_id.toLowerCase().includes(term));

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header with Breadcrumbs */}
      <PageHeader
        title="User Accounts & Role Permissions"
        subtitle="Audit user accounts, grant registrar staff or admin privileges, and manage security statuses."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users & Permissions' },
        ]}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        }
      />

      {/* 2. Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="search-users-input"
            placeholder="Search by name, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors h-9"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="filter-role-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium text-slate-700 h-9 w-full sm:w-auto cursor-pointer transition-colors"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="STAFF">Registrar Staff</option>
            <option value="ADMIN">System Admins</option>
          </select>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={6} columns={6} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Users Found"
              description="No user records match your current search and role filters."
              actionLabel="Clear Search"
              onAction={() => {
                setSearchTerm('');
                setRoleFilter('ALL');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Full Legal Name</th>
                  <th className="py-3 px-4 text-center">System Role</th>
                  <th className="py-3 px-4">Institutional ID</th>
                  <th className="py-3 px-4">Department / Program</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 text-xs">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-900">{row.full_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{row.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          row.role === 'ADMIN'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : row.role === 'STAFF'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {row.role === 'ADMIN' && <ShieldAlert className="w-3 h-3 text-indigo-600" />}
                        {row.role === 'STAFF' && <Briefcase className="w-3 h-3 text-blue-600" />}
                        {row.role === 'STUDENT' && <GraduationCap className="w-3 h-3 text-emerald-600" />}
                        {row.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 text-xs">
                      {row.role === 'STUDENT'
                        ? row.student_profile?.student_id || 'N/A'
                        : row.staff_profile?.employee_id || 'Staff'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {row.role === 'STUDENT'
                        ? `${row.student_profile?.program || 'Student'} (${row.student_profile?.year_level || ''})`
                        : `${row.staff_profile?.department || 'Registrar'} - ${row.staff_profile?.designation || 'Staff'}`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          row.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {row.created_at ? format(new Date(row.created_at), 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Edit2}
                        onClick={() => handleOpenEdit(row)}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          title={`Manage Account: ${editingUser.full_name}`}
          subtitle={`Email: ${editingUser.email}`}
        >
          <form onSubmit={handleSaveUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Account Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 bg-white font-bold cursor-pointer"
              >
                <option value="STUDENT">STUDENT (Student records portal & request tracker)</option>
                <option value="STAFF">STAFF (Processing queue, review, approval & notes)</option>
                <option value="ADMIN">ADMIN (Full administrative access & system settings)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Account Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 bg-white font-bold cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE (Authorized to log in)</option>
                <option value="INACTIVE">INACTIVE (Account locked)</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
              <p>
                <strong>User ID:</strong> <span className="font-mono">{editingUser.id}</span>
              </p>
              <p className="mt-1">
                <strong>Profile Context:</strong>{' '}
                {editingUser.role === 'STUDENT'
                  ? `Student ID ${editingUser.student_profile?.student_id || 'N/A'}`
                  : `Employee ID ${editingUser.staff_profile?.employee_id || 'N/A'}`}
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={saving}
              >
                Update Permissions
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
