export type AdminUserRow = Record<string, any>;
export type ListUsersParams = Record<string, any>;
export type UserListResponse = { data: AdminUserRow[]; total: number; items?: AdminUserRow[] };
export function listUsers(_params?: any) { return Promise.resolve({ data: [], total: 0, items: [] }); }
export function getUser(_id: string) { return Promise.resolve(null); }
export function createUser(_data: any) { return Promise.resolve({ id: "new" }); }
export function updateUser(_id: string, _data: any) { return Promise.resolve(); }
export function deleteUser(_id: string) { return Promise.resolve(); }
