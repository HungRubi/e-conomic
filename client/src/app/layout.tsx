import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/providers';
import './globals.css';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin', 'vietnamese'],
	display: 'swap',
});

export const metadata: Metadata = {
	title: 'e-conomic — Mua sắm thông minh',
	description: 'Nền tảng thương mại điện tử thế hệ mới — AI-powered, mobile-first',
	icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='vi' suppressHydrationWarning className={`${inter.variable} h-full`} style={{ scrollbarGutter: 'stable' }}>
				<head>
					<link rel='preconnect' href='https://fonts.googleapis.com' crossOrigin='anonymous' />
					<link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
					<link rel='preconnect' href='https://images.unsplash.com' crossOrigin='anonymous' />
				</head>
			<body className='agent min-h-full flex flex-col text-fg-base antialiased' suppressHydrationWarning>
				<meta name='color-scheme' content='light dark' />
				<meta name='theme-color' content='#ffffff' media='(prefers-color-scheme: light)' />
				<meta name='theme-color' content='#0a0a0b' media='(prefers-color-scheme: dark)' />
				<a
					href='#main-content'
					className='fixed -top-full left-4 z-[100] rounded-b-lg bg-text px-4 py-2 text-sm font-semibold text-bg shadow-lg transition-all focus:top-0 focus:outline-none'
				>
					Chuyển đến nội dung chính
				</a>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
