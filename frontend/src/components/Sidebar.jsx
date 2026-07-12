import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Route,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  Zap,
  Wrench,
  Fuel,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';
import { ROLE_LABELS, ROLE_MODULES } from '../config/permissions';

// Icon map by module slug
const MODULE_ICONS = {
  dashboard:   LayoutDashboard,
  vehicles:    Truck,
  trips:       Route,
  drivers:     Users,
  maintenance: Wrench,
  'fuel-logs': Fuel,
  expenses:    DollarSign,
  analytics:   BarChart3,
  'ai-insights': Zap,
  settings:    Settings,
};

// Human-readable labels by module slug
const MODULE_LABELS = {
  dashboard:     'Dashboard',
  vehicles:      'Vehicles',
  trips:         'Trips',
  drivers:       'Drivers',
  maintenance:   'Maintenance',
  'fuel-logs':   'Fuel Logbook',
  expenses:      'Expenses',
  analytics:     'Analytics',
  'ai-insights': 'AI Insights',
  settings:      'Settings',
};

// Section groupings (order matters — first matching group wins)
const SECTIONS = [
  { label: 'Overview',    modules: ['dashboard'] },
  { label: 'Operations',  modules: ['vehicles', 'trips', 'drivers', 'maintenance'] },
  { label: 'Finance',     modules: ['fuel-logs', 'expenses'] },
  { label: 'Compliance',  modules: ['analytics', 'ai-insights'] },
  { label: 'System',      modules: ['settings'] },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const role = user?.role;
  const allowedModules = ROLE_MODULES[role] ?? [];

  // Build filtered sections — only include sections that have ≥1 allowed module
  const filteredSections = SECTIONS
    .map((sec) => ({
      ...sec,
      items: sec.modules.filter((m) => allowedModules.includes(m)),
    }))
    .filter((sec) => sec.items.length > 0);

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full z-40 flex flex-col',
        'bg-surface-900 border-r border-slate-800',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-slate-800 px-4',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-glow">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-in">
            <p className="text-white font-bold text-base leading-tight">TransitOps</p>
            <p className="text-slate-500 text-[10px] font-medium tracking-widest uppercase">Transport ERP</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {filteredSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="section-title">{section.label}</p>
            )}
            {section.items.map((moduleSlug) => {
              const Icon = MODULE_ICONS[moduleSlug];
              const label = MODULE_LABELS[moduleSlug];
              return (
                <NavLink
                  key={moduleSlug}
                  to={`/${moduleSlug}`}
                  className={({ isActive }) =>
                    cn(isActive ? 'nav-item-active' : 'nav-item', 'mb-0.5', collapsed && 'justify-center px-0')
                  }
                  title={collapsed ? label : undefined}
                >
                  {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                  {!collapsed && <span className="animate-in">{label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User profile footer */}
      <div className={cn(
        'border-t border-slate-800 p-3',
        collapsed ? 'flex justify-center' : ''
      )}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-slate-500 text-xs truncate">{ROLE_LABELS[role] ?? role}</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-[72px] w-6 h-6 bg-surface-900 border border-slate-700',
          'rounded-full flex items-center justify-center',
          'hover:bg-slate-800 hover:border-brand-500 transition-all duration-200',
          'text-slate-400 hover:text-brand-400 shadow-md z-50'
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft className={cn('w-3.5 h-3.5 transition-transform duration-300', collapsed && 'rotate-180')} />
      </button>
    </aside>
  );
}
