import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────
// Image helpers — ALL products use real Unsplash product photos.
// Local path is an option for production uploads but NOT used in seed.
// ──────────────────────────────────────────────

function productImages(...urls: string[]): { images: string[]; thumbnailSmall: string; thumbnailLarge: string } {
  const withParams = urls.map((u) => `${u}?w=800&h=800&fit=crop&q=80`);
  return {
    images: withParams,
    thumbnailSmall: `${urls[0]}?w=400&h=400&fit=crop&q=80`,
    thumbnailLarge: `${urls[0]}?w=800&h=800&fit=crop&q=80`,
  };
}

function catImage(unsplashId: string): string {
  return `https://images.unsplash.com/${unsplashId}?w=800&h=800&fit=crop&q=80`;
}

function prodImageUrl(unsplashId: string): string {
  return `https://images.unsplash.com/${unsplashId}`;
}

// ──────────────────────────────────────────────
// CATEGORIES — 58 categories (12 roots, 40 children, 6 grandchildren)
// ──────────────────────────────────────────────

interface CatDef {
  name: string;
  slug: string;
  unsplash: string;
  children?: CatDef[];
  grandchildren?: CatDef[];
}

const categoryDefs: CatDef[] = [
  {
    name: 'Thời trang',
    slug: 'thoi-trang',
    unsplash: 'photo-1483985988355-763728e1935b',
    children: [
      { name: 'Áo nam', slug: 'ao-nam', unsplash: 'photo-1583743814966-8936f5b7be1a' },
      { name: 'Áo nữ', slug: 'ao-nu', unsplash: 'photo-1523381210434-271e8be1f52b' },
      { name: 'Quần nam', slug: 'quan-nam', unsplash: 'photo-1593032456461-3db40c31a61b' },
      { name: 'Quần nữ', slug: 'quan-nu', unsplash: 'photo-1594633312681-425c7b97ccd1' },
      {
        name: 'Đồ bộ & Đầm', slug: 'do-bo-dam', unsplash: 'photo-1595777457583-95e059d581b8',
        grandchildren: [
          { name: 'Đầm nữ', slug: 'dam-nu', unsplash: 'photo-1595777457583-95e059d581b8' },
          { name: 'Đồ bộ thể thao', slug: 'do-bo-the-thao', unsplash: 'photo-1593032456461-3db40c31a61b' },
        ],
      },
    ],
  },
  {
    name: 'Điện tử',
    slug: 'dien-tu',
    unsplash: 'photo-1498049794561-7780e7231661',
    children: [
      { name: 'Điện thoại', slug: 'dien-thoai', unsplash: 'photo-1598327105666-5b89351aff97' },
      { name: 'Laptop', slug: 'laptop', unsplash: 'photo-1496181133206-80ce9b88a853' },
      { name: 'Máy tính bảng', slug: 'may-tinh-bang', unsplash: 'photo-1544244015-0df4b3ffc6b0' },
      {
        name: 'Phụ kiện điện tử', slug: 'phu-kien-dien-tu', unsplash: 'photo-1498049794561-7780e7231661',
        grandchildren: [
          { name: 'Tai nghe', slug: 'tai-nghe', unsplash: 'photo-1505740420928-5e560c06d30e' },
          { name: 'Ốp lưng & Bao da', slug: 'op-lung', unsplash: 'photo-1498049794561-7780e7231661' },
          { name: 'Cáp & Sạc', slug: 'cap-sac', unsplash: 'photo-1498049794561-7780e7231661' },
        ],
      },
    ],
  },
  {
    name: 'Nhà cửa & Đời sống',
    slug: 'nha-cua-doi-song',
    unsplash: 'photo-1586023492125-27b2c045efd7',
    children: [
      { name: 'Nội thất', slug: 'noi-that', unsplash: 'photo-1555041469-a586c61ea9bc' },
      { name: 'Trang trí nhà', slug: 'trang-tri-nha', unsplash: 'photo-1586105251261-72a756497a11' },
      { name: 'Đồ dùng nhà bếp', slug: 'do-dung-nha-bep', unsplash: 'photo-1556909114-f6e7ad7d3136' },
      { name: 'Đồ dùng phòng tắm', slug: 'do-dung-phong-tam', unsplash: 'photo-1584622650111-993a426fbf0a' },
    ],
  },
  {
    name: 'Sắc đẹp',
    slug: 'sac-dep',
    unsplash: 'photo-1596462502278-27bfdc403348',
    children: [
      { name: 'Trang điểm', slug: 'trang-diem', unsplash: 'photo-1596462502278-27bfdc403348' },
      { name: 'Chăm sóc da', slug: 'cham-soc-da', unsplash: 'photo-1570194065650-d99fb4ee31c8' },
      { name: 'Nước hoa', slug: 'nuoc-hoa', unsplash: 'photo-1541643600914-78b084683601' },
      { name: 'Chăm sóc tóc', slug: 'cham-soc-toc', unsplash: 'photo-1560066984-138dadb4c035' },
    ],
  },
  {
    name: 'Thể thao & Du lịch',
    slug: 'the-thao-du-lich',
    unsplash: 'photo-1571019614242-c5c5dee9f50b',
    children: [
      { name: 'Dụng cụ thể thao', slug: 'dung-cu-the-thao', unsplash: 'photo-1571019614242-c5c5dee9f50b' },
      { name: 'Thời trang thể thao', slug: 'thoi-trang-the-thao', unsplash: 'photo-1571019614242-c5c5dee9f50b' },
      { name: 'Phụ kiện du lịch', slug: 'phu-kien-du-lich', unsplash: 'photo-1488646953014-85cb44e25828' },
    ],
  },
  {
    name: 'Sách & Văn phòng phẩm',
    slug: 'sach-van-phong-pham',
    unsplash: 'photo-1495446815901-a7297e633e8d',
    children: [
      { name: 'Sách', slug: 'sach', unsplash: 'photo-1495446815901-a7297e633e8d' },
      { name: 'Dụng cụ học tập', slug: 'dung-cu-hoc-tap', unsplash: 'photo-1495446815901-a7297e633e8d' },
      { name: 'Văn phòng phẩm', slug: 'van-phong-pham', unsplash: 'photo-1495446815901-a7297e633e8d' },
    ],
  },
  {
    name: 'Mẹ & Bé',
    slug: 'me-va-be',
    unsplash: 'photo-1515488042361-ee00e0ddd4e4',
    children: [
      { name: 'Đồ dùng cho bé', slug: 'do-dung-cho-be', unsplash: 'photo-1515488042361-ee00e0ddd4e4' },
      { name: 'Đồ chơi cho bé', slug: 'do-choi-cho-be', unsplash: 'photo-1515488042361-ee00e0ddd4e4' },
      { name: 'Mẹ bầu & Sau sinh', slug: 'me-bau', unsplash: 'photo-1515488042361-ee00e0ddd4e4' },
    ],
  },
  {
    name: 'Đồ chơi',
    slug: 'do-choi',
    unsplash: 'photo-1558060370-d644479cb6f7',
    children: [
      { name: 'Đồ chơi giáo dục', slug: 'do-choi-giao-duc', unsplash: 'photo-1558060370-d644479cb6f7' },
      { name: 'Đồ chơi mô hình', slug: 'do-choi-mo-hinh', unsplash: 'photo-1558060370-d644479cb6f7' },
      { name: 'Đồ chơi ngoài trời', slug: 'do-choi-ngoai-troi', unsplash: 'photo-1558060370-d644479cb6f7' },
    ],
  },
  {
    name: 'Ô tô & Xe máy',
    slug: 'oto-xe-may',
    unsplash: 'photo-1503376780353-7e6692767b70',
    children: [
      { name: 'Phụ tùng xe máy', slug: 'phu-tung-xe-may', unsplash: 'photo-1503376780353-7e6692767b70' },
      { name: 'Phụ kiện ô tô', slug: 'phu-kien-oto', unsplash: 'photo-1503376780353-7e6692767b70' },
      { name: 'Bảo dưỡng xe', slug: 'bao-duong-xe', unsplash: 'photo-1503376780353-7e6692767b70' },
    ],
  },
  {
    name: 'Thực phẩm & Đồ uống',
    slug: 'thuc-pham-do-uong',
    unsplash: 'photo-1542838132-92c53300491e',
    children: [
      { name: 'Đồ uống', slug: 'do-uong', unsplash: 'photo-1542838132-92c53300491e' },
      { name: 'Thực phẩm khô', slug: 'thuc-pham-kho', unsplash: 'photo-1542838132-92c53300491e' },
      { name: 'Nguyên liệu nấu ăn', slug: 'nguyen-lieu-nau-an', unsplash: 'photo-1542838132-92c53300491e' },
    ],
  },
  {
    name: 'Sức khỏe',
    slug: 'suc-khoe',
    unsplash: 'photo-1505751172876-fa1923c5c528',
    children: [
      { name: 'Thực phẩm chức năng', slug: 'thuc-pham-chuc-nang', unsplash: 'photo-1505751172876-fa1923c5c528' },
      { name: 'Dụng cụ y tế', slug: 'dung-cu-y-te', unsplash: 'photo-1505751172876-fa1923c5c528' },
      { name: 'Vitamin & Khoáng chất', slug: 'vitamin-khoang-chat', unsplash: 'photo-1505751172876-fa1923c5c528' },
    ],
  },
  {
    name: 'Thú cưng',
    slug: 'thu-cung',
    unsplash: 'photo-1450778869180-41d0601e046e',
    children: [
      { name: 'Thức ăn thú cưng', slug: 'thuc-an-thu-cung', unsplash: 'photo-1450778869180-41d0601e046e' },
      { name: 'Phụ kiện thú cưng', slug: 'phu-kien-thu-cung', unsplash: 'photo-1450778869180-41d0601e046e' },
      { name: 'Vệ sinh thú cưng', slug: 've-sinh-thu-cung', unsplash: 'photo-1450778869180-41d0601e046e' },
    ],
  },
];

