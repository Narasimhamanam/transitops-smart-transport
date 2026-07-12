import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Zap, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../services/auth.service';

const schema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!token) {
      setServerError('No password reset token was provided. Please check your link.');
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) return;
    setServerError('');
    try {
      await resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setServerError(
        err?.response?.data?.message || 'Failed to reset password. The link may have expired.'
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
              <div className="w-12 h-12 bg-success-500/10 border border-success-500/30 text-success-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Password Updated</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your password has been reset successfully. Redirecting you to the sign-in page in a few seconds...
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="btn-primary w-full py-2 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Go to Login Now
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1.5">Reset Password</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Enter your new secure password below to update your account credentials.
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

                {/* Password fields only shown if token exists */}
                {token && (
                  <>
                    {/* Password */}
                    <div>
                      <label htmlFor="password" className="form-label text-slate-300">New Password</label>
                      <div className="relative mt-1.5">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className={`form-input pr-11 ${
                            errors.password ? 'border-danger-500 focus:border-danger-500' : ''
                          }`}
                          {...register('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="form-error flex items-center gap-1 mt-1.5">
                          <AlertCircle className="w-3 h-3" />
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="form-label text-slate-300">Confirm Password</label>
                      <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className={`form-input mt-1.5 ${
                          errors.confirmPassword ? 'border-danger-500 focus:border-danger-500' : ''
                        }`}
                        {...register('confirmPassword')}
                      />
                      {errors.confirmPassword && (
                        <p className="form-error flex items-center gap-1 mt-1.5">
                          <AlertCircle className="w-3 h-3" />
                          {errors.confirmPassword.message}
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
                          Updating Password...
                        </>
                      ) : (
                        'Save Password'
                      )}
                    </button>
                  </>
                )}
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
