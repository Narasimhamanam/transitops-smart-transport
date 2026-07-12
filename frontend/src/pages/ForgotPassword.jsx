import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Zap, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '../services/auth.service';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPassword() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await forgotPassword(data);
      setSuccess(true);
    } catch (err) {
      setServerError(
        err?.response?.data?.message || 'Failed to send reset link. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-800/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md animate-in relative z-10">
        {/* Logo banner */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <p className="text-white font-bold text-lg">TransitOps</p>
        </div>

        <div className="card p-6 md:p-8 bg-surface-900 border border-slate-800/60 shadow-xl rounded-2xl">
          {success ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 bg-success-500/10 border border-success-500/30 text-success-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce-short">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Reset Link Logged</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                If the email is registered in our ERP database, the reset password link has been printed to the **backend server logs**.
              </p>
              <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl text-left text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Development Hint:</p>
                <p>Check the backend terminal console to grab the generated password reset URL.</p>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="btn-secondary w-full py-2 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1.5">Forgot Password?</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Enter your email address and we'll log a recovery link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* Server error */}
                {serverError && (
                  <div className="flex items-start gap-3 bg-danger-500/10 border border-danger-500/30 text-danger-400 px-4 py-3 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {serverError}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="form-label text-slate-300">Email address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@transitops.com"
                    autoComplete="email"
                    className={`form-input mt-1.5 ${
                      errors.email ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''
                    }`}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="form-error flex items-center gap-1 mt-1.5">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    'Request Reset Link'
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
                <Link
                  to="/login"
                  className="text-slate-500 hover:text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
