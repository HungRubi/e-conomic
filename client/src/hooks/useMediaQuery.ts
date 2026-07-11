'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
	const getInitial = () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches);
	const [matches, setMatches] = useState(getInitial);

	useEffect(() => {
		const mql = window.matchMedia(query);
		const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	}, [query]);

	return matches;
}

export function useIsMobile() {
	return useMediaQuery('(max-width: 767px)');
}

export function useIsDesktop() {
	return useMediaQuery('(min-width: 768px)');
}
