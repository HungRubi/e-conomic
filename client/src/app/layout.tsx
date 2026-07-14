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
		<html lang='vi' suppressHydrationWarning className={`${inter.variable} h-full`}>
			<body className='agent min-h-full flex flex-col text-fg-base antialiased' suppressHydrationWarning>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
