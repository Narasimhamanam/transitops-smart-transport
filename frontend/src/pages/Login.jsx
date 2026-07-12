import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Login failed. Please check your credentials.';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-surface-900 via-brand-950/30 to-surface-950 p-12 border-r border-slate-800 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-800/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-xl">TransitOps</p>
            <p className="text-slate-500 text-xs tracking-widest uppercase">Transport ERP</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Fleet intelligence<br />
            at your fingertips.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Manage your entire transport operation — from vehicles and drivers to
            routes, compliance, and finances — in one unified platform.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['Fleet Management', 'Trip Dispatch', 'Safety Compliance', 'Financial Analytics'].map((f) => (
              <span key={f} className="badge-neutral text-xs px-3 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { value: '99.9%', label: 'Uptime' },
            { value: '4 Roles', label: 'Access Control' },
            { value: 'Real-time', label: 'Operations' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-brand-400 text-2xl font-bold">{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <p className="text-white font-bold text-lg">TransitOps</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-slate-400">Sign in to your TransitOps account</p>
          </div>

          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Server error */}
            {serverError && (
              <div className="flex items-start gap-3 bg-danger-500/10 border border-danger-500/30 text-danger-400 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {serverError}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@transitops.com"
                autoComplete="email"
                className={`form-input ${errors.email ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="form-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`form-input pr-11 ${errors.password ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="form-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-surface-900 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Demo Credentials</p>
            <div className="space-y-2">
              {[
                { role: 'Fleet Manager',    email: 'fleet@transitops.com' },
                { role: 'Dispatcher',       email: 'dispatcher@transitops.com' },
                { role: 'Safety Officer',   email: 'safety@transitops.com' },
                { role: 'Financial Analyst',email: 'finance@transitops.com' },
              ].map((d) => (
                <div key={d.email} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{d.role}</span>
                  <span className="text-slate-500 font-mono">{d.email}</span>
                </div>
              ))}
              <div className="border-t border-slate-800 pt-2 mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Password (all)</span>
                <span className="text-brand-400 font-mono">Transit@123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
