import { InternalUserDetailPanel } from '@/components/users/internal-user-detail-panel';
import { RequireAdmin } from '@/components/require-admin';

export default function InternalUserDetailPage() {
	return (
		<RequireAdmin>
			<div className='rounded-xl border border-border bg-background p-4 sm:p-5 lg:p-6'>
				<InternalUserDetailPanel />
			</div>
		</RequireAdmin>
	);
}
