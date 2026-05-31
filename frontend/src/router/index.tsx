import { createBrowserRouter, RouterProvider, Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Pill,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
  LogOut,
} from 'lucide-react';

import { DashboardPage } from '../pages/DashboardPage';
import { InventoryPage } from '../pages/InventoryPage';
import { SalesPage } from '../pages/SalesPage';
import { PrescriptionsPage } from '../pages/PrescriptionsPage';
import { SuppliersPage } from '../pages/SuppliersPage';
import { PatientsPage } from '../pages/PatientsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AuthPage } from '../pages/AuthPage';
import { ProtectedRoute } from './ProtectedRoute';

const navigationItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Inventory', path: '/inventory', icon: Boxes },
  { label: 'Sales & POS', path: '/sales', icon: ShoppingCart },
  { label: 'Prescriptions', path: '/prescriptions', icon: ClipboardList },
  { label: 'Suppliers', path: '/suppliers', icon: Truck },
  { label: 'Patients', path: '/patients', icon: Users },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const AppLayout = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail') || 'admin@pharmasphere.local';
  
  // Extract initials
  const initials = userEmail
    .split('@')[0]
    .split('.')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'RA';

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    navigate('/auth');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <aside className="hidden w-[290px] shrink-0 border-r border-white/10 bg-brand-950 text-white shadow-sidebar lg:flex lg:flex-col">
        <div className="relative overflow-hidden px-6 py-7">
          <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-lg shadow-brand-950/20">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight">PharmaSphere</p>
              <p className="text-xs font-medium text-brand-100/70">Clinical pharmacy suite</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {navigationItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-white text-brand-950 shadow-lg shadow-brand-950/20'
                    : 'text-brand-100/75 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 pb-5">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent-400/20 p-2 text-accent-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Compliance ready</p>
                <p className="text-xs text-brand-100/70">License checks active</p>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-2 w-[82%] rounded-full bg-accent-400" />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-gray-200/80 bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              className="rounded-2xl border border-gray-200 bg-white p-2 text-gray-700 shadow-sm"
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 font-extrabold text-brand-950">
              <Pill className="h-6 w-6 text-brand-600" />
              PharmaSphere
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 shadow-inner sm:flex lg:max-w-xl">
            <Search className="h-5 w-5 shrink-0" />
            <input
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
              placeholder="Search medicines, invoices, prescriptions..."
              type="search"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-accent-100 bg-accent-50 px-3 py-2 text-sm font-semibold text-accent-600 md:flex">
              <span className="h-2 w-2 rounded-full bg-accent-500" />
              Main branch online
            </div>
            <button
              className="relative rounded-2xl border border-gray-200 bg-white p-3 text-gray-600 shadow-sm transition hover:text-brand-700"
              type="button"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white py-2 pl-2 pr-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-950 text-sm font-bold text-white uppercase">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-brand-950">
                  {userEmail === 'admin@pharmasphere.local' ? 'Rehan Admin' : userEmail.split('@')[0]}
                </p>
                <p className="text-xs font-medium text-gray-500">Pharmacy Manager</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 rounded-xl p-2 text-gray-400 hover:bg-gray-50 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'sales', element: <SalesPage /> },
          { path: 'prescriptions', element: <PrescriptionsPage /> },
          { path: 'suppliers', element: <SuppliersPage /> },
          { path: 'patients', element: <PatientsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
