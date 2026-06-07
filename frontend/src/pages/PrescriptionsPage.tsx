import React, { useEffect, useState, useCallback } from 'react';
import {
  Loader2, Search, CheckCircle, XCircle, Clock, Eye, X, AlertCircle, FileText, Plus, 
} from 'lucide-react';
import { apiFetch } from '../lib/api';

const STATUS_MAP = {
  PENDING: { label: 'Pending Verification', icon: Clock, style: 'bg-amber-50 text-amber-700 border border-amber-200' },
  VERIFIED: { label: 'Verified', icon: CheckCircle, style: 'bg-green-50 text-green-700 border border-green-200' },
  REJECTED: { label: 'Rejected', icon: XCircle, style: 'bg-red-50 text-red-600 border border-red-200' },
};

export const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  // New prescription form
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerPhone, setFormCustomerPhone] = useState('');
  const [formDoctorName, setFormDoctorName] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const loadPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statusParam = statusFilter ? `&status=${statusFilter}` : '';
      const searchParam = search ? `&search=${search}` : '';
      const res = await apiFetch(`/prescriptions?limit=100${statusParam}${searchParam}`);
      setPrescriptions(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load prescriptions.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadPrescriptions();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await apiFetch(`/prescriptions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes: newNotes }),
      });
      setSelected(null);
      setNewNotes('');
      loadPrescriptions();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: formCustomerName,
          customer_phone: formCustomerPhone,
          doctor_name: formDoctorName,
          file_url: formFileUrl,
          notes: formNotes,
        }),
      });
      setIsAddOpen(false);
      setFormCustomerName('');
      setFormCustomerPhone('');
      setFormDoctorName('');
      setFormFileUrl('');
      setFormNotes('');
      loadPrescriptions();
    } catch (err: any) {
      alert(err.message || 'Failed to create prescription record.');
    }
  };

  const pendingCount = prescriptions.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-950">Prescription Queue</h1>
          <p className="text-sm font-medium text-gray-500">Verify and manage incoming patient prescriptions</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-700">
              <Clock className="h-3.5 w-3.5" />
              {pendingCount} Awaiting Review
            </span>
          )}
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-brand-950 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-900"
          >
            <Plus className="h-4 w-4" /> New Prescription
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row">
          <form
            onSubmit={(e) => { e.preventDefault(); loadPrescriptions(); }}
            className="flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5"
          >
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient or doctor name..."
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
            />
          </form>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-700 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-16 text-center">
          <FileText className="h-12 w-12 text-brand-200" />
          <p className="mt-4 text-sm font-bold text-gray-500">No prescriptions found.</p>
          <p className="text-xs text-gray-400">Incoming prescriptions will appear here for review.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-white shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {['Patient', 'Doctor', 'Date', 'Status', 'Notes', 'Actions'].map((col) => (
                  <th key={col} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prescriptions.map((p) => {
                const statusInfo = STATUS_MAP[p.status as keyof typeof STATUS_MAP];
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={p.id} className="group transition hover:bg-brand-50/20">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                          {p.customer_name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-950">{p.customer_name}</p>
                          {p.customer_phone && <p className="text-xs text-gray-400">{p.customer_phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-600">
                      {p.doctor_name || <span className="italic text-gray-400">N/A</span>}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-gray-500">
                      {new Date(p.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusInfo.style}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="max-w-[180px] px-5 py-4 text-xs text-gray-500 truncate">
                      {p.notes || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => { setSelected(p); setNewNotes(''); }}
                        className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:border-brand-200 hover:text-brand-800"
                      >
                        <Eye className="h-3.5 w-3.5" /> Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[540px] rounded-[2.5rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-950">Prescription Review</h2>
              <button onClick={() => setSelected(null)} className="rounded-xl p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { label: 'Patient', value: selected.customer_name },
                { label: 'Phone', value: selected.customer_phone || '—' },
                { label: 'Doctor', value: selected.doctor_name || '—' },
                { label: 'Status', value: selected.status },
                { label: 'File / Image', value: selected.file_url },
                { label: 'Submitted', value: new Date(selected.created_at).toLocaleString('en-PK') },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3">
                  <span className="w-24 shrink-0 text-xs font-bold uppercase tracking-wider text-gray-400">{label}</span>
                  <span className="text-sm font-semibold text-gray-800 break-all">{value}</span>
                </div>
              ))}
            </div>

            {selected.status === 'PENDING' && (
              <div className="mt-6 border-t border-gray-100 pt-4 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Reviewer Notes (optional)</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Add verification notes or rejection reason..."
                  className="h-20 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand-400"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(selected.id, 'REJECTED')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, 'VERIFIED')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" /> Verify & Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Prescription Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[520px] rounded-[2.5rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-950">New Prescription Entry</h2>
              <button onClick={() => setIsAddOpen(false)} className="rounded-xl p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddPrescription} className="mt-5 space-y-4">
              {[
                { label: 'Patient Name', val: formCustomerName, set: setFormCustomerName, req: true, type: 'text', placeholder: 'Full name' },
                { label: 'Patient Phone', val: formCustomerPhone, set: setFormCustomerPhone, req: false, type: 'tel', placeholder: '+92...' },
                { label: 'Prescribing Doctor', val: formDoctorName, set: setFormDoctorName, req: false, type: 'text', placeholder: 'Dr. Name' },
                { label: 'Prescription File URL / Image Path', val: formFileUrl, set: setFormFileUrl, req: true, type: 'url', placeholder: 'https://...' },
              ].map(({ label, val, set, req, type, placeholder }) => (
                <div key={label}>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
                  <input
                    type={type}
                    required={req}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand-400"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Internal Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Any additional context..."
                  className="mt-2 h-16 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand-400"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="rounded-2xl bg-brand-950 px-6 py-3 text-sm font-bold text-white hover:bg-brand-900">Save Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
