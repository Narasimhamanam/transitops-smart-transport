import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, ChevronDown, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import { cn } from '../utils/cn';

const ROLE_BADGE_COLORS = {
  FLEET_MANAGER:    'badge-brand',
  DISPATCHER:       'badge-info',
  SAFETY_OFFICER:   'badge-warning',
  FINANCIAL_ANALYST:'badge-success',
};

const ROLE_LABELS = {
  FLEET_MANAGER:    'Fleet Manager',
  DISPATCHER:       'Dispatcher',
  SAFETY_OFFICER:   'Safety Officer',
  FINANCIAL_ANALYST:'Financial Analyst',
};

function getBreadcrumb(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}

export default function Topbar({ collapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const breadcrumbs = getBreadcrumb(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 flex items-center',
        'bg-surface-950/80 backdrop-blur-md border-b border-slate-800',
        'px-6 transition-all duration-300',
        collapsed ? 'left-[72px]' : 'left-[260px]'
      )}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-slate-600 text-sm">TransitOps</span>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-slate-600">/</span>
            <span className={cn(
              'text-sm font-medium',
              i === breadcrumbs.length - 1 ? 'text-slate-200' : 'text-slate-500'
            )}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-surface-900 border border-slate-800 rounded-xl px-3 py-2 mr-4 w-56 group focus-within:border-brand-600 transition-colors">
        <Search className="w-4 h-4 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
        />
      </div>

      {/* Notifications */}
      <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors mr-2 text-slate-400 hover:text-slate-200">
        <Bell className="w-4.5 h-4.5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-surface-950" />
      </button>

      {/* User dropdown */}
      <div className="relative">
        <button
          id="user-menu-btn"
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-xl hover:bg-slate-800 transition-colors px-2 py-1.5"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-slate-200 text-sm font-semibold leading-tight">{user?.name}</p>
            <span className={cn(ROLE_BADGE_COLORS[user?.role] || 'badge-neutral', 'badge text-[10px] py-0')}>
              {ROLE_LABELS[user?.role]}
            </span>
          </div>
          <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform duration-200', dropdownOpen && 'rotate-180')} />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-52 bg-surface-900 border border-slate-800 rounded-xl shadow-card z-20 animate-in overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-slate-200 text-sm font-semibold">{user?.name}</p>
                <p className="text-slate-500 text-xs truncate">{user?.email}</p>
              </div>
              <div className="p-1.5">
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-danger-400 hover:bg-danger-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
