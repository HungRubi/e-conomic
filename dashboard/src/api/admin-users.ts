export type AdminUserRow = Record<string, any>;
export type ListUsersParams = Record<string, any>;
export type UserListResponse = { data: AdminUserRow[]; total: number; items?: AdminUserRow[] };
export function listUsers(_params?: any) {
	return Promise.resolve({ data: [], total: 0, items: [] });
}
export function getUser(_id: string) {
	return Promise.resolve(null);
}
export function createUser(_data: any) {
	return Promise.resolve({ id: 'new' });
}
export function updateUser(_id: string, _data: any) {
	return Promise.resolve();
}
export function deleteUser(_id: string) {
	return Promise.resolve();
}
export function fetchUserById(_id: string) {
	return getUser(_id);
}
export function createCustomer(_data: any) {
	return createUser(_data);
}
export function createInternalUser(_data: any) {
	return createUser(_data);
}
export function deleteCustomersBulk(_ids: string[]) {
	return Promise.resolve({ deleted: _ids.length });
}
export function fetchCustomers(_params?: any) {
	return listUsers(_params);
}
export function fetchInternalUsers(_params?: any) {
	return listUsers(_params);
}
