import type { AdminUserRow } from '@/api/admin-users';

export const ROLE_LABEL: Record<AdminUserRow['role'], string> = {
	ADMIN: 'Quản trị',
	STAFF: 'Nhân viên',
	CUSTOMER: 'Khách hàng',
};

export function fmtUserDate(iso: string): string {
	try {
		return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
	} catch {
		return iso;
	}
}
