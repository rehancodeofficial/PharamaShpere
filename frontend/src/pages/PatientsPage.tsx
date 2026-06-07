import { useEffect, useState, useCallback } from 'react';
import { Users, Phone, Calendar, Search, Loader2, AlertCircle, FileText, ShoppingBag } from 'lucide-react';
import { apiFetch } from '../lib/api';

export const PatientsPage = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // We don't have a dedicated patients module in the backend, so we aggregate them from sales and prescriptions
      const [salesRes, presRes] = await Promise.all([
        apiFetch('/sales?limit=500'),
        apiFetch('/prescriptions?limit=500')
      ]);

      const sales = salesRes.data || [];
      const prescriptions = presRes.data || [];

      // Map to aggregate unique patients
      const patientMap = new Map<string, any>();

      const processRecord = (record: any, type: 'sale' | 'prescription') => {
        if (!record.customer_name && !record.customer_phone) return;
        
        // Use phone as primary key, fallback to name if no phone
        const key = record.customer_phone ? record.customer_phone.trim() : record.customer_name.trim().toLowerCase();
        
        if (!patientMap.has(key)) {
          patientMap.set(key, {
            id: key,
            name: record.customer_name || 'Unknown',
            phone: record.customer_phone || '',
            firstVisit: new Date(record.created_at),
            lastVisit: new Date(record.created_at),
            salesCount: 0,
            prescriptionsCount: 0,
            totalSpent: 0,
          });
        }

        const p = patientMap.get(key);
        
        // Update dates
        const recordDate = new Date(record.created_at);
        if (recordDate < p.firstVisit) p.firstVisit = recordDate;
        if (recordDate > p.lastVisit) p.lastVisit = recordDate;

        if (type === 'sale') {
          p.salesCount += 1;
          p.totalSpent += Number(record.total_amount) || 0;
        } else {
          p.prescriptionsCount += 1;
        }
      };

      sales.forEach((s: any) => processRecord(s, 'sale'));
      prescriptions.forEach((p: any) => processRecord(p, 'prescription'));

      const aggregated = Array.from(patientMap.values()).sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());
      setPatients(aggregated);

    } catch (err: any) {
      setError(err.message || 'Failed to aggregate patient data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filteredPatients = patients.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.phone.includes(q);
  });

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-950">Patient Profiles</h1>
          <p className="text-sm font-medium text-gray-500">Aggregated clinical records from sales and prescriptions</p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-card">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 shadow-inner">
          <Search className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients by name or phone number..."
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400 text-gray-800"
          />
        </div>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPatients.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-12 text-center">
              <Users className="h-12 w-12 text-brand-200" />
              <p className="mt-4 text-sm font-bold text-gray-500">No patient records found.</p>
              <p className="text-xs text-gray-400">Patients will appear here automatically when sales or prescriptions are added with customer details.</p>
            </div>
          ) : (
            filteredPatients.map(p => (
              <div key={p.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-base font-extrabold text-brand-700">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-brand-950">{p.name}</p>
                    {p.phone && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone className="h-3 w-3" />
                        <span className="truncate">{p.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-gray-50 p-3 text-center">
                    <ShoppingBag className="mx-auto h-4 w-4 text-gray-400 mb-1" />
                    <p className="text-lg font-extrabold text-brand-950">{p.salesCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Purchases</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-3 text-center">
                    <FileText className="mx-auto h-4 w-4 text-gray-400 mb-1" />
                    <p className="text-lg font-extrabold text-brand-950">{p.prescriptionsCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Rx Files</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-medium text-gray-400 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Last Visit
                  </div>
                  <span>{p.lastVisit.toLocaleDateString('en-PK')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
