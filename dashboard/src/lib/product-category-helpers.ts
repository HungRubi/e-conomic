import type { AdminProductCategoryRow } from '@/api/admin-product-categories';

/** Danh mục không có con trong tập `all`. */
export function isLeafCategory(cat: AdminProductCategoryRow, all: AdminProductCategoryRow[]): boolean {
	return !all.some(c => c.parentId === cat.id);
}

export function rootCategoryOf(cat: AdminProductCategoryRow, all: AdminProductCategoryRow[]): AdminProductCategoryRow {
	let cur = cat;
	while (cur.parentId) {
		const p = all.find(x => x.id === cur.parentId);
		if (!p) break;
		cur = p;
	}
	return cur;
}

/** Chuỗi hiển thị: Cha › Con › Cháu */
export function categoryBreadcrumb(cat: AdminProductCategoryRow, all: AdminProductCategoryRow[]): string {
	const parts: string[] = [];
	let cur: AdminProductCategoryRow | undefined = cat;
	while (cur) {
		parts.unshift(cur.name);
		const parentId: string | null | undefined = cur.parentId;
		cur = parentId ? all.find(x => x.id === parentId) : undefined;
	}
	return parts.join(' › ');
}

/** Gán sản phẩm: chỉ lá (không hiện nút cha nếu còn con — user chọn tận cùng nhánh). */
export function assignableLeafCategories(all: AdminProductCategoryRow[]): AdminProductCategoryRow[] {
	return all.filter(c => isLeafCategory(c, all)).sort((a, b) => categoryBreadcrumb(a, all).localeCompare(categoryBreadcrumb(b, all), 'vi'));
}

/**
 * Cha hợp lệ khi tạo/sửa danh mục: không phải chính nó / con cháu; cấp < 2 (DB tối đa 3 tầng 0–2).
 */
export function parentChoicesForCategoryForm(
	all: AdminProductCategoryRow[],
	editing: AdminProductCategoryRow | null
): AdminProductCategoryRow[] {
	const blocked = editing ? new Set([editing.id, ...collectDescendantIds(editing.id, all)]) : new Set<string>();
	return all
		.filter(c => !blocked.has(c.id) && c.level < 2)
		.sort((a, b) => categoryBreadcrumb(a, all).localeCompare(categoryBreadcrumb(b, all), 'vi'));
}

function collectDescendantIds(rootId: string, all: AdminProductCategoryRow[]): string[] {
	const byParent = new Map<string | null, AdminProductCategoryRow[]>();
	for (const c of all) {
		const k = c.parentId ?? null;
		if (!byParent.has(k)) byParent.set(k, []);
		byParent.get(k)!.push(c);
	}
	const out: string[] = [];
	function walk(id: string) {
		for (const ch of byParent.get(id) ?? []) {
			out.push(ch.id);
			walk(ch.id);
		}
	}
	walk(rootId);
	return out;
}

/** Đồng bộ `parent`/`child` chuỗi hiển thị website từ danh mục lá đã chọn. */
export function productParentChildFromLeaf(leaf: AdminProductCategoryRow, all: AdminProductCategoryRow[]): {
	parent: string;
	child: string;
} {
	const root = rootCategoryOf(leaf, all);
	return { parent: root.name, child: leaf.name };
}

/** Tìm lá khớp parent+child đã lưu (ưu tiên khớp cả root và tên lá). */
export function findLeafMatchingDisplay(
	all: AdminProductCategoryRow[],
	parentStr: string,
	childStr: string
): AdminProductCategoryRow | undefined {
	const p = parentStr.trim();
	const ch = childStr.trim();
	const leaves = assignableLeafCategories(all);
	const exact = leaves.find(leaf => {
		const root = rootCategoryOf(leaf, all);
		return root.name === p && leaf.name === ch;
	});
	if (exact) return exact;
	return leaves.find(leaf => leaf.name === ch);
}
