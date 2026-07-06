export type EntityCrud = {
  entity: string;
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  canCreate?: boolean;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
};
export type Permission = string;
export function hasPermission(_user: { permissions: string[] } | string | null, _perm: Permission): boolean {
  return true;
}
export function entityCrud(_user: { permissions: string[] } | string | null, _entity: string): EntityCrud {
  return { entity: _entity, create: true, read: true, update: true, delete: true, canCreate: true, canRead: true, canUpdate: true, canDelete: true };
}