// ──────────────────────────────────────────────
// PRODUCT DEFINITIONS — 80 products with real Unsplash product photos
 // Each product has hand-picked Unsplash photo IDs matching the category
// ──────────────────────────────────────────────

interface ProductDef {
  name: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  isFeatured?: boolean;
  unsplashImgs: string[]; // 1-3 Unsplash photo IDs
}

const products: ProductDef[] = [
  // ── THỜI TRANG (12) ──
  { name: 'Áo sơ mi nam tay dài', categorySlug: 'ao-nam', price: 350_000, compareAtPrice: 450_000, stock: 120, isFeatured: true, unsplashImgs: ['photo-1596755094514-f87e34085b2c'] },
  { name: 'Áo thun nam cổ tròn', categorySlug: 'ao-nam', price: 180_000, stock: 200, isFeatured: true, unsplashImgs: ['photo-1576566588028-4147f3842f27'] },
  { name: 'Áo sơ mi nữ công sở', categorySlug: 'ao-nu', price: 320_000, compareAtPrice: 420_000, stock: 85, unsplashImgs: ['photo-1594633312681-425c7b97ccd1'] },
  { name: 'Áo kiểu nữ tay bồng', categorySlug: 'ao-nu', price: 280_000, stock: 65, unsplashImgs: ['photo-1523381210434-271e8be1f52b'] },
  { name: 'Quần jean nam ống slim', categorySlug: 'quan-nam', price: 450_000, stock: 90, isFeatured: true, unsplashImgs: ['photo-1593032456461-3db40c31a61b'] },
  { name: 'Quần tây nam cao cấp', categorySlug: 'quan-nam', price: 520_000, compareAtPrice: 650_000, stock: 45, unsplashImgs: ['photo-1593032456461-3db40c31a61b'] },
  { name: 'Quần jean nữ ống suông', categorySlug: 'quan-nu', price: 420_000, stock: 75, unsplashImgs: ['photo-1594633312681-425c7b97ccd1'] },
  { name: 'Chân váy nữ xếp ly', categorySlug: 'quan-nu', price: 350_000, stock: 55, unsplashImgs: ['photo-1583494939058-8c06e5f88f2c'] },
  { name: 'Đầm nữ dự tiệc', categorySlug: 'dam-nu', price: 680_000, compareAtPrice: 890_000, stock: 30, isFeatured: true, unsplashImgs: ['photo-1595777457583-95e059d581b8', 'photo-1572804013309-59a88b7e92f1'] },
  { name: 'Đầm suông nữ công sở', categorySlug: 'dam-nu', price: 450_000, stock: 50, unsplashImgs: ['photo-1572804013309-59a88b7e92f1'] },
  { name: 'Đồ bộ thể thao nam', categorySlug: 'do-bo-the-thao', price: 380_000, stock: 60, unsplashImgs: ['photo-1571019614242-c5c5dee9f50b'] },
  { name: 'Đồ bộ thể thao nữ', categorySlug: 'do-bo-the-thao', price: 380_000, stock: 55, unsplashImgs: ['photo-1518314916381-77a37c970aa0'] },

  // ── ĐIỆN TỬ (12) ──
  { name: 'iPhone 15 Pro Max 256GB', categorySlug: 'dien-thoai', price: 29_990_000, compareAtPrice: 33_990_000, stock: 30, isFeatured: true, unsplashImgs: ['photo-1598327105666-5b89351aff97'] },
  { name: 'Samsung Galaxy S24 Ultra', categorySlug: 'dien-thoai', price: 26_990_000, stock: 25, isFeatured: true, unsplashImgs: ['photo-1610945415295-d0bbcb067bf8'] },
  { name: 'MacBook Air M3 15"', categorySlug: 'laptop', price: 32_990_000, stock: 20, isFeatured: true, unsplashImgs: ['photo-1496181133206-80ce9b88a853'] },
  { name: 'Dell XPS 15 Intel i9', categorySlug: 'laptop', price: 38_990_000, compareAtPrice: 42_990_000, stock: 12, unsplashImgs: ['photo-1496181133206-80ce9b88a853'] },
  { name: 'iPad Pro M4 11"', categorySlug: 'may-tinh-bang', price: 22_990_000, stock: 18, unsplashImgs: ['photo-1544244015-0df4b3ffc6b0'] },
  { name: 'Samsung Galaxy Tab S9 Ultra', categorySlug: 'may-tinh-bang', price: 19_990_000, compareAtPrice: 23_990_000, stock: 15, unsplashImgs: ['photo-1544244015-0df4b3ffc6b0'] },
  { name: 'Tai nghe AirPods Pro 2', categorySlug: 'tai-nghe', price: 5_490_000, stock: 50, isFeatured: true, unsplashImgs: ['photo-1505740420928-5e560c06d30e'] },
  { name: 'Tai nghe Sony WH-1000XM5', categorySlug: 'tai-nghe', price: 7_990_000, compareAtPrice: 9_990_000, stock: 35, unsplashImgs: ['photo-1505740420928-5e560c06d30e'] },
  { name: 'Ốp lưng iPhone 15 Pro', categorySlug: 'op-lung', price: 250_000, stock: 200, unsplashImgs: ['photo-1498049794561-7780e7231661'] },
  { name: 'Bao da iPad Magic Folio', categorySlug: 'op-lung', price: 1_290_000, stock: 80, unsplashImgs: ['photo-1498049794561-7780e7231661'] },
  { name: 'Cáp sạc USB-C 2m', categorySlug: 'cap-sac', price: 180_000, stock: 300, unsplashImgs: ['photo-1498049794561-7780e7231661'] },
  { name: 'Sạc nhanh GaN 65W', categorySlug: 'cap-sac', price: 590_000, compareAtPrice: 790_000, stock: 100, unsplashImgs: ['photo-1498049794561-7780e7231661'] },

  // ── NHÀ CỬA & ĐỜI SỐNG (7) ──
  { name: 'Bàn làm việc gỗ tự nhiên', categorySlug: 'noi-that', price: 3_500_000, stock: 25, isFeatured: true, unsplashImgs: ['photo-1555041469-a586c61ea9bc'] },
  { name: 'Ghế văn phòng lưới cao cấp', categorySlug: 'noi-that', price: 4_200_000, compareAtPrice: 5_200_000, stock: 20, unsplashImgs: ['photo-1555041469-a586c61ea9bc'] },
  { name: 'Đèn trang trí LED', categorySlug: 'trang-tri-nha', price: 450_000, stock: 80, unsplashImgs: ['photo-1586105251261-72a756497a11'] },
  { name: 'Tranh treo tường phong cảnh', categorySlug: 'trang-tri-nha', price: 890_000, stock: 40, unsplashImgs: ['photo-1513519245088-0e12902e5a38'] },
  { name: 'Bộ nồi inox 5 món', categorySlug: 'do-dung-nha-bep', price: 1_890_000, compareAtPrice: 2_500_000, stock: 35, isFeatured: true, unsplashImgs: ['photo-1556909114-f6e7ad7d3136'] },
  { name: 'Máy pha cà phê mini', categorySlug: 'do-dung-nha-bep', price: 2_200_000, stock: 30, unsplashImgs: ['photo-1556909114-f6e7ad7d3136'] },
  { name: 'Bộ khăn tắm cotton', categorySlug: 'do-dung-phong-tam', price: 350_000, stock: 100, unsplashImgs: ['photo-1584622650111-993a426fbf0a'] },

  // ── SẮC ĐẸP (7) ──
  { name: 'Son môi lì 3CE', categorySlug: 'trang-diem', price: 280_000, stock: 150, isFeatured: true, unsplashImgs: ['photo-1596462502278-27bfdc403348'] },
  { name: 'Phấn mắt bảng 12 màu', categorySlug: 'trang-diem', price: 520_000, stock: 60, unsplashImgs: ['photo-1596462502278-27bfdc403348'] },
  { name: 'Kem dưỡng ẩm La Roche-Posay', categorySlug: 'cham-soc-da', price: 650_000, stock: 80, isFeatured: true, unsplashImgs: ['photo-1570194065650-d99fb4ee31c8'] },
  { name: 'Sữa rửa mặt Cetaphil', categorySlug: 'cham-soc-da', price: 320_000, stock: 120, unsplashImgs: ['photo-1570194065650-d99fb4ee31c8'] },
  { name: 'Nước hoa Chanel No 5', categorySlug: 'nuoc-hoa', price: 4_500_000, compareAtPrice: 5_200_000, stock: 15, unsplashImgs: ['photo-1541643600914-78b084683601'] },
  { name: 'Dầu gội trị gàu', categorySlug: 'cham-soc-toc', price: 180_000, stock: 200, unsplashImgs: ['photo-1560066984-138dadb4c035'] },
  { name: 'Dầu xả phục hồi tóc', categorySlug: 'cham-soc-toc', price: 220_000, stock: 180, unsplashImgs: ['photo-1560066984-138dadb4c035'] },

  // ── THỂ THAO & DU LỊCH (6) ──
  { name: 'Bóng đá cao cấp', categorySlug: 'dung-cu-the-thao', price: 380_000, compareAtPrice: 480_000, stock: 45, unsplashImgs: ['photo-1571019614242-c5c5dee9f50b'] },
  { name: 'Vợt cầu lông chuyên nghiệp', categorySlug: 'dung-cu-the-thao', price: 1_200_000, stock: 25, isFeatured: true, unsplashImgs: ['photo-1571019614242-c5c5dee9f50b'] },
  { name: 'Áo thun thể thao nam', categorySlug: 'thoi-trang-the-thao', price: 220_000, stock: 100, unsplashImgs: ['photo-1518314916381-77a37c970aa0'] },
  { name: 'Quần short tập gym', categorySlug: 'thoi-trang-the-thao', price: 250_000, stock: 80, unsplashImgs: ['photo-1518314916381-77a37c970aa0'] },
  { name: 'Balo du lịch 50L', categorySlug: 'phu-kien-du-lich', price: 750_000, compareAtPrice: 990_000, stock: 40, isFeatured: true, unsplashImgs: ['photo-1488646953014-85cb44e25828'] },
  { name: 'Túi đựng đồ du lịch gấp gọn', categorySlug: 'phu-kien-du-lich', price: 180_000, stock: 150, unsplashImgs: ['photo-1488646953014-85cb44e25828'] },

  // ── SÁCH & VĂN PHÒNG (6) ──
  { name: 'Sách "Nhà giả kim" (Paulo Coelho)', categorySlug: 'sach', price: 95_000, stock: 200, isFeatured: true, unsplashImgs: ['photo-1495446815901-a7297e633e8d'] },
  { name: 'Sách "Tư duy nhanh và chậm"', categorySlug: 'sach', price: 150_000, stock: 80, unsplashImgs: ['photo-1495446815901-a7297e633e8d'] },
  { name: 'Bút lông bi đen xoá được', categorySlug: 'dung-cu-hoc-tap', price: 35_000, stock: 500, unsplashImgs: ['photo-1495446815901-a7297e633e8d'] },
  { name: 'Máy tính Casio fx-580VN X', categorySlug: 'dung-cu-hoc-tap', price: 450_000, stock: 60, unsplashImgs: ['photo-1495446815901-a7297e633e8d'] },
  { name: 'Sổ tay da A5', categorySlug: 'van-phong-pham', price: 120_000, stock: 200, unsplashImgs: ['photo-1495446815901-a7297e633e8d'] },
  { name: 'Bộ bút màu 24 màu', categorySlug: 'van-phong-pham', price: 85_000, stock: 150, unsplashImgs: ['photo-1495446815901-a7297e633e8d'] },

  // ── MẸ & BÉ (6) ──
  { name: 'Bình sữa chống sặc PPSU', categorySlug: 'do-dung-cho-be', price: 250_000, stock: 100, isFeatured: true, unsplashImgs: ['photo-1515488042361-ee00e0ddd4e4'] },
  { name: 'Máy tiệt trùng bình sữa', categorySlug: 'do-dung-cho-be', price: 1_100_000, stock: 30, unsplashImgs: ['photo-1515488042361-ee00e0ddd4e4'] },
  { name: 'Xe tập đi cho bé', categorySlug: 'do-choi-cho-be', price: 650_000, stock: 25, unsplashImgs: ['photo-1558060370-d644479cb6f7'] },
  { name: 'Thảm chơi cho bé', categorySlug: 'do-choi-cho-be', price: 420_000, stock: 40, unsplashImgs: ['photo-1558060370-d644479cb6f7'] },
  { name: 'Đai nịt bầu', categorySlug: 'me-bau', price: 350_000, stock: 60, unsplashImgs: ['photo-1515488042361-ee00e0ddd4e4'] },
  { name: 'Máy hút sữa điện tử', categorySlug: 'me-bau', price: 2_300_000, compareAtPrice: 2_800_000, stock: 20, isFeatured: true, unsplashImgs: ['photo-1515488042361-ee00e0ddd4e4'] },

  // ── ĐỒ CHƠI (5) ──
  { name: 'Bộ xếp hình Lego 1000 mảnh', categorySlug: 'do-choi-giao-duc', price: 550_000, stock: 40, isFeatured: true, unsplashImgs: ['photo-1558060370-d644479cb6f7'] },
  { name: 'Bảng chữ cái điện tử', categorySlug: 'do-choi-giao-duc', price: 320_000, stock: 60, unsplashImgs: ['photo-1558060370-d644479cb6f7'] },
  { name: 'Mô hình siêu xe Lamborghini', categorySlug: 'do-choi-mo-hinh', price: 450_000, stock: 35, unsplashImgs: ['photo-1558060370-d644479cb6f7'] },
  { name: 'Máy bay điều khiển từ xa', categorySlug: 'do-choi-ngoai-troi', price: 1_500_000, stock: 20, unsplashImgs: ['photo-1558060370-d644479cb6f7'] },
  { name: 'Ván trượt', categorySlug: 'do-choi-ngoai-troi', price: 1_200_000, stock: 15, unsplashImgs: ['photo-1558060370-d644479cb6f7'] },

  // ── Ô TÔ & XE MÁY (4) ──
  { name: 'Nón bảo hiểm 3/4', categorySlug: 'phu-tung-xe-may', price: 450_000, stock: 80, isFeatured: true, unsplashImgs: ['photo-1503376780353-7e6692767b70'] },
  { name: 'Bao tay lái xe máy', categorySlug: 'phu-tung-xe-may', price: 120_000, stock: 150, unsplashImgs: ['photo-1503376780353-7e6692767b70'] },
  { name: 'Camera hành trình ô tô', categorySlug: 'phu-kien-oto', price: 1_800_000, stock: 25, unsplashImgs: ['photo-1503376780353-7e6692767b70'] },
  { name: 'Nước rửa xe cao cấp', categorySlug: 'bao-duong-xe', price: 85_000, stock: 200, unsplashImgs: ['photo-1503376780353-7e6692767b70'] },

  // ── THỰC PHẨM & ĐỒ UỐNG (5) ──
  { name: 'Cà phê robusta Đăk Lăk 500g', categorySlug: 'do-uong', price: 120_000, stock: 150, isFeatured: true, unsplashImgs: ['photo-1542838132-92c53300491e'] },
  { name: 'Trà ô long thượng hạng', categorySlug: 'do-uong', price: 250_000, stock: 80, unsplashImgs: ['photo-1542838132-92c53300491e'] },
  { name: 'Hạt điều rang muối 500g', categorySlug: 'thuc-pham-kho', price: 85_000, stock: 200, unsplashImgs: ['photo-1542838132-92c53300491e'] },
  { name: 'Bánh tráng trộn Sa Tế', categorySlug: 'thuc-pham-kho', price: 35_000, stock: 300, unsplashImgs: ['photo-1542838132-92c53300491e'] },
  { name: 'Gia vị nấu phở bò', categorySlug: 'nguyen-lieu-nau-an', price: 45_000, stock: 250, unsplashImgs: ['photo-1542838132-92c53300491e'] },

  // ── SỨC KHỎE (5) ──
  { name: 'Viên uống vitamin C 1000mg', categorySlug: 'thuc-pham-chuc-nang', price: 180_000, stock: 120, isFeatured: true, unsplashImgs: ['photo-1505751172876-fa1923c5c528'] },
  { name: 'Tinh dầu hoa anh thảo', categorySlug: 'thuc-pham-chuc-nang', price: 320_000, stock: 80, unsplashImgs: ['photo-1505751172876-fa1923c5c528'] },
  { name: 'Nhiệt kế điện tử hồng ngoại', categorySlug: 'dung-cu-y-te', price: 450_000, stock: 50, unsplashImgs: ['photo-1505751172876-fa1923c5c528'] },
  { name: 'Máy đo huyết áp bắp tay', categorySlug: 'dung-cu-y-te', price: 680_000, stock: 35, unsplashImgs: ['photo-1505751172876-fa1923c5c528'] },
  { name: 'Vitamin tổng hợp cho người lớn', categorySlug: 'vitamin-khoang-chat', price: 250_000, stock: 100, unsplashImgs: ['photo-1505751172876-fa1923c5c528'] },

  // ── THÚ CƯNG (5) ──
  { name: 'Thức ăn cho chó Royal Canin 2kg', categorySlug: 'thuc-an-thu-cung', price: 280_000, stock: 60, isFeatured: true, unsplashImgs: ['photo-1450778869180-41d0601e046e'] },
  { name: 'Pate cho mèo Whiskas 12 hộp', categorySlug: 'thuc-an-thu-cung', price: 120_000, stock: 100, unsplashImgs: ['photo-1450778869180-41d0601e046e'] },
  { name: 'Đồ chơi cho chó ném bắt', categorySlug: 'phu-kien-thu-cung', price: 90_000, stock: 150, unsplashImgs: ['photo-1450778869180-41d0601e046e'] },
  { name: 'Vòng cổ chó da cao cấp', categorySlug: 'phu-kien-thu-cung', price: 180_000, stock: 80, unsplashImgs: ['photo-1450778869180-41d0601e046e'] },
  { name: 'Sữa tắm cho mèo', categorySlug: 've-sinh-thu-cung', price: 95_000, stock: 90, unsplashImgs: ['photo-1450778869180-41d0601e046e'] },
];

