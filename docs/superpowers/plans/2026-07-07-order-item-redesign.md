# Order Item Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/don-hang-cua-ban` order item UI with square images, product-card-like styling, clearer mobile/desktop layouts, and +1 font weight on key info.

**Architecture:** Keep implementation inside the existing route page. Preserve sample data, route tests, and current shop design tokens. Replace the current dashed two-column mini-card item layout with stacked product-card-inspired item rows.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Next Image, lucide-react, Node assert route test.

---

## File map

- Modify: `client/src/app/(shop)/don-hang-cua-ban/order-route.test.mjs`
  - Add RED assertions for square images, product-card-like card styling, no `xl:grid-cols-2`, mobile collapsed count, Inter-only route styling.
- Modify: `client/src/app/(shop)/don-hang-cua-ban/page.tsx`
  - Add helper constants for visible mobile item count.
  - Replace old order item grid with product-card-inspired stacked rows.
  - Ensure image wrappers use `aspect-square`, fixed width classes, rounded product-card style.
  - Reorder info: name, variant/qty, fulfillment, line price; keep SKU/brand de-emphasized.

## Task 1: RED route UI contract

**Files:**
- Modify: `client/src/app/(shop)/don-hang-cua-ban/order-route.test.mjs`
- Test: `client/src/app/(shop)/don-hang-cua-ban/order-route.test.mjs`

- [ ] **Step 1: Write the failing test**

Add these assertions after `const page = readFileSync(routePath, 'utf8');` existing checks:

```js
assert.match(page, /VISIBLE_MOBILE_ITEMS\s*=\s*2/, 'mobile order cards show two product rows before expand prompt');
assert.match(page, /aspect-square/, 'order item product images must be square');
assert.match(page, /w-22|size-22|h-22/, 'mobile order item image has a fixed square footprint');
assert.match(page, /md:w-28|md:size-28|md:h-28/, 'desktop order item image has a larger square footprint');
assert.match(page, /group\/order-item/, 'order items use product-card-like grouped hover styling');
assert.match(page, /Xem thêm/, 'multi-item mobile orders include a see-more prompt');
assert.doesNotMatch(page, /xl:grid-cols-2/, 'desktop order items should stack full-width instead of splitting into two columns');
assert.doesNotMatch(page, /border-dashed/, 'new order item UI should not reuse the old dashed mini-card style');
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node "D:\e-conomic\client\src\app\(shop)\don-hang-cua-ban\order-route.test.mjs"
```

Expected: FAIL on `VISIBLE_MOBILE_ITEMS` or `aspect-square` contract before implementation.

- [ ] **Step 3: Commit not needed yet**

This repo has active user changes. Do not commit unless user asks.

## Task 2: GREEN redesign page markup

**Files:**
- Modify: `client/src/app/(shop)/don-hang-cua-ban/page.tsx`
- Test: `client/src/app/(shop)/don-hang-cua-ban/order-route.test.mjs`

- [ ] **Step 1: Write minimal implementation**

Implement these concrete changes:

```tsx
const VISIBLE_MOBILE_ITEMS = 2;
```

Inside each `order` render:

```tsx
const extraItemCount = Math.max(order.items.length - VISIBLE_MOBILE_ITEMS, 0);
```

Replace:

```tsx
<div className="mt-4 grid gap-3 xl:grid-cols-2">
```

With:

```tsx
<div className="mt-4 space-y-3">
```

Replace each item wrapper classes with product-card-like row classes:

```tsx
className="group/order-item rounded-xl border border-border/80 bg-surface/90 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-border hover:bg-surface hover:shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
```

Replace item grid classes:

```tsx
<div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 md:grid-cols-[7rem_minmax(0,1fr)_auto] md:items-center md:gap-4">
```

Replace image wrapper:

```tsx
<div className="relative aspect-square w-22 overflow-hidden rounded-lg bg-surface2 md:w-28">
```

Use Image sizes:

```tsx
sizes="(max-width: 768px) 88px, 112px"
```

Keep text hierarchy:

```tsx
<h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text transition-colors group-hover/order-item:text-accent md:text-base">
```

Price emphasis:

```tsx
<p className="font-mono text-sm font-semibold tabular-nums text-text md:text-base">
```

Hide items after the first two on mobile, show all on desktop:

```tsx
className={`${itemIndex >= VISIBLE_MOBILE_ITEMS ? 'hidden md:block' : ''} group/order-item ...`}
```

Add mobile see-more row after item list:

```tsx
{extraItemCount > 0 && (
  <button
    type="button"
    className="flex h-10 w-full touch-manipulation items-center justify-center rounded-xl border border-border bg-surface2/60 text-sm font-semibold text-text transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-text/20 md:hidden"
  >
    Xem thêm {extraItemCount} sản phẩm
  </button>
)}
```

- [ ] **Step 2: Run test to verify it passes**

Run:

```powershell
node "D:\e-conomic\client\src\app\(shop)\don-hang-cua-ban\order-route.test.mjs"
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```powershell
pnpm --dir "D:\e-conomic\client" lint
```

Expected: PASS or only pre-existing unrelated warnings.

## Self-review

- Spec coverage: covers square images, mobile Shopee-like collapse, PC stacked full-width, product-card-like visual language, Inter inherited globally, +1 font weight on important text.
- Placeholder scan: no TBD/TODO/fill-later wording.
- Type consistency: `VISIBLE_MOBILE_ITEMS`, `extraItemCount`, `itemIndex` names consistent.
