/**
 * TransitOps RBAC Permission Matrix
 * Single source of truth for all role-based access control.
 */

export const ROLE_LABELS = {
  FLEET_MANAGER:    'Fleet Manager',
  DISPATCHER:       'Driver', // UI Label is "Driver"
  SAFETY_OFFICER:   'Safety Officer',
  FINANCIAL_ANALYST:'Financial Analyst',
};

export const ROLE_MODULES = {
  FLEET_MANAGER: ['dashboard', 'vehicles', 'maintenance', 'analytics', 'ai-insights', 'settings'],
  DISPATCHER:    ['dashboard', 'trips'],
  SAFETY_OFFICER:['dashboard', 'drivers'],
  FINANCIAL_ANALYST: ['dashboard', 'fuel-logs', 'expenses', 'analytics'],
};

export const MODULE_PERMISSIONS = {
  vehicles: {
    FLEET_MANAGER:    { canRead: true, canCreate: true, canEdit: true, canDelete: true },
  },
  drivers: {
    SAFETY_OFFICER:   { canRead: true, canCreate: false, canEdit: true, canDelete: false }, // Safety Officer can edit safety score & status, but not create/delete
  },
  trips: {
    DISPATCHER:       { canRead: true, canCreate: true, canEdit: true, canDelete: true },
  },
  maintenance: {
    FLEET_MANAGER:    { canRead: true, canCreate: true, canEdit: true, canDelete: true },
  },
  'fuel-logs': {
    FINANCIAL_ANALYST:{ canRead: true, canCreate: true, canEdit: true, canDelete: true },
  },
  expenses: {
    FINANCIAL_ANALYST:{ canRead: true, canCreate: true, canEdit: true, canDelete: true },
  },
  analytics: {
    FLEET_MANAGER:    { canRead: true, canCreate: false, canEdit: false, canDelete: false },
    SAFETY_OFFICER:   { canRead: false, canCreate: false, canEdit: false, canDelete: false }, // No analytics for Safety Officer
    FINANCIAL_ANALYST:{ canRead: true, canCreate: false, canEdit: false, canDelete: false },
  },
  'ai-insights': {
    FLEET_MANAGER:    { canRead: true, canCreate: false, canEdit: false, canDelete: false },
  },
  settings: {
    FLEET_MANAGER:    { canRead: true, canCreate: true, canEdit: true, canDelete: true },
  },
};

export function canCreate(role, module) {
  return MODULE_PERMISSIONS[module]?.[role]?.canCreate === true;
}

export function canEdit(role, module) {
  return MODULE_PERMISSIONS[module]?.[role]?.canEdit === true;
}

export function canDelete(role, module) {
  return MODULE_PERMISSIONS[module]?.[role]?.canDelete === true;
}

export function canRead(role, module) {
  return MODULE_PERMISSIONS[module]?.[role]?.canRead === true;
}

export function canAccessRoute(role, path) {
  const segment = path.replace(/^\//, '').split('/')[0];
  return ROLE_MODULES[role]?.includes(segment) ?? false;
}

export const DASHBOARD_QUICK_ACTIONS = {
  FLEET_MANAGER: [
    { label: 'Add Vehicle',          href: '/vehicles',    icon: 'Truck'   },
    { label: 'Schedule Maintenance', href: '/maintenance', icon: 'Wrench'  },
  ],
  DISPATCHER: [
    { label: 'Create Trip', href: '/trips', icon: 'Route' },
  ],
  SAFETY_OFFICER: [
    { label: 'Update Driver Safety Score',  href: '/drivers', icon: 'Users' },
  ],
  FINANCIAL_ANALYST: [
    { label: 'Log Fuel',    href: '/fuel-logs', icon: 'Fuel'       },
    { label: 'Add Expense', href: '/expenses',  icon: 'DollarSign' },
  ],
};
