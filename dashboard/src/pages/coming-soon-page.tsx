import { Link } from 'react-router-dom';
import { ConstructionIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ComingSoonPageProps = {
	title: string;
	description?: string;
	primaryCtaLabel?: string;
	primaryCtaTo?: string;
};

/** Trang “sắp ra mắt” thay cho `AdminPlaceholderPage` cũ — vẫn dùng cho các tab chưa có nghiệp vụ thật. */
export default function ComingSoonPage({
	title,
	description,
	primaryCtaLabel = 'Về Tổng quan',
	primaryCtaTo = '/',
}: ComingSoonPageProps) {
	return (
		<div className='flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center'>
			<div className='flex size-12 items-center justify-center rounded-full bg-muted ring-1 ring-border'>
				<ConstructionIcon className='size-5 text-muted-foreground' aria-hidden />
			</div>
			<div className='space-y-1'>
				<h1 className='text-xl font-semibold tracking-tight'>{title}</h1>
				{description ? (
					<p className='text-sm text-muted-foreground'>{description}</p>
				) : (
					<p className='text-sm text-muted-foreground'>
						Tính năng đang được hoàn thiện. Sẽ ra mắt ở các bản cập nhật tiếp theo.
					</p>
				)}
			</div>
			<Button asChild type='button' variant='outline'>
				<Link to={primaryCtaTo}>{primaryCtaLabel}</Link>
			</Button>
		</div>
	);
}
