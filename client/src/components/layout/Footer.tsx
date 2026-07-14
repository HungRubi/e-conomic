'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Mail, ArrowRight, Check } from 'lucide-react';

const footerSections = [
	{
		title: 'Hỗ trợ',
		links: [
			{ href: '#', label: 'Trung tâm trợ giúp' },
			{ href: '#', label: 'Chính sách đổi trả' },
			{ href: '#', label: 'Chính sách bảo mật' },
			{ href: '#', label: 'Điều khoản dịch vụ' },
		],
	},
	{
		title: 'Về chúng tôi',
		links: [
			{ href: '#', label: 'Giới thiệu' },
			{ href: '#', label: 'Tuyển dụng' },
			{ href: '#', label: 'Liên hệ' },
		],
	},
	{
		title: 'Mua sắm',
		links: [
			{ href: '/', label: 'Tất cả sản phẩm' },
			{ href: '#', label: 'Khuyến mãi' },
			{ href: '#', label: 'Bộ sưu tập' },
		],
	},
];

export default function Footer() {
	const [email, setEmail] = useState('');
	const [nlStatus, setNlStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

	const handleNewsletter = (e: FormEvent) => {
		e.preventDefault();
		if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			setNlStatus('error');
			return;
		}
		setNlStatus('loading');
		setTimeout(() => {
			setNlStatus('success');
			setEmail('');
			setTimeout(() => setNlStatus('idle'), 3000);
		}, 800);
	};
	return (
		<footer className='border-t border-border bg-surface'>
			<div className='max-w-[90rem] mx-auto px-3 md:px-4 py-5'>
				{/* Grid */}
				<div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
					{/* Brand */}
					<div className='col-span-2 md:col-span-1'>
						<Link href='/' className='text-lg font-bold tracking-tight text-text'>
							e‑conomic
						</Link>
						<p className='mt-2 txt-medium text-text2 leading-relaxed'>
							Nền tảng thương mại điện tử thế hệ mới — AI-powered, mobile-first. Mua sắm thông minh hơn
							mỗi ngày.
						</p>
					</div>

					{/* Link sections */}
					{footerSections.map(section => (
						<div key={section.title}>
							<h3 className='txt-medium-plus text-text mb-3'>{section.title}</h3>
							<ul className='space-y-2'>
								{section.links.map(link => (
									<li key={link.label}>
										<Link
											href={link.href}
											className='focus-ring txt-medium text-text2 hover:text-text transition-colors'
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Newsletter */}
				<div className='mt-10 pt-8 border-t border-border'>
					<div className='max-w-md'>
						<h3 className='txt-medium-plus text-text mb-2'>Đăng ký nhận tin</h3>
						<p className='txt-medium text-text2 mb-3'>Nhận ưu đãi & sản phẩm mới qua email.</p>
						<form onSubmit={handleNewsletter} className='flex gap-2'>
							<div className='relative flex-1'>
								<Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text2' />
								<input
									type='email'
									placeholder='Email của bạn'
									className='w-full h-10 pl-10 pr-3 rounded-full bg-surface2 border border-border text-text txt-medium placeholder-text2 focus:outline-none focus:border-border focus:ring-2 focus:ring-border/60 transition-colors'
								/>
							</div>
							<button
								type='submit' disabled={nlStatus === 'loading' || nlStatus === 'success'}
								className='h-10 px-4 rounded-full bg-accent text-white txt-medium-plus hover:brightness-110 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50'
							>
								{nlStatus === 'success' ? <><Check className='w-4 h-4' /> Đã đăng ký</> : nlStatus === 'loading' ? 'Đang xử lý...' : <><span>Đăng ký</span><ArrowRight className='w-4 h-4' /></>}
							</button>
						</form>
					</div>
				</div>

				{/* Bottom bar */}
				<div className='mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 txt-xsmall text-text2'>
					<p>© 2026 e-conomic. Tất cả quyền được bảo lưu.</p>
					<div className='flex gap-4'>
						<Link href='#' className='hover:text-text transition-colors'>
							Chính sách bảo mật
						</Link>
						<Link href='#' className='hover:text-text transition-colors'>
							Điều khoản
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
