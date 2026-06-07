import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Boxes,
  Loader2,
  X,
  AlertTriangle,
  Calendar,
  
} from 'lucide-react';
import { apiFetch } from '../lib/api';

export const InventoryPage = () => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Modals
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Active items for editing/adding batches
  const [selectedMed, setSelectedMed] = useState<any | null>(null);

  // Form Fields - Medicine
  const [medId, setMedId] = useState<string | null>(null);
  const [medName, setMedName] = useState('');
  const [medGeneric, setMedGeneric] = useState('');
  const [medCategory, setMedCategory] = useState('');
  const [medUnit, setMedUnit] = useState('Tablet');
  const [medBarcode, setMedBarcode] = useState('');
  const [medReorder, setMedReorder] = useState(10);
  const [medDesc, setMedDesc] = useState('');

  // Form Fields - Batch
  const [batchNum, setBatchNum] = useState('');
  const [batchQty, setBatchQty] = useState(100);
  const [batchCost, setBatchCost] = useState(10);
  const [batchSell, setBatchSell] = useState(15);
  const [batchExpiry, setBatchExpiry] = useState('');
  const [batchManufacture, setBatchManufacture] = useState('');
  const [batchSupplierId, setBatchSupplierId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoryParam = category ? `&category=${category}` : '';
      const searchParam = search ? `&search=${search}` : '';

      const [medsRes, suppliersRes] = await Promise.all([
        apiFetch(`/medicines?limit=100${searchParam}${categoryParam}`),
        apiFetch('/suppliers?limit=100'),
      ]);

      setMedicines(medsRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to sync inventory data with server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [category]); // Quick Category filter

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // CRUD - Save / Update Medicine
  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: medName,
        generic_name: medGeneric,
        category: medCategory,
        unit: medUnit,
        barcode: medBarcode,
        reorder_level: Number(medReorder),
        description: medDesc,
      };

      if (medId) {
        // Update
        await apiFetch(`/medicines/${medId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        await apiFetch('/medicines', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setIsMedModalOpen(false);
      resetMedForm();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving medicine.');
    }
  };

  // CRUD - Delete Medicine
  const handleDeleteMedicine = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this medicine? This will delete all batches relating to it.')) {
      return;
    }
    try {
      await apiFetch(`/medicines/${id}`, {
        method: 'DELETE',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to archive medicine.');
    }
  };

  // CRUD - Save Batch
  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;

    try {
      const payload = {
        medicine_id: selectedMed.id,
        supplier_id: batchSupplierId || undefined,
        batch_number: batchNum,
        quantity: Number(batchQty),
        cost_price: Number(batchCost),
        sell_price: Number(batchSell),
        expiry_date: new Date(batchExpiry).toISOString(),
        manufacture_date: batchManufacture ? new Date(batchManufacture).toISOString() : undefined,
      };

      await apiFetch('/batches', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setIsBatchModalOpen(false);
      resetBatchForm();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error saving batch information.');
    }
  };

  const openMedCreate = () => {
    resetMedForm();
    setIsMedModalOpen(true);
  };

  const openMedEdit = (med: any) => {
    setMedId(med.id);
    setMedName(med.name);
    setMedGeneric(med.generic_name || '');
    setMedCategory(med.category || '');
    setMedUnit(med.unit || 'Tablet');
    setMedBarcode(med.barcode || '');
    setMedReorder(med.reorder_level || 10);
    setMedDesc(med.description || '');
    setIsMedModalOpen(true);
  };

  const openStockIn = (med: any) => {
    setSelectedMed(med);
    resetBatchForm();
    setIsBatchModalOpen(true);
  };

  const resetMedForm = () => {
    setMedId(null);
    setMedName('');
    setMedGeneric('');
    setMedCategory('');
    setMedUnit('Tablet');
    setMedBarcode('');
    setMedReorder(10);
    setMedDesc('');
  };

  const resetBatchForm = () => {
    setBatchNum('');
    setBatchQty(100);
    setBatchCost(10);
    setBatchSell(15);
    setBatchExpiry('');
    setBatchManufacture('');
    setBatchSupplierId('');
  };

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-950">Inventory & Medicines</h1>
          <p className="text-sm font-medium text-gray-500">Add, track, replenish and edit active clinical stock</p>
        </div>
        <button
          onClick={openMedCreate}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-950 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-900 active:scale-95"
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add Medicine Catalog
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-card">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500 shadow-inner">
            <Search className="h-5 w-5 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicine catalog by name, generic name, or barcode..."
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400 text-gray-800"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 outline-none shadow-sm"
            >
              <option value="">All Categories</option>
              <option value="Analgesic">Analgesic</option>
              <option value="Antibiotic">Antibiotic</option>
              <option value="Antidiabetic">Antidiabetic</option>
              <option value="Antihypertensive">Antihypertensive</option>
              <option value="Antacid">Antacid</option>
              <option value="Antihistamine">Antihistamine</option>
              <option value="Bronchodilator">Bronchodilator</option>
            </select>
            <button
              type="submit"
              className="rounded-2xl bg-accent-500 px-5 py-3 text-sm font-bold text-white shadow hover:bg-accent-600 active:scale-95"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-card">
          <AlertTriangle className="h-6 w-6 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Main Table Card */}
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-card">
        {loading ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-brand-900">
            <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
            <p className="text-xs font-semibold">Updating inventory dashboard...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
            <Boxes className="h-12 w-12 text-brand-300" />
            <p className="mt-4 text-sm font-bold">No inventory matches found.</p>
            <p className="text-xs text-gray-400">Click &apos;Add Medicine Catalog&apos; to register new products.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3.5 font-bold">Barcode</th>
                  <th className="px-4 py-3.5 font-bold">Brand Name</th>
                  <th className="px-4 py-3.5 font-bold">Generic Formula</th>
                  <th className="px-4 py-3.5 font-bold">Category</th>
                  <th className="px-4 py-3.5 font-bold text-center">Reorder Level</th>
                  <th className="px-4 py-3.5 font-bold text-center">Total Stock</th>
                  <th className="px-4 py-3.5 font-bold text-center">Status</th>
                  <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {medicines.map((med) => {
                  const totalStock = med.batches?.reduce((sum: number, b: any) => sum + Number(b.quantity), 0) || 0;
                  const isLowStock = totalStock <= (med.reorder_level || 10);
                  const isOutOfStock = totalStock === 0;

                  return (
                    <tr key={med.id} className="transition hover:bg-gray-50/50">
                      <td className="px-4 py-4 font-mono text-xs text-gray-400">{med.barcode || 'N/A'}</td>
                      <td className="px-4 py-4 font-bold text-brand-950">{med.name}</td>
                      <td className="px-4 py-4 text-gray-600 font-medium italic">{med.generic_name || 'N/A'}</td>
                      <td className="px-4 py-4 text-gray-500">{med.category || 'Unclassified'}</td>
                      <td className="px-4 py-4 text-center font-semibold text-gray-500">{med.reorder_level}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-base font-extrabold text-brand-950">{totalStock}</span>
                        <span className="ml-1 text-xs text-gray-400">{med.unit || 'unit'}s</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            isOutOfStock
                              ? 'bg-red-50 text-red-600'
                              : isLowStock
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-green-50 text-green-600'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Healthy'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openStockIn(med)}
                            className="rounded-xl bg-accent-50 px-3 py-2 text-xs font-bold text-accent-700 hover:bg-accent-100"
                            title="Stock In Batch"
                          >
                            Stock In
                          </button>
                          <button
                            onClick={() => openMedEdit(med)}
                            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:text-brand-900"
                            title="Edit Catalog Details"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedicine(med.id)}
                            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:text-red-600 hover:border-red-100"
                            title="Archive Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Medicine */}
      {isMedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[550px] rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-2xl sm:p-8 text-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-brand-950">
                {medId ? 'Modify Medicine Details' : 'Register New Medicine Catalog'}
              </h2>
              <button onClick={() => setIsMedModalOpen(false)} className="rounded-xl p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Brand Name</label>
                  <input
                    required
                    type="text"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="e.g. Paracetamol 500mg"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Generic Formula</label>
                  <input
                    type="text"
                    value={medGeneric}
                    onChange={(e) => setMedGeneric(e.target.value)}
                    placeholder="e.g. Acetaminophen"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Category</label>
                  <select
                    value={medCategory}
                    onChange={(e) => setMedCategory(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-500"
                  >
                    <option value="Analgesic">Analgesic</option>
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Antidiabetic">Antidiabetic</option>
                    <option value="Antihypertensive">Antihypertensive</option>
                    <option value="Antacid">Antacid</option>
                    <option value="Antihistamine">Antihistamine</option>
                    <option value="Bronchodilator">Bronchodilator</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Unit Type</label>
                  <select
                    value={medUnit}
                    onChange={(e) => setMedUnit(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-500"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Injection">Injection</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Barcode Identifier</label>
                  <input
                    type="text"
                    value={medBarcode}
                    onChange={(e) => setMedBarcode(e.target.value)}
                    placeholder="e.g. 8901030023456"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Reorder Alert Level</label>
                  <input
                    required
                    type="number"
                    value={medReorder}
                    onChange={(e) => setMedReorder(Number(e.target.value))}
                    min={0}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
                <textarea
                  value={medDesc}
                  onChange={(e) => setMedDesc(e.target.value)}
                  placeholder="Medical summary, warnings or custom store placement details..."
                  className="mt-2 h-20 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsMedModalOpen(false)}
                  className="rounded-2xl border border-gray-200 px-6 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-brand-950 px-6 py-3.5 text-sm font-bold text-white hover:bg-brand-900"
                >
                  Save Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Batch (Stock In) */}
      {isBatchModalOpen && selectedMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[550px] rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-2xl sm:p-8 text-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-brand-950">Replenish & Stock In</h2>
                <p className="text-xs text-gray-500 mt-1">Brand SKU: <strong className="text-brand-900">{selectedMed.name}</strong></p>
              </div>
              <button onClick={() => setIsBatchModalOpen(false)} className="rounded-xl p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Batch / LOT Number</label>
                  <input
                    required
                    type="text"
                    value={batchNum}
                    onChange={(e) => setBatchNum(e.target.value.toUpperCase())}
                    placeholder="e.g. LOT-101-A"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Stock Quantity</label>
                  <input
                    required
                    type="number"
                    value={batchQty}
                    onChange={(e) => setBatchQty(Number(e.target.value))}
                    min={1}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Cost Price (PKR)</label>
                  <input
                    required
                    type="number"
                    value={batchCost}
                    onChange={(e) => setBatchCost(Number(e.target.value))}
                    min={0}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Selling Price (PKR)</label>
                  <input
                    required
                    type="number"
                    value={batchSell}
                    onChange={(e) => setBatchSell(Number(e.target.value))}
                    min={0}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Manufacture Date
                  </label>
                  <input
                    type="date"
                    value={batchManufacture}
                    onChange={(e) => setBatchManufacture(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-red-500" /> Expiry Date
                  </label>
                  <input
                    required
                    type="date"
                    value={batchExpiry}
                    onChange={(e) => setBatchExpiry(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-500 border-red-200"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Supplier</label>
                  <select
                    value={batchSupplierId}
                    onChange={(e) => setBatchSupplierId(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-500"
                  >
                    <option value="">Choose Supplier (Optional)</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="rounded-2xl border border-gray-200 px-6 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-accent-500 px-6 py-3.5 text-sm font-bold text-white hover:bg-accent-600"
                >
                  Submit Stock Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
