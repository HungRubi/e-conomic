'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlyingItem {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface FlyingCartContextType {
  flyFromRect: (rect: DOMRect) => void;
}

const FlyingCartContext = createContext<FlyingCartContextType>({
  flyFromRect: () => {},
});

export function useFlyingCart() {
  return useContext(FlyingCartContext);
}

export function FlyingCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FlyingItem[]>([]);

  const flyFromRect = useCallback((rect: DOMRect) => {
    const id = crypto.randomUUID();
    // Target: cart button position
    const cartEl = document.querySelector('[aria-label="Cart"]');
    let toX = window.innerWidth - 60;
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
      },
    ]);

    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, 900);
  }, []);

  return (
    <FlyingCartContext.Provider value={{ flyFromRect }}>
      {children}
      <AnimatePresence>
        {items.map((item) => {
          const midX = (item.fromX + item.toX) / 2;
          const midY = Math.min(item.fromY, item.toY) - 80;

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
                opacity: [1, 0.72, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.75,
                ease: [0.25, 0.46, 0.45, 0.94],
                times: [0, 0.45, 1],
              }}
              style={{ x: '-50%', y: '-50%' }}
            >
              <div className="w-5 h-5 rounded-full bg-accent shadow-[0_0_16px_var(--accent-glow)]" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </FlyingCartContext.Provider>
  );
}
