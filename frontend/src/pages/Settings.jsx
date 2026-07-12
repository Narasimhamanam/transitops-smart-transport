import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import PageHeader from '../components/ui/PageHeader';
import Toast from '../components/ui/Toast';
import { User, Shield, Info, Key, Check } from 'lucide-react';
import { cn } from '../utils/cn';
import { changePassword } from '../services/auth.service';

export default function Settings() {
  const { user } = useAuth();
  const { toast, showToast, clearToast } = useToast();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('All password fields are required.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword({ oldPassword, newPassword, confirmPassword });
      showToast('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to change password.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const ROLE_LABELS = {
    FLEET_MANAGER:    'Fleet Manager (Full control over assets, dispatches, and finance)',
    DISPATCHER:       'Dispatcher (Create and dispatch operational trips)',
    SAFETY_OFFICER:   'Safety Officer (Inspect driver safety indexes and licenses)',
    FINANCIAL_ANALYST:'Financial Analyst (View financial and fuel metrics logs)',
  };

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Application Settings"
        subtitle="Manage account credentials, profile configurations, and ERP parameters"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Role Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* User profile */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <User className="w-4.5 h-4.5 text-brand-400" />
              <h2 className="text-slate-200 font-semibold">User Profile Details</h2>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500 font-medium mb-0.5">Full Name</dt>
                <dd className="text-slate-200 font-semibold">{user?.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium mb-0.5">Email Address</dt>
                <dd className="text-slate-200 font-semibold">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium mb-0.5">Account Status</dt>
                <dd className="text-success-400 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Active Profile
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium mb-0.5">Operational Role</dt>
                <dd className="text-brand-300 font-semibold font-mono text-xs mt-1">
                  {user?.role}
                </dd>
              </div>
              {user?.lastLogin && (
                <div className="sm:col-span-2">
                  <dt className="text-slate-500 font-medium mb-0.5">Last Login Time</dt>
                  <dd className="text-slate-300 font-medium text-xs font-mono">
                    {new Date(user.lastLogin).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Role detail description */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Shield className="w-4.5 h-4.5 text-brand-400" />
              <h2 className="text-slate-200 font-semibold">RBAC Permissions</h2>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Role Definition</p>
              <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                {ROLE_LABELS[user?.role] || 'No specific restrictions applied.'}
              </p>
            </div>
          </div>
        </div>

        {/* Change password column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Key className="w-4.5 h-4.5 text-brand-400" />
              <h2 className="text-slate-200 font-semibold font-medium">Change Password</h2>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="form-label">Old Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* App specs info */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Info className="w-4.5 h-4.5 text-brand-400" />
              <h2 className="text-slate-200 font-semibold font-medium">Application Info</h2>
            </div>
            <dl className="space-y-2 text-xs font-mono text-slate-500">
              <div className="flex justify-between py-1 border-b border-slate-850/50">
                <dt>ERP Version</dt>
                <dd className="text-slate-300">v1.1.0-Release</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850/50">
                <dt>Theme Config</dt>
                <dd className="text-slate-300">TransitOps Charcoal Dark</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt>API Connection</dt>
                <dd className="text-success-400">ONLINE (Port 5000)</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <Toast toast={toast} onDismiss={clearToast} />
    </div>
  );
}
