export type GlobalConfig = Record<string, any>;
export function getGlobalConfig() { return Promise.resolve({}); }
export function updateGlobalConfig(_data: Record<string, any>) { return Promise.resolve(); }
