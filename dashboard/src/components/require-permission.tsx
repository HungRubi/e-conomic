import type { ReactNode } from 'react';

export function RequirePermission({ children, permission: _perm }: { children: ReactNode; permission?: string }) {
  return <>{children}</>;
}
