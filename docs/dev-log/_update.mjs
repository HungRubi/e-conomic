import fs from 'fs';
const fp = 'D:/e-conomic/docs/dev-log/INDEX.md';
let c = fs.readFileSync(fp, 'utf-8');

const insertAfter = '| Client — API integration (components) | Client | ⏳ Partial | components | ShopSidebar, homepage categories vẫn dùng mock — chờ TanStack Query |';

const newRows = `\n| Dashboard — Products add form simplified | Dashboard | ✅ Done | \`products-admin-panel.tsx\` | Bỏ jewelry-specific fields (variant, custom, bead, careTips, accent) |
| Dashboard — Detail crash fix & redesign | Dashboard | ✅ Done | \`product-detail-panel.tsx\` | careTips crash, price auto-zero bug, VN diacritics, price editable, multi-category, stats, auto-save images, SEO & OG Image |
| Dashboard — API layer fix | Dashboard | ✅ Done | \`api/admin-products.ts\` | toServerProductBody chỉ gửi field được set explicit |`;

if (c.includes(insertAfter)) {
  c = c.replace(insertAfter, insertAfter + newRows);
  fs.writeFileSync(fp, c, 'utf-8');
  console.log('OK – updated INDEX.md');
} else {
  console.log('NOT FOUND');
}
