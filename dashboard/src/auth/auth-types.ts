export interface AuthUser {
	id: string;
	email: string;
	name: string;
	role: 'admin' | 'staff' | 'customer' | 'ADMIN' | 'STAFF' | 'CUSTOMER';
	permissions: string[];
	avatarUrl?: string;
	totpEnabled?: boolean;
	totpBackupCodesRemaining?: number;
}
