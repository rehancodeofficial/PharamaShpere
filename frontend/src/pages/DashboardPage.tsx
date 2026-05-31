import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  Pill,
  Sparkles,
  Stethoscope,
  PackagePlus,
  ShoppingCart,
  Truck,
  Loader2,
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { apiFetch } from '../lib/api';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API State
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalMedicines: 0,
    lowStockItemsCount: 0,
    expiringSoonCount: 0,
  });

  const [lowStockMedicines, setLowStockMedicines] = useState<any[]>([]);
  const [expiringBatches, setExpiringBatches] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [inventoryHealth, setInventoryHealth] = useState(100);
  const [totalStockCount, setTotalStockCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch concurrently
      const [dailyRes, medicinesRes, lowStockRes, expiringRes, salesRes] = await Promise.all([
        apiFetch('/sales/daily'),
        apiFetch('/medicines?limit=1000'),
        apiFetch('/medicines/low-stock'),
        apiFetch('/batches/expiring?days=30'),
        apiFetch('/sales?limit=20'),
      ]);

      const medicines = medicinesRes.data || [];
      const lowStockList = lowStockRes.data || [];
      const expiringList = expiringRes.data || [];
      const salesList = salesRes.data || [];
      const todayRevenue = dailyRes.data?.total_sales_amount || 0;

      // Calculate stock health percentage
      const totalMedicines = medicines.length;
      const lowStockCount = lowStockList.length;
      const healthyCount = Math.max(0, totalMedicines - lowStockCount);
      const healthPct = totalMedicines > 0 ? Math.round((healthyCount / totalMedicines) * 100) : 100;

      // Group sales by day for the chart (past 7 days)
      const past7Days: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        past7Days[dayStr] = 0;
      }

      salesList.forEach((sale: any) => {
        const saleDate = new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (past7Days[saleDate] !== undefined) {
          past7Days[saleDate] += Number(sale.total_amount);
        }
      });

      const formattedChartData = Object.entries(past7Days).map(([date, revenue]) => ({
        date,
        revenue,
      }));

      // Find best sellers by aggregating sale items
      const productSalesMap: Record<string, number> = {};
      salesList.forEach((sale: any) => {
        if (sale.items) {
          sale.items.forEach((item: any) => {
            const medName = item.medicine?.name || 'Unknown Medicine';
            productSalesMap[medName] = (productSalesMap[medName] || 0) + Number(item.quantity);
          });
        }
      });

      const sortedProducts = Object.entries(productSalesMap)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      // If no sales exist, provide some clean visual placeholders
      const finalBestSellers = sortedProducts.length > 0 ? sortedProducts : [
        { name: 'Paracetamol', sales: 0 },
        { name: 'Amoxicillin', sales: 0 },
        { name: 'Metformin', sales: 0 },
      ];

      setStats({
        todayRevenue,
        totalMedicines,
        lowStockItemsCount: lowStockCount,
        expiringSoonCount: expiringList.length,
      });

      setLowStockMedicines(lowStockList.slice(0, 3));
      setExpiringBatches(expiringList.slice(0, 3));
      setRecentSales(salesList.slice(0, 5));
      setRevenueChartData(formattedChartData);
      setBestSellers(finalBestSellers);
      setInventoryHealth(healthPct);
    } catch (err: any) {
      console.error(err);
      setError('Could not refresh dashboard diagnostics. Please check database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-brand-900">
        <Loader2 className="h-10 w-10 animate-spin text-accent-500" />
        <p className="text-sm font-semibold">Running telemetry & metrics...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
      {/* Hero Welcome banner */}
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 p-6 text-white shadow-card sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-brand-50 backdrop-blur">
              <Sparkles className="h-4 w-4 text-accent-400" />
              Smart operations dashboard
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Run inventory, sales, and prescriptions from one trusted workspace.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-brand-100/80">
              Monitor stock risk, daily revenue, prescription queues, and supplier actions with a polished pharmacy command center.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/inventory')}
                className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold shadow-lg shadow-brand-950/20 transition bg-white text-brand-900 hover:-translate-y-0.5"
                type="button"
              >
                <PackagePlus className="h-4 w-4 text-brand-700" />
                Manage Stock
              </button>
              <button
                onClick={() => navigate('/sales')}
                className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold shadow-lg shadow-brand-950/20 transition bg-accent-600 text-white hover:-translate-y-0.5 hover:bg-accent-700"
                type="button"
              >
                <ShoppingCart className="h-4 w-4" />
                Open POS Terminal
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-100/75">Today’s revenue</p>
                <p className="mt-2 text-3xl font-extrabold text-white">
                  {formatCurrency(stats.todayRevenue)}
                </p>
              </div>
              <div className="rounded-2xl bg-accent-400/20 p-3 text-accent-400">
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-xl font-bold">100%</p>
                <p className="text-xs text-brand-100/70">Database</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-xl font-bold">{recentSales.length}</p>
                <p className="text-xs text-brand-100/70">Sales</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-xl font-bold">{stats.lowStockItemsCount}</p>
                <p className="text-xs text-brand-100/70">Alerts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostics Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/80 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Revenue today</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-brand-950">{formatCurrency(stats.todayRevenue)}</p>
            </div>
            <div className="rounded-2xl p-3 bg-brand-50 text-brand-700">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-500">Real-time daily sum</span>
            <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-600">
              Live SQL
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/80 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Medicines</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-brand-950">{stats.totalMedicines}</p>
            </div>
            <div className="rounded-2xl p-3 bg-accent-50 text-accent-600">
              <Pill className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-500">Catalog SKUs registered</span>
            <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-600">
              Active items
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/80 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Low Stock SKUs</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-amber-600">{stats.lowStockItemsCount}</p>
            </div>
            <div className="rounded-2xl p-3 bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-500">Needs replenishment</span>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              Action Required
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/80 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Expiry Watch</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-red-600">{stats.expiringSoonCount}</p>
            </div>
            <div className="rounded-2xl p-3 bg-red-50 text-red-600">
              <CalendarClock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-500">Expiring inside 30 days</span>
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
              Critical Check
            </span>
          </div>
        </div>
      </section>

      {/* Charts section */}
      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-500">Performance</p>
              <h2 className="mt-1 text-xl font-extrabold text-brand-950">Daily Sales Trend</h2>
            </div>
            <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-600">
              Last 7 days
            </div>
          </div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={revenueChartData} margin={{ bottom: 0, left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#1D6FA4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#1D6FA4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
                <XAxis axisLine={false} dataKey="date" tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ border: '0', borderRadius: '18px', boxShadow: '0 16px 40px rgba(15,32,64,0.14)' }}
                  formatter={(value: number) => [formatCurrency(value as number), 'Revenue']}
                />
                <Area
                  dataKey="revenue"
                  fill="url(#revenueFill)"
                  stroke="#1D6FA4"
                  strokeWidth={3}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-600">Inventory</p>
              <h2 className="mt-1 text-xl font-extrabold text-brand-950">Stock Health Ratio</h2>
            </div>
            <div className="rounded-2xl bg-accent-50 p-3 text-accent-600">
              <Stethoscope className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-7 flex items-center gap-5">
            <div className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full bg-[conic-gradient(#10B981_0deg,#10B981_360deg)]" style={{ background: `conic-gradient(#10B981 0deg, #10B981 ${inventoryHealth * 3.6}deg, #E5E7EB ${inventoryHealth * 3.6}deg, #E5E7EB 360deg)` }}>
              <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-inner">
                <span className="text-3xl font-extrabold text-brand-950">{inventoryHealth}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm leading-6 text-gray-600">
                A higher percentage represents healthy medicine stock that is well above individual reorder levels.
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-600">Total Medicines</span>
                  <span className="font-bold text-brand-950">{stats.totalMedicines}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-600">Replenish Alert Queue</span>
                  <span className="font-bold text-amber-600">{stats.lowStockItemsCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 h-[170px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={bestSellers} margin={{ bottom: 0, left: -20, right: 0, top: 5 }}>
                <CartesianGrid stroke="#EEF2F7" strokeDasharray="3 3" vertical={false} />
                <XAxis axisLine={false} dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }} tickLine={false} />
                <YAxis axisLine={false} tick={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ border: '0', borderRadius: '16px', boxShadow: '0 16px 40px rgba(15,32,64,0.12)' }}
                  formatter={(value: number) => [value, 'Units Sold']}
                />
                <Bar dataKey="sales" fill="#10B981" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Recent transactions & Warnings */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-500">Transactions</p>
              <h2 className="mt-1 text-xl font-extrabold text-brand-950">Recent Sales History</h2>
            </div>
            <button
              onClick={() => navigate('/sales')}
              className="rounded-2xl bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100"
              type="button"
            >
              Open POS
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100">
            {recentSales.length === 0 ? (
              <p className="p-6 text-center text-sm font-medium text-gray-500">No transactions processed yet.</p>
            ) : (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">Invoice ID</th>
                    <th className="px-4 py-3 font-bold">Customer</th>
                    <th className="px-4 py-3 font-bold">Date & Time</th>
                    <th className="px-4 py-3 font-bold">Payment Method</th>
                    <th className="px-4 py-3 text-right font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="transition hover:bg-gray-50/80">
                      <td className="px-4 py-4 font-bold text-brand-950">{sale.id.slice(0, 8).toUpperCase()}...</td>
                      <td className="px-4 py-4 text-gray-600">{sale.customer_name || 'Walk-in Customer'}</td>
                      <td className="px-4 py-4 text-gray-500">
                        {new Date(sale.created_at).toLocaleString('en-PK', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-bold text-accent-600 uppercase">
                          {sale.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-brand-950">
                        {formatCurrency(Number(sale.total_amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Replenish Alerts</p>
                <h2 className="mt-1 text-xl font-extrabold text-brand-950">Low-Stock Queue</h2>
              </div>
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="mt-5 space-y-3">
              {lowStockMedicines.length === 0 ? (
                <p className="p-4 rounded-2xl bg-white border border-amber-100 text-center text-sm font-medium text-gray-500">
                  All medicine levels are fully stocked!
                </p>
              ) : (
                lowStockMedicines.map((medicine) => (
                  <div key={medicine.id} className="rounded-2xl border border-amber-100 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-brand-950">{medicine.name}</p>
                        <p className="text-sm text-gray-500">Reorder level: {medicine.reorder_level} units</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-extrabold text-amber-700">
                        Needs Restock
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-500">Expiry Risk</p>
                <h2 className="mt-1 text-xl font-extrabold text-brand-950">Critical Batches</h2>
              </div>
              <CalendarClock className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-5 space-y-3">
              {expiringBatches.length === 0 ? (
                <p className="p-4 rounded-2xl bg-white border border-gray-200 text-center text-sm font-medium text-gray-500">
                  No batches expiring within 30 days.
                </p>
              ) : (
                expiringBatches.map((batch) => (
                  <div key={batch.id} className="rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-brand-950">
                          {batch.medicine?.name} <span className="text-xs text-gray-400">({batch.batch_number})</span>
                        </p>
                        <p className="text-sm text-red-500">
                          Expires:{' '}
                          {new Date(batch.expiry_date).toLocaleDateString('en-PK', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-600">
                        {batch.quantity} units
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
