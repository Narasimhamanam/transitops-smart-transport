import { useAuth } from './useAuth';
import { canCreate, canEdit, canDelete, canRead, canAccessRoute, ROLE_MODULES } from '../config/permissions';

/**
 * Hook to check RBAC permissions for the currently logged-in user.
 */
export function usePermission() {
  const { user } = useAuth();
  const role = user?.role ?? '';

  return {
    role,
    canCreateModule: (module) => canCreate(role, module),
    canEditModule:   (module) => canEdit(role, module),
    canDeleteModule: (module) => canDelete(role, module),
    canReadModule:   (module) => canRead(role, module),
    hasRoute:        (path) => canAccessRoute(role, path),
    allowedModules:  ROLE_MODULES[role] ?? [],
  };
}
