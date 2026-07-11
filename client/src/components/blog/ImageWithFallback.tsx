'use client';

import { useState, type ImgHTMLAttributes } from 'react';

const FALLBACKS = [
	'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop',
	'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&h=500&fit=crop',
	'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop',
	'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800&h=500&fit=crop',
];

interface ImageWithFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
	fallback?: string;
}

export default function ImageWithFallback({ src, alt, fallback, className = '', ...rest }: ImageWithFallbackProps) {
	const [imgSrc, setImgSrc] = useState(src);
	const [fallbackIdx, setFallbackIdx] = useState(0);

	const getNextFallback = () => {
		const pool = fallback ? [fallback, ...FALLBACKS] : FALLBACKS;
		const idx = fallbackIdx % pool.length;
		setFallbackIdx(p => p + 1);
		return pool[idx];
	};

	return (
		/* eslint-disable-next-line @next/next/no-img-element */
		<img src={imgSrc} alt={alt} className={className} onError={() => setImgSrc(getNextFallback())} {...rest} />
	);
}
