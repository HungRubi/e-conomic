import { InternalUsersPanel } from '@/components/users/internal-users-panel';
import { RequireAdmin } from '@/components/require-admin';

export default function InternalUsersPage() {
	return (
		<RequireAdmin>
			<div className='rounded-xl border border-border bg-background p-4 sm:p-5 lg:p-6'>
				<InternalUsersPanel />
			</div>
		</RequireAdmin>
	);
}
