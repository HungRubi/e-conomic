import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  cartOpen: boolean;
  toggleSidebar: () => void;
  toggleSearch: () => void;
  toggleCart: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  searchOpen: false,
  cartOpen: false,
  toggleSidebar: () =>
    set((s) => ({ sidebarOpen: !s.sidebarOpen, searchOpen: false, cartOpen: false })),
  toggleSearch: () =>
    set((s) => ({ searchOpen: !s.searchOpen, sidebarOpen: false, cartOpen: false })),
  toggleCart: () =>
    set((s) => ({ cartOpen: !s.cartOpen, sidebarOpen: false, searchOpen: false })),
  closeAll: () => set({ sidebarOpen: false, searchOpen: false, cartOpen: false }),
}));
