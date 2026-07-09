export interface Ad {
  id: string;
  image: string;
  link: string;
  alt: string;
  type: 'banner' | 'compact';
}

export const ads: Ad[] = [
  {
    id: 'ad-1',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=240&fit=crop',
    link: '/?sort=rating',
    alt: 'Miễn phí vận chuyển cho đơn trên 500K',
    type: 'banner',
  },
  {
    id: 'ad-2',
    image:
      'https://images.unsplash.com/photo-1553729459-afe8f2e2a7bd?w=1200&h=240&fit=crop',
    link: '/?sort=newest',
    alt: 'Giảm thêm 10% khi thanh toán online',
    type: 'banner',
  },
  {
    id: 'ad-3',
    image:
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&h=400&fit=crop',
    link: '/thoi-trang',
    alt: 'Bộ sưu tập thời trang hè 2026',
    type: 'compact',
  },
];
