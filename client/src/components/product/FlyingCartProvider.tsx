'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface FlyingItem {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  imageUrl: string;
}

interface FlyingCartContextType {
  flyFromRect: (rect: DOMRect, imageUrl?: string) => void;
  bumpCart: number;
}

const FlyingCartContext = createContext<FlyingCartContextType>({
  flyFromRect: () => {},
  bumpCart: 0,
});

export function useFlyingCart() {
  return useContext(FlyingCartContext);
}

export function FlyingCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FlyingItem[]>([]);
  const [bump, setBump] = useState(0);

  const flyFromRect = useCallback((rect: DOMRect, imageUrl = '') => {
    const id = crypto.randomUUID();

    // Target: cart icon
    const cartEl = document.querySelector('[aria-label="Cart"]');
    let toX = window.innerWidth - 48;
    let toY = 20;
    if (cartEl) {
      const cr = cartEl.getBoundingClientRect();
      toX = cr.left + cr.width / 2;
      toY = cr.top + cr.height / 2;
    }

    setItems((prev) => [
      ...prev,
      {
        id,
        fromX: rect.left + rect.width / 2,
        fromY: rect.top + rect.height / 2,
        toX,
        toY,
        imageUrl,
      },
    ]);

    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      setBump((b) => b + 1); // trigger badge bounce
    }, 750);
  }, []);

  return (
    <FlyingCartContext.Provider value={{ flyFromRect, bumpCart: bump }}>
      {children}
      <AnimatePresence>
        {items.map((item) => {
          const midX = (item.fromX + item.toX) / 2;
          const midY = Math.min(item.fromY, item.toY) - 120;

          return (
            <motion.div
              key={item.id}
              className="fixed z-[200] pointer-events-none"
              initial={{
                left: item.fromX,
                top: item.fromY,
              }}
              animate={{
                left: [item.fromX, midX, item.toX],
                top: [item.fromY, midY, item.toY],
                scale: [0.4, 0.6, 0.2],
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.32, 0.72, 0.36, 1],
                times: [0, 0.5, 1],
              }}
              style={{ x: '-50%', y: '-50%' }}
            >
              {item.imageUrl ? (
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-[10px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.18)] ring-2 ring-white/30">
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-text shadow-[0_0_20px_rgba(0,0,0,0.15)]" />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </FlyingCartContext.Provider>
  );
}
