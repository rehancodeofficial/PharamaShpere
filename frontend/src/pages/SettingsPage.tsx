import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Settings, ShieldCheck, Mail, Loader2, CheckCircle, XCircle, Plus,  AlertCircle,  Key
} from 'lucide-react';
import { apiFetch } from '../lib/api';

export const SettingsPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Invite modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('pharmacist');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/users');
      // res is the array directly from users.controller.ts findAllByTenant if they return raw array, let's assume it has .data or is an array
      setUsers(Array.isArray(res) ? res : res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load team members.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/users/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          first_name: inviteFirstName,
          last_name: inviteLastName,
          // Since cognito is bypassed in offline mode, we send a dummy password to satisfy the DB if needed or let the service handle it
          password: 'Password123!', 
        }),
      });
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteFirstName('');
      setInviteLastName('');
      setInviteRole('pharmacist');
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to invite user.');
    }
  };

  const toggleStatus = async (user: any) => {
    try {
      await apiFetch(`/users/${user.id}/status`, {
        method: 'POST',
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const updateRole = async (user: any, newRole: string) => {
    try {
      await apiFetch(`/users/${user.id}/role`, {
        method: 'POST',
        body: JSON.stringify({ role: newRole }),
      });
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update role.');
    }
  };

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-950">Settings & Team</h1>
          <p className="text-sm font-medium text-gray-500">Manage pharmacy preferences and team access</p>
        </div>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-brand-950 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-900"
        >
          <Plus className="h-4 w-4" /> Add Team Member
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left Column: Config */}
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="rounded-2xl bg-brand-50 p-2.5">
                <Settings className="h-5 w-5 text-brand-700" />
              </div>
              <h2 className="text-base font-extrabold text-brand-950">System Configuration</h2>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Pharmacy Name</label>
                <input
                  type="text"
                  disabled
                  value="PharmaSphere Main Branch"
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Currency Code</label>
                <input
                  type="text"
                  disabled
                  value="PKR"
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500 outline-none"
                />
              </div>
              <p className="text-xs font-medium text-gray-400 mt-2">* Global settings can only be updated by the system administrator.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="rounded-2xl bg-green-50 p-2.5">
                <ShieldCheck className="h-5 w-5 text-green-700" />
              </div>
              <h2 className="text-base font-extrabold text-brand-950">Security & Roles</h2>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { r: 'Super Admin', desc: 'Full access to all settings and records.' },
                { r: 'Pharmacy Owner', desc: 'Manage inventory, team, and view reports.' },
                { r: 'Pharmacist', desc: 'Manage prescriptions and inventory stock.' },
                { r: 'Cashier', desc: 'Process POS sales transactions only.' },
              ].map(({ r, desc }) => (
                <div key={r} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-sm font-bold text-brand-950">{r}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Team Management */}
        <div className="xl:col-span-2 rounded-3xl border border-gray-200 bg-white shadow-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-gray-100 p-6">
            <div className="rounded-2xl bg-brand-50 p-2.5">
              <Users className="h-5 w-5 text-brand-700" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-brand-950">Team Members</h2>
              <p className="text-xs font-medium text-gray-400">Manage access and permissions for your staff</p>
            </div>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    {['User', 'Role', 'Status', 'Last Active', 'Actions'].map((col) => (
                      <th key={col} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="transition hover:bg-brand-50/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-950 text-xs font-bold text-white">
                            {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-brand-950">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateRole(user, e.target.value)}
                          className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-bold text-gray-700 outline-none"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="pharmacy_owner">Owner</option>
                          <option value="pharmacist">Pharmacist</option>
                          <option value="cashier">Cashier</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleStatus(user)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition ${
                            user.is_active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {user.is_active ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {user.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-gray-500">
                        {new Date(user.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="text-gray-400 hover:text-brand-700" title="Reset Password (Not available in offline mode)">
                          <Key className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-400">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[480px] rounded-[2.5rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-950">Add Team Member</h2>
              <button onClick={() => setIsInviteOpen(false)} className="rounded-xl p-1 hover:bg-gray-100">
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">First Name</label>
                  <input
                    type="text"
                    required
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Last Name</label>
                  <input
                    type="text"
                    required
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-brand-400"
                >
                  <option value="pharmacist">Pharmacist</option>
                  <option value="cashier">Cashier</option>
                  <option value="pharmacy_owner">Pharmacy Owner</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsInviteOpen(false)} className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="rounded-2xl bg-brand-950 px-6 py-3 text-sm font-bold text-white hover:bg-brand-900">Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
