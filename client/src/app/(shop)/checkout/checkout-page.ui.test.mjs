import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');

assert.match(source, /grid gap-6 lg:grid-cols-\[minmax\(0,1fr\)_23rem\]/, 'checkout uses same content + 23rem summary rhythm as cart page');
assert.match(source, /sticky lg:top-24/, 'desktop order summary stays sticky like cart page');
assert.match(source, /Mua thêm .*để được miễn phí vận chuyển/, 'free-shipping progress copy is present');
assert.match(source, /Bảo mật|Thanh toán an toàn/, 'trust reassurance is visible');
assert.match(source, /Giao 2-4 ngày/, 'delivery expectation is visible');
assert.doesNotMatch(source, /max-w-3xl/, 'checkout must not use narrow standalone width');
