// Product types
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  category?: Category;
  variants: ProductVariant[];
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size?: string;
  color?: string;
  sku: string;
  stock: number;
  price: number;
  image?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  image?: string;
  parentId?: string;
  children?: Category[];
}

// Cart
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

// Chat
export interface Conversation {
  id: string;
  userId?: string;
  title: string;
  status: ConvStatus;
  assignedTo?: string;
  lastMessageAt: string;
  createdAt: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  userId?: string;
  role: MsgRole;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type ConvStatus = 'OPEN' | 'ASSIGNED' | 'CLOSED';
export type MsgRole = 'user' | 'ai' | 'staff';