// ──────────────────────────────────────────────
// MAIN SEED
// ──────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Clear existing data ──
  console.log('  Clearing existing data...');
  await prisma.productCategoryMap.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.categoryAttribute.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.banner.deleteMany();
  console.log('  ✓ Done\n');

  // ── Create categories ──
  console.log('  Creating categories...');
  const categoryMap = new Map<string, string>(); // slug → id

  for (const l0 of categoryDefs) {
    const c0 = await prisma.productCategory.create({
      data: {
        name: l0.name, slug: l0.slug, image: catImage(l0.unsplash),
        description: `Danh mục ${l0.name}`,
        level: 0, path: `/${l0.slug}`, pathIds: [],
        status: 'ACTIVE', displayType: 'DEFAULT',
        showInMenu: true, showInHomepage: true, isFeatured: true,
        sortOrder: categoryDefs.indexOf(l0),
      },
    });
    categoryMap.set(l0.slug, c0.id);

    if (l0.children) {
      for (const l1 of l0.children) {
        const c1 = await prisma.productCategory.create({
          data: {
            parentId: c0.id, name: l1.name, slug: l1.slug, image: catImage(l1.unsplash),
            description: `Danh mục ${l1.name}`,
            level: 1, path: `/${l0.slug}/${l1.slug}`, pathIds: [c0.id],
            status: 'ACTIVE', displayType: 'DEFAULT',
            showInMenu: true, showInHomepage: l0.children!.indexOf(l1) < 2,
            isFeatured: false, sortOrder: l0.children!.indexOf(l1),
          },
        });
        categoryMap.set(l1.slug, c1.id);

        if (l1.grandchildren) {
          for (const l2 of l1.grandchildren) {
            const c2 = await prisma.productCategory.create({
              data: {
                parentId: c1.id, name: l2.name, slug: l2.slug, image: catImage(l2.unsplash),
                description: `Danh mục ${l2.name}`,
                level: 2, path: `/${l0.slug}/${l1.slug}/${l2.slug}`, pathIds: [c0.id, c1.id],
                status: 'ACTIVE', displayType: 'DEFAULT',
                showInMenu: true, showInHomepage: false,
                isFeatured: false, sortOrder: l1.grandchildren.indexOf(l2),
              },
            });
            categoryMap.set(l2.slug, c2.id);
          }
        }
      }
    }
  }
  console.log(`  ✓ Created ${categoryMap.size} categories\n`);

  // ── Create products ──
  console.log('  Creating products...');
  let productCount = 0;

  for (const def of products) {
    const slug = slugify(def.name);
    const catId = categoryMap.get(def.categorySlug);
    if (!catId) { console.warn(`  ⚠ "${def.categorySlug}" not found, skip "${def.name}"`); continue; }

    const imgs = productImages(...def.unsplashImgs.map((id) => prodImageUrl(id)));

    await prisma.product.create({
      data: {
        name: def.name, slug,
        sku: `SP-${String(productCount + 1).padStart(4, '0')}`,
        description: `${def.name} — sản phẩm chất lượng cao, phù hợp cho mọi nhu cầu sử dụng. Được kiểm định và đóng gói cẩn thận.`,
        shortDescription: `${def.name} chính hãng, giá tốt nhất thị trường.`,
        price: def.price,
        compareAtPrice: def.compareAtPrice ?? null,
        stockQuantity: def.stock,
        status: 'ACTIVE', type: 'SIMPLE',
        thumbnailSmall: imgs.thumbnailSmall,
        thumbnailLarge: imgs.thumbnailLarge,
        images: imgs.images,
        isFeatured: def.isFeatured ?? false,
        sortOrder: productCount,
        categories: { create: { categoryId: catId, isPrimary: true, sortOrder: 0 } },
        attributes: { thương_hiệu: 'E-conomic', chất_liệu: 'Cao cấp', xuất_xứ: 'Việt Nam' },
        metadata: { weight_g: Math.round(def.price / 1000) * 100 + 50 },
      },
    });
    productCount++;
  }
  console.log(`  ✓ Created ${productCount} products\n`);

  await seedBanners();

  const totalCategories = await prisma.productCategory.count();
  const totalProducts = await prisma.product.count();
  const totalBanners = await prisma.banner.count();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ✅ Seed complete!`);
  console.log(`  📁 Categories: ${totalCategories}`);
  console.log(`  📦 Products:   ${totalProducts}`);
  console.log(`  🖼  Banners:    ${totalBanners}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

