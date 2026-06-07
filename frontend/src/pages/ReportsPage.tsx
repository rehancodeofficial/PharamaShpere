import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp, DollarSign, ShoppingBag, Package, BarChart2, Loader2, AlertCircle,
  Calendar,  RefreshCw,   ListOrdered,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (d: Date) => d.toISOString().split('T')[0];

export const ReportsPage = () => {
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesPage, setSalesPage] = useState(1);
  const [salesTotal, setSalesTotal] = useState(0);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dailyRes, historyRes, medsRes] = await Promise.all([
        apiFetch(`/sales/daily?date=${selectedDate}`),
        apiFetch(`/sales?page=${salesPage}&limit=10`),
        apiFetch('/medicines?limit=200'),
      ]);

      setDailySummary(dailyRes.data);
      setSalesHistory(historyRes.data || []);
      setSalesTotal(historyRes.meta?.total || 0);
      setMedicines(medsRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, salesPage]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Derived metrics
  const lowStockItems = medicines.filter((med) => {
    const totalStock = (med.batches || []).reduce((s: number, b: any) => s + Number(b.quantity), 0);
    return totalStock <= (med.reorder_level || 10);
  });

  const totalMeds = medicines.length;
  const totalStock = medicines.reduce((s, med) => {
    return s + (med.batches || []).reduce((bs: number, b: any) => bs + Number(b.quantity), 0);
  }, 0);

  const avgOrderValue =
    dailySummary?.total_transactions > 0
      ? dailySummary.total_sales_amount / dailySummary.total_transactions
      : 0;

  const kpiCards = [
    {
      label: "Today's Revenue",
      value: formatCurrency(dailySummary?.total_sales_amount || 0),
      icon: DollarSign,
      gradient: 'from-brand-700 to-brand-950',
      note: `${dailySummary?.total_transactions || 0} transactions`,
    },
    {
      label: 'Avg. Transaction Value',
      value: formatCurrency(avgOrderValue),
      icon: TrendingUp,
      gradient: 'from-accent-500 to-accent-700',
      note: 'Today',
    },
    {
      label: 'Total SKUs',
      value: totalMeds.toLocaleString(),
      icon: ShoppingBag,
      gradient: 'from-violet-500 to-violet-800',
      note: `${lowStockItems.length} low-stock items`,
    },
    {
      label: 'Total Stock Units',
      value: totalStock.toLocaleString(),
      icon: Package,
      gradient: 'from-emerald-500 to-emerald-700',
      note: 'Across all batches',
    },
  ];

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-950">Reports & Analytics</h1>
          <p className="text-sm font-medium text-gray-500">Business performance metrics and operational insights</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            max={formatDate(new Date())}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-brand-950 shadow-sm outline-none"
          />
          <button
            onClick={loadReports}
            className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-600 shadow-sm hover:bg-gray-50 transition"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map(({ label, value, icon: Icon, gradient, note }) => (
          <div
            key={label}
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-6 text-white shadow-card transition hover:-translate-y-1`}
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="mt-5 text-3xl font-extrabold tracking-tight">{loading ? '—' : value}</p>
              <p className="mt-1 text-sm font-semibold text-white/80">{label}</p>
              <p className="mt-2 text-xs font-semibold text-white/60">{note}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
          <span className="text-sm font-semibold text-gray-400">Loading report data…</span>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Sales History Table */}
          <div className="xl:col-span-2 rounded-3xl border border-gray-200 bg-white shadow-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-50 p-2.5">
                  <ListOrdered className="h-5 w-5 text-brand-700" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-brand-950">Sales Transaction History</h2>
                  <p className="text-xs font-medium text-gray-400">{salesTotal} total transactions</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    {['Date/Time', 'Customer', 'Payment', 'Items', 'Total'].map((col) => (
                      <th key={col} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesHistory.map((sale) => (
                    <tr key={sale.id} className="hover:bg-brand-50/20 transition">
                      <td className="px-5 py-4 text-xs font-medium text-gray-500 whitespace-nowrap">
                        {new Date(sale.created_at).toLocaleString('en-PK', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-brand-950">{sale.customer_name || 'Walk-in'}</p>
                        {sale.customer_phone && <p className="text-xs text-gray-400">{sale.customer_phone}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          sale.payment_method === 'CASH' ? 'bg-green-50 text-green-700' :
                          sale.payment_method === 'CARD' ? 'bg-blue-50 text-blue-700' :
                          'bg-violet-50 text-violet-700'
                        }`}>
                          {sale.payment_method}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-600">
                        {sale.items?.length || 0} item{sale.items?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-5 py-4 text-sm font-extrabold text-brand-950 whitespace-nowrap">
                        {formatCurrency(Number(sale.total_amount))}
                      </td>
                    </tr>
                  ))}
                  {salesHistory.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm font-medium text-gray-400">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {salesTotal > 10 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <p className="text-xs font-medium text-gray-500">
                  Page {salesPage} of {Math.ceil(salesTotal / 10)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSalesPage((p) => Math.max(1, p - 1))}
                    disabled={salesPage === 1}
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                  >← Prev</button>
                  <button
                    onClick={() => setSalesPage((p) => p + 1)}
                    disabled={salesPage >= Math.ceil(salesTotal / 10)}
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                  >Next →</button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Daily Summary */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-card">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="rounded-2xl bg-brand-50 p-2.5">
                  <Calendar className="h-5 w-5 text-brand-700" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-brand-950">Daily Summary</h3>
                  <p className="text-xs text-gray-400">{selectedDate}</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {[
                  { label: 'Total Revenue', value: formatCurrency(dailySummary?.total_sales_amount || 0) },
                  { label: 'Transactions', value: (dailySummary?.total_transactions || 0).toLocaleString() },
                  { label: 'Avg. Order Value', value: formatCurrency(avgOrderValue) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">{label}</span>
                    <span className="text-sm font-extrabold text-brand-950">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-card">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="rounded-2xl bg-amber-50 p-2.5">
                  <BarChart2 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-brand-950">Low Stock Alert</h3>
                  <p className="text-xs text-gray-400">{lowStockItems.length} items need replenishment</p>
                </div>
              </div>

              {lowStockItems.length === 0 ? (
                <p className="mt-4 text-center text-sm font-medium text-green-600">✓ All stock levels healthy</p>
              ) : (
                <div className="mt-4 space-y-2 max-h-52 overflow-y-auto">
                  {lowStockItems.slice(0, 10).map((med) => {
                    const stock = (med.batches || []).reduce((s: number, b: any) => s + Number(b.quantity), 0);
                    return (
                      <div key={med.id} className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-2.5">
                        <div>
                          <p className="text-xs font-bold text-brand-950 leading-tight">{med.name}</p>
                          <p className="text-xs text-gray-400">Reorder: {med.reorder_level}</p>
                        </div>
                        <span className={`text-xs font-extrabold ${stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                          {stock} left
                        </span>
                      </div>
                    );
                  })}
                  {lowStockItems.length > 10 && (
                    <p className="text-center text-xs text-gray-400">+ {lowStockItems.length - 10} more items</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
