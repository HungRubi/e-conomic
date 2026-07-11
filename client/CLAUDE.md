# e-conomic Client

Next.js 16 e-commerce client — App Router, Tailwind v4, Zustand, TanStack Query.

## Stack

| Layer        | Tech                                            |
| ------------ | ----------------------------------------------- |
| Framework    | Next.js 16 (App Router)                         |
| Language     | TypeScript 5                                    |
| Styling      | Tailwind v4 + CSS variables (light/dark tokens) |
| Client state | Zustand 5 (cart, UI)                            |
| Server state | TanStack Query 5                                |
| Animation    | Framer Motion 12                                |
| Icons        | lucide-react                                    |
| Font         | Inter                                           |
| Package      | pnpm                                            |

## Key dirs

```
src/
  app/          — Next.js App Router pages
    (shop)/     — shop layout: cart, checkout, products [...slug]
    (auth)/     — auth layout: login, register
  components/   — reusable components
    layout/     — Header, Footer, BottomTabBar, ShopSidebar
    ui/         — Button, Input, Select, Badge, Skeleton, Sheet, Modal, Toast, QuantitySelector, StarRating
    product/    — ProductCard, FlyingCartProvider
  stores/       — Zustand stores: cart-store, ui-store
  hooks/        — useMediaQuery
  lib/          — constants, mock products, mock categories
  types/        — shared types
  providers/    — theme-provider, query-provider
```

## Routes

| Path               | Notes                                        |
| ------------------ | -------------------------------------------- |
| `/`                | Home — featured, new arrivals, category grid |
| `/cart`            | Cart with selection, quantity                |
| `/checkout`        | Checkout steps (shipping → payment → review) |
| `/san-pham/[slug]` | Product detail                               |
| `/login`           | Login                                        |
| `/register`        | Register                                     |
| `/:slug`           | Category product listing                     |

## Design tokens

CSS vars in `globals.css`: bg, surface, surface2, border, text, text2, accent, green/orange/red/purple/teal. Cards: `rounded-xl border border-border/80 bg-surface/90 shadow-[0_18px_60px_rgba(0,0,0,0.06)]`.

## Commands

```bash
pnpm dev        # start dev server
pnpm build      # type-check + build
pnpm lint       # eslint
pnpm start      # production server
```
