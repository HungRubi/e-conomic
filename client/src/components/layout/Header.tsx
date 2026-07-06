'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppTheme } from '@/providers/theme-provider';
import {
  Search, ShoppingBag, Menu, User, Sun, Moon,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useCartStore } from '@/stores/cart-store';
import Badge from '@/components/ui/Badge';

export default function Header() {
  const { toggleSearch, toggleSidebar } = useUIStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const { theme, toggleTheme, mounted } = useAppTheme();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="max-w-[90rem] mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-text hover:text-accent transition-colors"
            >
              e‑conomic
            </Link>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-text2 hover:text-text hover:bg-surface2 transition-all"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === 'dark' ? (
                    <motion.span
                      key="sun"
                      initial={{ opacity: 0, rotate: -70 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 70 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Sun className="w-5 h-5" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="moon"
                      initial={{ opacity: 0, rotate: 70 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -70 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Moon className="w-5 h-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )}

            <button
              onClick={toggleSearch}
              className="p-2 rounded-full text-text2 hover:text-text hover:bg-surface2 transition-all"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/login"
              className="hidden md:flex p-2 rounded-full text-text2 hover:text-text hover:bg-surface2 transition-all"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>
            <Link
              href="/cart"
              className="relative p-2 rounded-full text-text2 hover:text-text hover:bg-surface2 transition-all"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -top-0.5 -right-0.5"
                >
                  <Badge count={totalItems} />
                </motion.span>
              )}
            </Link>
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-full text-text2 hover:text-text hover:bg-surface2 transition-all"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
