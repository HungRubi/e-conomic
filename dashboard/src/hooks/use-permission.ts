import { useAuth } from '@/auth/auth-context';
import { entityCrud, hasPermission, type EntityCrud, type Permission } from '@/auth/permissions';

/** React hook để gate UI theo role hiện tại. */
export function usePermission(permission: Permission): boolean {
	const { user } = useAuth();
	return hasPermission(user?.role, permission);
}

export function useHasRole(...roles: Array<'ADMIN' | 'STAFF'>): boolean {
	const { user } = useAuth();
	if (!user?.role) return false;
	return roles.includes(user.role as 'ADMIN' | 'STAFF');
}

/** Hook tiện cho detail panel: trả về 4 cờ canRead/canCreate/canUpdate/canDelete cho entity. */
export function useEntityCrud(entity: string): EntityCrud {
	const { user } = useAuth();
	return entityCrud(user?.role, entity);
}
