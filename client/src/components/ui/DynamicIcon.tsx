import { icons } from 'lucide-react';
import {
	Shirt, Monitor, Home, Sparkles, Trophy, BookOpen,
	Heart, ToyBrick, Car, ShoppingBasket, HeartPulse,
	Tablet, Watch, Footprints, Handbag, Clock, PawPrint, Headphones,
} from 'lucide-react';
import type { ReactNode, ComponentType } from 'react';

// Known category slugs → lucide icon component
const SLUG_ICONS: Record<string, ComponentType<{ className?: string }>> = {
	'thoi-trang': Shirt,
	'dien-tu': Monitor,
	'nha-cua': Home,
	'sac-dep': Sparkles,
	'the-thao': Trophy,
	'sach': BookOpen,
	'me-va-be': Heart,
	'do-choi': ToyBrick,
	'o-to-xe-may': Car,
	'bach-hoa': ShoppingBasket,
	'suc-khoe': HeartPulse,
	'thiet-bi-so': Tablet,
	'phu-kien': Watch,
	'giay-dep': Footprints,
	'tui-vi': Handbag,
	'dong-ho': Clock,
	'thu-cung': PawPrint,
	'am-thanh': Headphones,
};

interface DynamicIconProps {
  name: string;
  className?: string;
  fallback?: ReactNode;
}

export function DynamicIcon({ name, className = 'w-4 h-4', fallback }: DynamicIconProps) {
  // 1. Try slug map first
  const SlugIcon = SLUG_ICONS[name];
  if (SlugIcon) return <SlugIcon className={className} />;

  // 2. Try direct lucide icon name (PascalCase)
  const iconName = name
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, c => c.toUpperCase());
  const LucideIcon = (icons as Record<string, ComponentType<{ className?: string }>>)[iconName];
  if (LucideIcon) return <LucideIcon className={className} />;

  return <>{fallback}</>;
}
