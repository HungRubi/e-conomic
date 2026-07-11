export type AuditLogRow = Record<string, any>;
export type ListAuditLogsParams = Record<string, any>;

const empty = { data: [], items: [], total: 0, page: 0, totalPages: 1 };

export function listAuditLogs(
	_params?: any
): Promise<{ data: AuditLogRow[]; items: AuditLogRow[]; total: number; page: number; totalPages: number }> {
	return Promise.resolve(empty);
}
