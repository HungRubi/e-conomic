export type AuditLogRow = Record<string, any>;
export type ListAuditLogsParams = Record<string, any>;
export function listAuditLogs(_params?: any) { return Promise.resolve({ data: [], total: 0, totalPages: 0 }); }
