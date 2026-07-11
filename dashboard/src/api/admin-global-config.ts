export type GlobalConfig = Record<string, any>;
export function getGlobalConfig() {
	return Promise.resolve({});
}
export function updateGlobalConfig(_data: Record<string, any>) {
	return Promise.resolve({});
}
export function fetchAdminGlobalConfig() {
	return getGlobalConfig();
}
export function patchAdminGlobalConfig(_data: any) {
	return updateGlobalConfig(_data);
}
export type GlobalConfigRow = GlobalConfig;
export type GlobalConfigPatch = GlobalConfig;
