import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const routePath = new URL('./page.tsx', import.meta.url);
const detailRoutePath = new URL('./[id]/page.tsx', import.meta.url);
const header = readFileSync(new URL('../../../components/layout/Header.tsx', import.meta.url), 'utf8');
const sidebar = readFileSync(new URL('../../../components/layout/ShopSidebar.tsx', import.meta.url), 'utf8');

assert.equal(existsSync(routePath), true, 'don-hang-cua-ban route page exists');
assert.equal(existsSync(detailRoutePath), true, 'don-hang-cua-ban/[id] detail route page exists');
assert.match(header, /href: '\/don-hang-cua-ban'/, 'account order link uses /don-hang-cua-ban');
assert.match(sidebar, /href="\/don-hang-cua-ban"/, 'sidebar order lookup uses /don-hang-cua-ban');
assert.doesNotMatch(header, /href: '\/orders'/, 'header no longer points at missing /orders route');
assert.doesNotMatch(sidebar, /href="\/orders"/, 'sidebar no longer points at missing /orders route');

const page = readFileSync(routePath, 'utf8');
const detailPage = readFileSync(detailRoutePath, 'utf8');

// List page assertions
assert.match(page, /VISIBLE_MOBILE_ITEMS\s*=\s*2/, 'mobile order cards show two product rows before expand prompt');
assert.match(page, /aspect-square/, 'order item product images must be square');
assert.match(page, /w-22|size-22|h-22/, 'mobile order item image has a fixed square footprint');
assert.match(page, /md:w-28|md:size-28|md:h-28/, 'desktop order item image has a larger square footprint');
assert.match(page, /group\/order-item/, 'order items use product-card-like grouped hover styling');
assert.match(page, /Xem thêm/, 'multi-item mobile orders include a see-more prompt');
assert.doesNotMatch(
	page,
	/xl:grid-cols-2/,
	'desktop order items should stack full-width instead of splitting into two columns'
);
assert.doesNotMatch(page, /border-dashed/, 'new order item UI should not reuse the old dashed mini-card style');
assert.match(page, /divide-y divide-border/, 'products in one order share one block separated by horizontal borders');
assert.doesNotMatch(
	page,
	/overflow-hidden rounded-xl border border-border\/80 bg-surface2\/35/,
	'products block should not add nested outer border/padding'
);
assert.doesNotMatch(
	page,
	/group\/order-item rounded-xl border border-border\/80 bg-surface\/90 p-2/,
	'products in one order should not be individually card-wrapped'
);
assert.doesNotMatch(page, /Xem sản phẩm/, 'order item should not repeat per-product view product links');
assert.doesNotMatch(page, />Đơn giá</, 'order list should hide unit price until detail page');
assert.doesNotMatch(page, />Tạm tính</, 'order list should hide line total until detail page');
assert.doesNotMatch(page, /p-3 transition-colors/, 'product list rows should not add extra padding');
assert.equal((page.match(/Mua lại/g) || []).length, 1, 'each order card has one shared repurchase action in source');
assert.equal((page.match(/Hỗ trợ/g) || []).length, 1, 'each order card has one shared support action in source');
assert.match(
	page,
	/<div className="flex items-center justify-between gap-4 sm:justify-end">[\s\S]*Tổng[\s\S]*formatCurrency\(order\.total\)[\s\S]*<div className="flex flex-wrap items-center gap-2">[\s\S]*Mua lại[\s\S]*Hỗ trợ/,
	'footer places total before shared actions'
);
assert.doesNotMatch(
	page,
	/<h2 className="font-mono text-base font-semibold/,
	'order code should not be over-emphasized mono semibold'
);
assert.doesNotMatch(
	page,
	/<p className="mt-1 font-mono font-semibold tabular-nums text-text">/,
	'unit price should not be over-emphasized'
);
assert.doesNotMatch(
	page,
	/<p className="mt-1 font-mono text-sm font-semibold tabular-nums text-text md:text-base">/,
	'line total should not be over-emphasized'
);
assert.match(page, /sampleOrders/, 'orders page includes sample orders for UI preview');
assert.match(page, /Đang giao/, 'orders page shows in-progress sample status');
assert.match(page, /Đã giao/, 'orders page shows delivered sample status');
assert.doesNotMatch(page, /<aside/, 'orders page should not render overview shopping sidebar');
assert.doesNotMatch(page, /Tổng quan/, 'orders page should not show overview shopping block');
assert.match(page, /w-full/, 'orders list uses full available shop content width after sidebar removal');
assert.match(page, /unitPrice/, 'order items expose unit price for detailed product rows');
assert.match(page, /lineTotal/, 'order items expose line total for detailed product rows');
assert.match(page, /Mua lại/, 'order items include repurchase action');
assert.match(page, /Hỗ trợ/, 'order items include support action');
assert.match(page, /SKU/, 'order items show SKU detail');
assert.match(
	page,
	/mt-4 divide-y divide-border\/70/,
	'order products use simple separators without nested card chrome'
);
assert.doesNotMatch(page, /max-w-5xl/, 'orders list should not cap width after overview sidebar removal');
assert.doesNotMatch(page, /Chưa có đơn hàng/, 'sample preview should not show empty-state as primary UI');

// Detail page assertions
assert.match(detailPage, /getOrderById/, 'detail page uses getOrderById for lookup');
assert.match(detailPage, /notFound/, 'detail page calls notFound for missing orders');
assert.match(detailPage, /lg:grid-cols-\[minmax\(0,1fr\)_23rem\]/, 'detail page uses two-column layout');
assert.match(detailPage, /Đơn giá/, 'detail page shows unit price');
assert.match(detailPage, /Tạm tính/, 'detail page shows line total');
assert.match(detailPage, /Trạng thái đơn hàng/, 'detail page has timeline section');
assert.match(detailPage, /Chi tiết thanh toán/, 'detail page has payment summary');
assert.match(detailPage, /Sản phẩm đã mua/, 'detail page has product listing section');
assert.match(detailPage, /Chính sách & hỗ trợ/, 'detail page has policy & support section');
assert.match(detailPage, /formatCurrency\(order\.total\)/, 'detail page shows order total from order data');
assert.match(detailPage, /@medusajs\/icons/, 'detail page uses Medusa icons');
assert.match(detailPage, /Badge/, 'detail page uses Medusa Badge');
assert.match(detailPage, /Button/, 'detail page uses Medusa Button (via wrapper)');
assert.doesNotMatch(detailPage, /unitPrice/, 'detail page hides raw unitPrice field name (renders as Đơn giá)');
assert.match(detailPage, /Quay lại đơn hàng/, 'detail page has back link');
assert.match(detailPage, /lg:sticky lg:top-24/, 'detail page sidebar is sticky on large screens');
