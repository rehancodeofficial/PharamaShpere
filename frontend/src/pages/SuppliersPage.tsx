import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, Search, Truck, Loader2, X, AlertCircle, Phone, Mail, MapPin,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

export const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const searchParam = search ? `&search=${search}` : '';
      const res = await apiFetch(`/suppliers?limit=100${searchParam}`);
      setSuppliers(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load suppliers.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
  };

  const openCreate = () => { resetForm(); setIsModalOpen(true); };
  const openEdit = (s: any) => {
    setEditId(s.id);
    setName(s.name || '');
    setContactPerson(s.contact_person || '');
    setPhone(s.phone || '');
    setEmail(s.email || '');
    setAddress(s.address || '');
    setNotes(s.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name, contact_person: contactPerson, phone, email, address, notes };
      if (editId) {
        await apiFetch(`/suppliers/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/suppliers', { method: 'POST', body: JSON.stringify(payload) });
      }
      setIsModalOpen(false);
      resetForm();
      loadSuppliers();
    } catch (err: any) {
      alert(err.message || 'Error saving supplier.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Archive this supplier from the directory?')) return;
    try {
      await apiFetch(`/suppliers/${id}`, { method: 'DELETE' });
      loadSuppliers();
    } catch (err: any) {
      alert(err.message || 'Failed to archive supplier.');
    }
  };

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-950">Suppliers Directory</h1>
          <p className="text-sm font-medium text-gray-500">Manage pharmaceutical distributor contacts and purchase relations</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-950 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-900 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-card">
        <form
          onSubmit={(e) => { e.preventDefault(); loadSuppliers(); }}
          className="flex items-center gap-3"
        >
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 shadow-inner">
            <Search className="h-5 w-5 shrink-0 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by supplier name or contact..."
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400 text-gray-800"
            />
          </div>
          <button type="submit" className="rounded-2xl bg-accent-500 px-5 py-3 text-sm font-bold text-white hover:bg-accent-600">
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-12 text-center">
              <Truck className="h-12 w-12 text-brand-200" />
              <p className="mt-4 text-sm font-bold text-gray-500">No suppliers registered yet.</p>
              <p className="text-xs text-gray-400">Add your first distribution partner above.</p>
            </div>
          ) : (
            suppliers.map((s) => (
              <div key={s.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-950 text-sm font-extrabold text-white">
                      {s.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <p className="font-extrabold text-brand-950 leading-tight">{s.name}</p>
                      {s.contact_person && (
                        <p className="text-xs font-medium text-gray-500">{s.contact_person}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:text-brand-900">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:text-red-500 hover:border-red-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {s.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-brand-400" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-brand-400" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-brand-400" />
                      <span className="truncate">{s.address}</span>
                    </div>
                  )}
                  {s.notes && (
                    <p className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 italic">{s.notes}</p>
                  )}
                </div>

                <p className="mt-3 text-xs text-gray-400">
                  Added {new Date(s.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[520px] rounded-[2.5rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-950">
                {editId ? 'Update Supplier Details' : 'Add New Supplier'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-xl p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-4">
              {[
                { label: 'Company Name', value: name, setter: setName, required: true, placeholder: 'e.g. Citi Pharma Ltd' },
                { label: 'Contact Person', value: contactPerson, setter: setContactPerson, required: false, placeholder: 'e.g. Mr. Ahmed' },
                { label: 'Phone Number', value: phone, setter: setPhone, required: false, placeholder: 'e.g. +923001234567' },
                { label: 'Email Address', value: email, setter: setEmail, required: false, placeholder: 'e.g. orders@supplier.pk' },
                { label: 'Physical Address', value: address, setter: setAddress, required: false, placeholder: 'e.g. Block 12, Gulshan, Karachi' },
              ].map(({ label, value, setter, required, placeholder }) => (
                <div key={label}>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
                  <input
                    type="text"
                    required={required}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-400"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment terms, delivery lead time, special conditions..."
                  className="mt-2 h-16 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-gray-200 px-6 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="rounded-2xl bg-brand-950 px-6 py-3.5 text-sm font-bold text-white hover:bg-brand-900">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
