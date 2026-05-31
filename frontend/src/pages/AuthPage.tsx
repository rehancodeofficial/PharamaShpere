import React, { useState } from 'react';
import { Pill, ShieldCheck, Mail, Lock, User, Building, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [subdomain, setSubdomain] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const response = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        // Store tokens
        localStorage.setItem('accessToken', response.accessToken || '');
        localStorage.setItem('idToken', response.idToken || '');
        localStorage.setItem('refreshToken', response.refreshToken || '');
        localStorage.setItem('userEmail', email);

        // Redirect to dashboard
        window.location.href = '/';
      } else {
        const response = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
            pharmacyName,
            subdomain,
          }),
        });

        setSuccess(response.message || 'Registration successful! You can now log in.');
        setIsLogin(true);
        // Clear fields
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-950 px-4 py-12 text-white">
      {/* Background gradients */}
      <div className="absolute -left-1/4 -top-1/4 h-[70vw] w-[70vw] rounded-full bg-brand-800/20 blur-3xl" />
      <div className="absolute -bottom-1/4 -right-1/4 h-[70vw] w-[70vw] rounded-full bg-accent-600/10 blur-3xl" />

      <div className="relative w-full max-w-[480px]">
        {/* Logo / Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-xl shadow-brand-950/40">
            <Pill className="h-8 w-8 animate-pulse" />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight">PharmaSphere</h1>
          <p className="mt-2 text-sm font-medium text-brand-200/70">Clinical Pharmacy Operations Suite</p>
        </div>

        {/* Auth Card */}
        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="flex border-b border-white/10 pb-4">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 pb-3 text-center text-sm font-bold transition-all duration-300 ${
                isLogin ? 'border-b-2 border-accent-400 text-white' : 'text-brand-200/50 hover:text-brand-100'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 pb-3 text-center text-sm font-bold transition-all duration-300 ${
                !isLogin ? 'border-b-2 border-accent-400 text-white' : 'text-brand-200/50 hover:text-brand-100'
              }`}
            >
              Register Pharmacy
            </button>
          </div>

          {/* Feedback states */}
          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-200">
              <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-200/70">
                    Pharmacy Name
                  </label>
                  <div className="relative mt-2 flex items-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 shadow-inner focus-within:border-accent-400">
                    <Building className="h-5 w-5 text-brand-200/60" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Al-Shifa Pharmacy"
                      value={pharmacyName}
                      onChange={(e) => setPharmacyName(e.target.value)}
                      className="ml-3 w-full bg-transparent text-sm font-medium outline-none placeholder:text-brand-200/35"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-200/70">
                    System Subdomain
                  </label>
                  <div className="relative mt-2 flex items-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 shadow-inner focus-within:border-accent-400">
                    <Building className="h-5 w-5 text-brand-200/60" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. main"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="ml-3 w-full bg-transparent text-sm font-medium outline-none placeholder:text-brand-200/35"
                    />
                    <span className="text-xs font-bold text-accent-400">.pharmasphere.local</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-200/70">
                    Full Name
                  </label>
                  <div className="relative mt-2 flex items-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 shadow-inner focus-within:border-accent-400">
                    <User className="h-5 w-5 text-brand-200/60" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Dr. Rehan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="ml-3 w-full bg-transparent text-sm font-medium outline-none placeholder:text-brand-200/35"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-200/70">
                Email Address
              </label>
              <div className="relative mt-2 flex items-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 shadow-inner focus-within:border-accent-400">
                <Mail className="h-5 w-5 text-brand-200/60" />
                <input
                  required
                  type="email"
                  placeholder="admin@pharmasphere.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ml-3 w-full bg-transparent text-sm font-medium outline-none placeholder:text-brand-200/35"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-200/70">
                Security Password
              </label>
              <div className="relative mt-2 flex items-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 shadow-inner focus-within:border-accent-400">
                <Lock className="h-5 w-5 text-brand-200/60" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ml-3 w-full bg-transparent text-sm font-medium outline-none placeholder:text-brand-200/35"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 py-4 font-bold text-white shadow-xl shadow-accent-600/25 transition-all duration-300 hover:bg-accent-600 active:scale-95 disabled:scale-100 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {isLogin ? 'Access Command Center' : 'Initialize Enterprise Suite'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Compliance Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold text-brand-200/50">
          <ShieldCheck className="h-4 w-4 text-accent-400" />
          <span>AES-256 Pharmacy Encryption Protocol</span>
        </div>
      </div>
    </div>
  );
};
