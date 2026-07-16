/**
 * Test cho discount synchronization logic:
 * - normalizeProduct: server → dashboard (compareAtPrice → discountPercent)
 * - toServerProductBody: dashboard → server (discountPercent → compareAtPrice)
 *
 * Chạy: node --experimental-strip-types src/api/__tests__/discount-sync.test.ts
 * Hoặc copy 2 function vào file test thực tế.
 */

// ── Mô phỏng 2 function cần test ──

type AdminProductRow = {
  id: string;
  name: string;
  price: string | number;
  priceVnd?: number;
  priceLabel?: string;
  image?: string | null;
  compareAtPrice?: string | number | null;
  discountPercent?: number;
  thumbnailLarge?: string | null;
  thumbnailSmall?: string | null;
  images: string[];
  type: string;
  status: string;
  slug: string;
  stockQuantity: number;
  trackStock: boolean;
  allowBackorder: boolean;
  sortOrder: number;
  isFeatured: boolean;
  categories?: unknown[];
  variants?: unknown[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

function normalizeProduct(row: AdminProductRow): AdminProductRow {
  const priceNumber = Number(row.price ?? 0);
  const image =
    (row as any).image ??
    row.thumbnailLarge ??
    row.thumbnailSmall ??
    row.images?.[0] ??
    null;
  const compareAt = row.compareAtPrice ? Number(row.compareAtPrice) : null;
  return {
    ...row,
    image,
    priceVnd: (row as any).priceVnd ?? priceNumber,
    priceLabel:
      (row as any).priceLabel ??
      `${priceNumber.toLocaleString('vi-VN')}đ`,
    type: row.type === 'SIMPLE' ? 'PHYSICAL' : row.type,
    discountPercent:
      (row as any).discountPercent ??
      (compareAt && priceNumber > 0
        ? Math.round((1 - priceNumber / compareAt) * 100)
        : 0),
  } as AdminProductRow;
}

function toServerProductBody(data: Record<string, unknown>): Record<string, unknown> {
  const images = Array.isArray(data.images)
    ? (data.images as any[])
        .map((img: any) => (typeof img === 'string' ? img : img?.url))
        .filter(Boolean)
    : [];
  const out: Record<string, unknown> = {};
  if (data.name !== undefined) out.name = data.name;
  if (data.slug !== undefined) out.slug = data.slug;
  if (data.sku !== undefined) out.sku = data.sku;
  if (data.description !== undefined) out.description = data.description;
  if (data.shortDescription !== undefined) out.shortDescription = data.shortDescription;
  if (data.status !== undefined) out.status = data.status;
  if (data.type !== undefined) out.type = data.type;
  if (data.isFeatured !== undefined) out.isFeatured = data.isFeatured;
  if (data.sortOrder !== undefined) out.sortOrder = data.sortOrder;

  if (data.price !== undefined || data.priceVnd !== undefined) {
    out.price = (data.price ?? data.priceVnd ?? 0) as number;
  }

  // Discount: compute compareAtPrice from discountPercent
  if (data.discountPercent !== undefined) {
    const basePrice = Number(data.price ?? data.priceVnd ?? 0);
    if (Number(data.discountPercent) > 0 && basePrice > 0) {
      out.compareAtPrice = Math.round(basePrice / (1 - Number(data.discountPercent) / 100));
    } else {
      out.compareAtPrice = null;
    }
  } else if (data.compareAtPrice !== undefined) {
    out.compareAtPrice = data.compareAtPrice !== null ? Number(data.compareAtPrice) : null;
  }

  if (data.thumbnailSmall !== undefined) out.thumbnailSmall = data.thumbnailSmall;
  if (data.thumbnailLarge !== undefined) out.thumbnailLarge = data.thumbnailLarge;
  if (data.images !== undefined) out.images = images;

  if ((data as any).stockQuantity !== undefined) out.stockQuantity = (data as any).stockQuantity;
  if ((data as any).trackStock !== undefined) out.trackStock = (data as any).trackStock;
  if ((data as any).allowBackorder !== undefined) out.allowBackorder = (data as any).allowBackorder;

  if (data.seoTitle !== undefined) out.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) out.seoDescription = data.seoDescription;
  if (data.seoKeywords !== undefined) out.seoKeywords = data.seoKeywords;

  if ((data as any).weight !== undefined) out.weight = (data as any).weight;
  if ((data as any).width !== undefined) out.width = (data as any).width;
  if ((data as any).height !== undefined) out.height = (data as any).height;
  if ((data as any).length !== undefined) out.length = (data as any).length;

  if (data.categoryIds !== undefined) {
    out.categoryIds = data.categoryIds;
    out.primaryCategoryId = data.primaryCategoryId ?? (data.categoryIds as string[])?.[0];
  }

  return out;
}

// ── Tests ──

let passed = 0;
let failed = 0;

function assert(label: string, ok: boolean) {
  if (ok) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`);
    failed++;
  }
}

function assertEqual<T>(label: string, actual: T, expected: T) {
  const ok = actual === expected;
  if (ok) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    failed++;
  }
}

function assertDeepEqual(label: string, actual: unknown, expected: unknown, path = '') {
  if (typeof actual !== typeof expected) {
    console.error(`  ❌ ${label} — type mismatch at ${path}: ${typeof actual} ≠ ${typeof expected}`);
    console.error(`      actual: ${JSON.stringify(actual)}, expected: ${JSON.stringify(expected)}`);
    failed++;
    return;
  }
  if (actual && expected && typeof actual === 'object' && typeof expected === 'object') {
    const a = actual as Record<string, unknown>;
    const e = expected as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(a), ...Object.keys(e)]);
    for (const k of allKeys) {
      assertDeepEqual(label, a[k], e[k], `${path}.${k}`);
    }
    return;
  }
  if (actual === expected) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label} — at ${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    failed++;
  }
}

console.log('\n── toServerProductBody ──\n');

// Test 1: discountPercent → compareAtPrice
{
  const result = toServerProductBody({ price: 299000, discountPercent: 40 } as any);
  assertEqual('price gửi đi đúng', result.price as number, 299000);
  assertEqual('compareAtPrice = price / (1 - 0.4)', result.compareAtPrice as number, 498333);
}

// Test 2: discountPercent = 0 → xóa compareAtPrice (set null)
{
  const result = toServerProductBody({ price: 299000, discountPercent: 0 } as any);
  assertEqual('discountPercent=0 → compareAtPrice = null', result.compareAtPrice, null);
}

// Test 3: không gửi discountPercent, có compareAtPrice → giữ nguyên
{
  const result = toServerProductBody({ price: 299000, compareAtPrice: 499000 } as any);
  assertEqual('compareAtPrice giữ nguyên khi không có discountPercent', result.compareAtPrice as number, 499000);
}

// Test 4: discountPercent ưu tiên hơn compareAtPrice
{
  const result = toServerProductBody({ price: 299000, compareAtPrice: 999999, discountPercent: 40 } as any);
  assertEqual('discountPercent ưu tiên, compareAtPrice bị ghi đè', result.compareAtPrice as number, 498333);
}

// Test 5: không price → compareAtPrice = null kèm nullish
{
  const result = toServerProductBody({ discountPercent: 20 } as any);
  assertEqual('không price → compareAtPrice = null', result.compareAtPrice, null);
}

console.log('\n── normalizeProduct ──\n');

// Test 6: compareAtPrice → discountPercent
{
  const result = normalizeProduct({ id: 'p1', name: 'Test', price: 300000, compareAtPrice: 500000, images: [], type: 'SIMPLE', status: 'ACTIVE', slug: 'test', stockQuantity: 10, trackStock: true, allowBackorder: false, sortOrder: 0, isFeatured: false, createdAt: '', updatedAt: '' } as any);
  assertEqual('discountPercent từ compareAtPrice', result.discountPercent as number, 40);
}

// Test 7: không compareAtPrice → discountPercent = 0
{
  const result = normalizeProduct({ id: 'p2', name: 'No Discount', price: 299000, images: [], type: 'SIMPLE', status: 'ACTIVE', slug: 'no-discount', stockQuantity: 10, trackStock: true, allowBackorder: false, sortOrder: 0, isFeatured: false, createdAt: '', updatedAt: '' } as any);
  assertEqual('không compareAtPrice → discountPercent = 0', result.discountPercent as number, 0);
}

// Test 8: compareAtPrice < price → discountPercent âm (lỗi data, vẫn tính đúng toán học)
{
  const result = normalizeProduct({ id: 'p3', name: 'Bad Discount', price: 500000, compareAtPrice: 300000, images: [], type: 'SIMPLE', status: 'ACTIVE', slug: 'bad', stockQuantity: 10, trackStock: true, allowBackorder: false, sortOrder: 0, isFeatured: false, createdAt: '', updatedAt: '' } as any);
  assertEqual('compareAtPrice < price → discountPercent âm', result.discountPercent as number, -67);
}

console.log('\n── Round-trip ──\n');

// Test 9: round-trip: discountPercent → compareAtPrice → discountPercent
{
  const original = { price: 200000, discountPercent: 25 };
  const body = toServerProductBody(original as any);
  const expectedCompareAt = Math.round(200000 / 0.75); // ~266667
  const roundtrip = normalizeProduct({ id: 'r1', name: 'RT', price: original.price, compareAtPrice: expectedCompareAt, images: [], type: 'SIMPLE', status: 'ACTIVE', slug: 'rt', stockQuantity: 10, trackStock: true, allowBackorder: false, sortOrder: 0, isFeatured: false, createdAt: '', updatedAt: '' } as any);
  // Sau round-trip, discountPercent có thể lệch 1% do làm tròn
  const diff = Math.abs((roundtrip.discountPercent ?? 0) - original.discountPercent);
  assert(`round-trip lệch ≤ 1% (thực tế: ${diff}%)`, diff <= 1);
}

// Test 10: toServerProductBody giữ nguyên các field không liên quan
{
  const result = toServerProductBody({ name: 'Test', seoTitle: 'SEO Title', seoDescription: 'SEO Desc', seoKeywords: ['a', 'b'], isFeatured: true, sortOrder: 5 } as any);
  assertEqual('seoTitle', result.seoTitle as string, 'SEO Title');
  assertEqual('seoDescription', result.seoDescription as string, 'SEO Desc');
  assertDeepEqual('seoKeywords', result.seoKeywords, ['a', 'b']);
  assertEqual('isFeatured', result.isFeatured as boolean, true);
  assertEqual('sortOrder', result.sortOrder as number, 5);
}

// ── Kết quả ──
console.log(`\n${'─'.repeat(40)}`);
console.log(`Kết quả: ${passed} passed, ${failed} failed / ${passed + failed} tests`);
if (failed > 0) process.exit(1);
