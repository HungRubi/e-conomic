'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

const FALLBACKS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800&h=500&fit=crop',
];

export default function ImageWithFallback({
  src,
  alt,
  fallback,
  className = '',
  fill,
  sizes,
  priority,
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [fallbackIdx, setFallbackIdx] = useState(0);

  const getNextFallback = () => {
    const pool = fallback ? [fallback, ...FALLBACKS] : FALLBACKS;
    const idx = fallbackIdx % pool.length;
    setFallbackIdx((p) => p + 1);
    return pool[idx];
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setImgSrc(getNextFallback())}
    />
  );
}
