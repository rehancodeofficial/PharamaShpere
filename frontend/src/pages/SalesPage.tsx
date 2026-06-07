import { useEffect, useState, useCallback } from 'react';
import {
  Search, ShoppingCart, Trash2, Plus, Minus,
  CreditCard, Banknote, ShieldCheck, Loader2, CheckCircle, X,
  Receipt, AlertCircle,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);

interface CartItem {
  medicine_id: string;
  batch_id: string;
  medicine_name: string;
  batch_number: string;
  unit_price: number;
  quantity: number;
  available_stock: number;
}

export const SalesPage = () => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'INSURANCE'>('CASH');
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [medsRes, salesRes] = await Promise.all([
        apiFetch('/medicines?limit=200'),
        apiFetch('/sales?limit=15'),
      ]);
      setMedicines(medsRes.data || []);
      setRecentSales(salesRes.data || []);
    } catch {
      setErrorMsg('Failed to load product catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered medicines with available batches
  const filteredMedicines = medicines.filter((med) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      med.name?.toLowerCase().includes(q) ||
      med.generic_name?.toLowerCase().includes(q) ||
      med.barcode?.toLowerCase().includes(q)
    );
  });

  const addToCart = (med: any, batch: any) => {
    const existing = cartItems.find((i) => i.batch_id === batch.id);
    if (existing) {
      if (existing.quantity >= batch.quantity) return;
      setCartItems((prev) =>
        prev.map((i) => (i.batch_id === batch.id ? { ...i, quantity: i.quantity + 1 } : i))
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          medicine_id: med.id,
          batch_id: batch.id,
          medicine_name: med.name,
          batch_number: batch.batch_number,
          unit_price: Number(batch.sell_price),
          quantity: 1,
          available_stock: batch.quantity,
        },
      ]);
    }
  };

  const changeQty = (batchId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => {
          if (i.batch_id !== batchId) return i;
          const newQty = i.quantity + delta;
          if (newQty < 1) return i;
          if (newQty > i.available_stock) return i;
          return { ...i, quantity: newQty };
        })
    );
  };

  const removeFromCart = (batchId: string) =>
    setCartItems((prev) => prev.filter((i) => i.batch_id !== batchId));

  const subtotal = cartItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const total = Math.max(0, subtotal - discountAmount);

  const handleProcessSale = async () => {
    if (cartItems.length === 0) {
      setErrorMsg('Please add at least one product to the cart.');
      return;
    }
    setProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
        discount_amount: discountAmount,
        payment_method: paymentMethod,
        items: cartItems.map((i) => ({
          medicine_id: i.medicine_id,
          batch_id: i.batch_id,
          quantity: i.quantity,
        })),
      };

      await apiFetch('/sales', { method: 'POST', body: JSON.stringify(payload) });

      setSuccessMsg(`Transaction processed! Total: ${formatCurrency(total)} via ${paymentMethod}.`);
      setCartItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscountAmount(0);
      setPaymentMethod('CASH');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Sale transaction failed. Please check stock levels.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-950">Sales & POS Terminal</h1>
        <p className="text-sm font-medium text-gray-500">Process transactions and deduct inventory in real time</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        {/* Left: Product Catalog */}
        <div className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Search className="h-5 w-5 shrink-0 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicine catalog by name, generic, or barcode..."
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400 text-gray-800"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-accent-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
              {filteredMedicines.map((med) => {
                const activeBatches = (med.batches || [])
                  .filter((b: any) => b.quantity > 0)
                  .sort((a: any, b: any) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
                const totalStock = activeBatches.reduce((s: number, b: any) => s + Number(b.quantity), 0);
                const firstBatch = activeBatches[0];

                return (
                  <div
                    key={med.id}
                    className={`group relative rounded-2xl border bg-white p-4 shadow-sm transition ${
                      totalStock === 0 ? 'border-gray-100 opacity-60' : 'border-gray-200 hover:border-accent-300 hover:shadow-md cursor-pointer'
                    }`}
                    onClick={() => firstBatch && addToCart(med, firstBatch)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-brand-950 text-sm">{med.name}</p>
                        <p className="text-xs text-gray-500 italic">{med.generic_name}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                          totalStock === 0
                            ? 'bg-red-50 text-red-500'
                            : totalStock <= med.reorder_level
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-green-50 text-green-600'
                        }`}
                      >
                        {totalStock} {med.unit || 'units'}
                      </span>
                    </div>
                    {firstBatch && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400">LOT: {firstBatch.batch_number}</span>
                        <span className="text-sm font-extrabold text-brand-800">
                          {formatCurrency(Number(firstBatch.sell_price))}
                        </span>
                      </div>
                    )}
                    {totalStock === 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-bold text-red-500">Out of Stock</span>
                      </div>
                    )}
                    {totalStock > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-accent-600/90 opacity-0 transition group-hover:opacity-100">
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                          <Plus className="h-5 w-5" /> Add to Cart
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredMedicines.length === 0 && (
                <div className="col-span-full rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400">
                  No medicines match your search criteria.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Cart & Checkout */}
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-card">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="rounded-2xl bg-brand-50 p-2.5 text-brand-700">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-extrabold text-brand-950">Current Cart</h2>
              {cartItems.length > 0 && (
                <span className="ml-auto rounded-full bg-accent-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  {cartItems.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="py-10 text-center">
                <ShoppingCart className="mx-auto h-10 w-10 text-gray-200" />
                <p className="mt-3 text-sm font-semibold text-gray-400">Cart is empty</p>
                <p className="text-xs text-gray-300">Click on a product to add it</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {cartItems.map((item) => (
                  <div key={item.batch_id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-brand-950 leading-tight">{item.medicine_name}</p>
                      <p className="text-xs text-gray-400">LOT: {item.batch_number}</p>
                      <p className="text-xs font-semibold text-accent-600">
                        {formatCurrency(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changeQty(item.batch_id, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => changeQty(item.batch_id, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-extrabold text-brand-950">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.batch_id)}
                        className="mt-1 text-gray-300 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Customer Info */}
            <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name (optional)"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-brand-400"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone number (optional)"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-brand-400"
              />
            </div>

            {/* Payment Method */}
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {(['CASH', 'CARD', 'INSURANCE'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex flex-col items-center gap-1 rounded-2xl border py-3 text-xs font-bold transition ${
                      paymentMethod === method
                        ? 'border-brand-500 bg-brand-950 text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {method === 'CASH' && <Banknote className="h-4 w-4" />}
                    {method === 'CARD' && <CreditCard className="h-4 w-4" />}
                    {method === 'INSURANCE' && <ShieldCheck className="h-4 w-4" />}
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-2 rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Discount (PKR)</span>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                  min={0}
                  max={subtotal}
                  className="w-24 rounded-xl border border-gray-200 bg-white px-3 py-1 text-right text-sm font-bold outline-none focus:border-brand-400"
                />
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-base">
                <span className="font-extrabold text-brand-950">Total Payable</span>
                <span className="text-xl font-extrabold text-accent-600">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Feedback */}
            {errorMsg && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}
            {successMsg && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            {/* Process button */}
            <button
              onClick={handleProcessSale}
              disabled={processing || cartItems.length === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-600 py-4 font-bold text-white shadow-lg transition hover:bg-accent-700 active:scale-95 disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Receipt className="h-5 w-5" />
                  Process Transaction — {formatCurrency(total)}
                </>
              )}
            </button>
          </div>

          {/* Recent Transactions */}
          {recentSales.length > 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-card">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-500 mb-4">Recent Transactions</h3>
              <div className="space-y-2">
                {recentSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-brand-950">{sale.customer_name || 'Walk-in'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(sale.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                        &nbsp;·&nbsp;{sale.payment_method}
                      </p>
                    </div>
                    <span className="font-extrabold text-sm text-brand-950">
                      {formatCurrency(Number(sale.total_amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
