'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): Theme {
	if (typeof window === 'undefined') return 'dark';
	return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
	const [mounted, setMounted] = useState(false);
	const [theme, setThemeState] = useState<Theme>('dark');

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			const saved = window.localStorage.getItem('theme') as Theme | null;
			const initial = saved === 'light' || saved === 'dark' ? saved : getSystemTheme();
			setThemeState(initial);
			document.documentElement.classList.toggle('dark', initial === 'dark');
			document.documentElement.classList.toggle('light', initial === 'light');
			setMounted(true);
		});

		return () => cancelAnimationFrame(frame);
	}, []);

	const setTheme = useCallback((next: Theme) => {
		setThemeState(next);
		window.localStorage.setItem('theme', next);
		document.documentElement.classList.toggle('dark', next === 'dark');
		document.documentElement.classList.toggle('light', next === 'light');
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme(theme === 'dark' ? 'light' : 'dark');
	}, [setTheme, theme]);

	const value = useMemo(() => ({ theme, setTheme, toggleTheme, mounted }), [theme, setTheme, toggleTheme, mounted]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
	const context = useContext(ThemeContext);
	if (!context) throw new Error('useAppTheme must be used within AppThemeProvider');
	return context;
}