// ──────────────────────────────────────────────
// BANNERS — 5 banners
// ──────────────────────────────────────────────

async function seedBanners() {
  console.log('  Creating banners...');

  await prisma.banner.createMany({
    data: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=640&fit=crop',
        linkUrl: '/thoi-trang',
        altText: 'Bộ sưu tập thời trang nam cao cấp — Thu Đông 2026',
        type: 'HERO',
        sortOrder: 0,
        active: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=640&fit=crop',
        linkUrl: '/trang-suc',
        altText: 'Trang sức & phụ kiện cao cấp — Tỏa sáng mọi khoảnh khắc',
        type: 'HERO',
        sortOrder: 1,
        active: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=240&fit=crop',
        linkUrl: '/?sort=rating',
        altText: 'Miễn phí vận chuyển cho đơn hàng trên 500K',
        type: 'BANNER',
        sortOrder: 0,
        active: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1553729459-afe8f2e2a7bd?w=1200&h=240&fit=crop',
        linkUrl: '/?sort=newest',
        altText: 'Sale mùa hè — Giảm đến 40% cho hàng ngàn sản phẩm',
        type: 'BANNER',
        sortOrder: 1,
        active: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&h=240&fit=crop',
        linkUrl: '/thoi-trang',
        altText: 'Bộ sưu tập Thu Đông 2026 — Thời thượng và đẳng cấp',
        type: 'BANNER',
        sortOrder: 2,
        active: true,
      },
    ],
  });
  console.log('  ✓ Created 5 banners\n');
}

function slugify(input: string): string {
  return input
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
