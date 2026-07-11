/**
 * Tiện ích export CSV thuần TS — không thêm dependency.
 * Quy ước: dùng dấu phẩy + escape `"` theo RFC 4180; thêm BOM UTF-8 để Excel mở tốt.
 */

export type CsvColumn<T> = {
	header: string;
	accessor: (row: T) => unknown;
};

function escapeCell(value: unknown): string {
	if (value === null || value === undefined) return '';
	const str = value instanceof Date ? value.toISOString() : String(value);
	if (/[",\n\r]/.test(str)) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export function buildCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
	const head = columns.map(c => escapeCell(c.header)).join(',');
	const body = rows.map(row => columns.map(col => escapeCell(col.accessor(row))).join(',')).join('\r\n');
	return body ? `${head}\r\n${body}` : head;
}

export function downloadCsv(filename: string, csv: string): void {
	const BOM = '﻿';
	const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export function exportToCsv<T>(filename: string, rows: readonly T[], columns: readonly CsvColumn<T>[]): void {
	downloadCsv(filename, buildCsv(rows, columns));
}

export function dateStampForFile(): string {
	const d = new Date();
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	const h = String(d.getHours()).padStart(2, '0');
	const min = String(d.getMinutes()).padStart(2, '0');
	return `${y}${m}${day}-${h}${min}`;
}
