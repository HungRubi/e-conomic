import { ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

function contextWithRole(role: string | undefined) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as any;
}

describe('AdminGuard', () => {
  const guard = new AdminGuard();

  it('allows lowercase admin role', () => {
    expect(guard.canActivate(contextWithRole('admin'))).toBe(true);
  });

  it('allows uppercase ADMIN role for legacy dashboard data', () => {
    expect(guard.canActivate(contextWithRole('ADMIN'))).toBe(true);
  });

  it('rejects staff role', () => {
    expect(() => guard.canActivate(contextWithRole('staff'))).toThrow(ForbiddenException);
  });

  it('rejects anonymous requests', () => {
    expect(() => guard.canActivate(contextWithRole(undefined))).toThrow(ForbiddenException);
  });
});
