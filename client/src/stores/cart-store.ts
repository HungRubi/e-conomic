import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
	id: string;
	productId: string;
	name: string;
	price: number;
	image: string;
	quantity: number;
	size?: string;
	color?: string;
}

interface CartState {
	items: CartItem[];
	addItem: (item: Omit<CartItem, 'id'>) => void;
	removeItem: (id: string) => void;
	updateQuantity: (id: string, qty: number) => void;
	clearCart: () => void;
	totalItems: () => number;
	totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			items: [],
			addItem: item =>
				set(state => {
					const existing = state.items.find(
						i => i.productId === item.productId && i.size === item.size && i.color === item.color
					);
					if (existing) {
						return {
							items: state.items.map(i =>
								i.productId === item.productId && i.size === item.size && i.color === item.color
									? { ...i, quantity: i.quantity + item.quantity }
									: i
							),
						};
					}
					return {
						items: [...state.items, { ...item, id: crypto.randomUUID() }],
					};
				}),
			removeItem: id =>
				set(state => ({
					items: state.items.filter(i => i.id !== id),
				})),
			updateQuantity: (id, qty) =>
				set(state => ({
					items:
						qty <= 0
							? state.items.filter(i => i.id !== id)
							: state.items.map(i => (i.id === id ? { ...i, quantity: qty } : i)),
				})),
			clearCart: () => set({ items: [] }),
			totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
			totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
		}),
		{ name: 'e-conomic-cart' }
	)
);
