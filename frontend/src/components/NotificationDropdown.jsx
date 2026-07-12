import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, ShieldAlert, CalendarClock, Route, MailCheck, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';
import { getNotifications, markAllAsRead, markAsRead, getUnreadCount } from '../services/notification.service';

const TYPE_ICONS = {
  LICENSE_EXPIRY: ShieldAlert,
  MAINTENANCE_DUE: CalendarClock,
  TRIP_SCHEDULED: Route,
  GENERAL: AlertTriangle,
};

const TYPE_COLORS = {
  LICENSE_EXPIRY: 'text-danger-400 bg-danger-500/10 border-danger-500/20',
  MAINTENANCE_DUE: 'text-warning-400 bg-warning-500/10 border-warning-500/20',
  TRIP_SCHEDULED: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
  GENERAL: 'text-slate-400 bg-slate-800/50 border-slate-700/50',
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: listResponse } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 15000,
  });

  const { data: countResponse } = useQuery({
    queryKey: ['unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 15000,
  });

  const list = listResponse?.data ?? [];
  const unreadCount = countResponse?.data?.count ?? 0;

  const readMutation = useMutation({
    mutationFn: (id) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  return (
    <div className="relative">
      <button
        id="notification-bell-btn"
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors mr-2 text-slate-400 hover:text-slate-200"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-danger-500"></span>
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface-900 border border-slate-800 rounded-xl shadow-card z-20 animate-in overflow-hidden max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-surface-900 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-slate-200 text-sm font-semibold">System Alerts</span>
                {unreadCount > 0 && (
                  <span className="badge-danger text-[10px] px-1.5 py-0.5">{unreadCount} New</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => readAllMutation.mutate()}
                  className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <MailCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-800/40 bg-surface-900">
              {list.length === 0 ? (
                <div className="px-4 py-10 text-center text-slate-500">
                  <p className="text-sm">No active alerts found.</p>
                  <p className="text-xs text-slate-600 mt-1">Systems are operating within compliance boundaries.</p>
                </div>
              ) : (
                list.map((item) => {
                  const Icon = TYPE_ICONS[item.type] || AlertTriangle;
                  return (
                    <div
                      key={item.id}
                      onClick={() => !item.read && readMutation.mutate(item.id)}
                      className={cn(
                        'flex items-start gap-3 p-3.5 cursor-pointer transition-colors',
                        item.read ? 'hover:bg-white/[0.01]' : 'bg-brand-500/[0.02] hover:bg-brand-500/[0.04]'
                      )}
                    >
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border', TYPE_COLORS[item.type])}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs leading-normal', item.read ? 'text-slate-300' : 'text-slate-100 font-semibold')}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">{item.message}</p>
                        <span className="text-[9px] text-slate-600 font-mono mt-1.5 block">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {!item.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
