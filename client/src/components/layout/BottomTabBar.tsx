'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useAppTheme } from '@/providers/theme-provider';
import Badge from '@/components/ui/Badge';

const tabs = [
  { href: '/gio-hang', label: 'Giỏ hàng', icon: ShoppingBag, cart: true },
  { href: '/dang-nhap', label: 'Tài khoản', icon: User },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());
  const { mounted } = useAppTheme();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-bg/90 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ href, label, icon: Icon, cart }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 min-w-[64px] h-full ${
                active ? 'text-accent' : 'text-text2'
              } transition-colors`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {cart && mounted && totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -top-1.5 -right-2"
                  >
                    <Badge count={totalItems} />
                  </motion.span>
                )}
              </div>
              <span className="text-[10px] leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
