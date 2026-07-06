import * as React from 'react';
import { CheckIcon, SearchIcon, XIcon } from 'lucide-react';

import type { AdminProductMaterialRow } from '@/api/admin-product-materials';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { cn } from '@/lib/utils';

const MATERIAL_FALLBACK_IMG = '/images/logo.png';
const KIND_LABEL: Record<AdminProductMaterialRow['kind'], string> = {
	BEAD: 'Hạt',
	STONE: 'Đá',
	CHARM: 'Charm',
	ACCESSORY: 'Phụ kiện',
};

type MaterialPickerDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	materials: AdminProductMaterialRow[];
	initialSelectedIds: string[];
	minSelected?: number;
	onConfirm: (ids: string[]) => void;
};

export function MaterialPickerDialog({
	open,
	onOpenChange,
	materials,
	initialSelectedIds,
	minSelected = 10,
	onConfirm,
}: MaterialPickerDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{open ? (
				<MaterialPickerBody
					materials={materials}
					initialSelectedIds={initialSelectedIds}
					minSelected={minSelected}
					onConfirm={ids => {
						onConfirm(ids);
						onOpenChange(false);
					}}
					onCancel={() => onOpenChange(false)}
				/>
			) : null}
		</Dialog>
	);
}

type MaterialPickerBodyProps = {
	materials: AdminProductMaterialRow[];
	initialSelectedIds: string[];
	minSelected: number;
	onConfirm: (ids: string[]) => void;
	onCancel: () => void;
};

function MaterialPickerBody({
	materials,
	initialSelectedIds,
	minSelected,
	onConfirm,
	onCancel,
}: MaterialPickerBodyProps) {
	const [draft, setDraft] = React.useState<string[]>(initialSelectedIds);
	const [query, setQuery] = React.useState('');
	const [activeKind, setActiveKind] = React.useState<AdminProductMaterialRow['kind'] | 'all'>('all');

	const availableKinds = React.useMemo(() => {
		const set = new Set<AdminProductMaterialRow['kind']>();
		for (const m of materials) set.add(m.kind);
		return Array.from(set);
	}, [materials]);

	const filtered = React.useMemo(() => {
		const q = query.trim().toLowerCase();
		return materials.filter(m => {
			if (activeKind !== 'all' && m.kind !== activeKind) return false;
			if (!q) return true;
			return (
				m.name.toLowerCase().includes(q) ||
				m.slug.toLowerCase().includes(q) ||
				m.designerCode?.toLowerCase().includes(q) ||
				m.designerCategory?.toLowerCase().includes(q)
			);
		});
	}, [materials, query, activeKind]);

	const toggle = (id: string) => {
		setDraft(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
	};

	const remaining = Math.max(0, minSelected - draft.length);
	const canConfirm = draft.length >= minSelected;

	function confirm() {
		if (!canConfirm) return;
		onConfirm(draft);
	}

	return (
		<DialogContent
			className='flex h-[min(85vh,720px)] max-h-[85vh] w-[min(96vw,960px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none'
		>
			<DialogHeader className='shrink-0 border-b border-border/60 px-5 py-4'>
				<DialogTitle className='text-base'>Chọn hạt cho sản phẩm custom</DialogTitle>
				<DialogDescription className='text-xs'>
					Chọn ít nhất <span className='font-medium text-foreground'>{minSelected}</span> hạt. Ảnh các hạt
					được chọn sẽ tự động thêm vào ảnh sản phẩm.
				</DialogDescription>
			</DialogHeader>

			<div className='shrink-0 border-b border-border/60 px-5 py-3'>
				<div className='relative'>
					<SearchIcon
						className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
						aria-hidden
					/>
					<Input
						value={query}
						onChange={e => setQuery(e.target.value)}
						placeholder='Tìm theo tên, slug, mã thiết kế...'
						className='h-9 pl-9'
						autoComplete='off'
						spellCheck={false}
					/>
					{query ? (
						<button
							type='button'
							onClick={() => setQuery('')}
							className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground'
							aria-label='Xoá từ khoá'
						>
							<XIcon className='size-3.5' />
						</button>
					) : null}
				</div>

				{availableKinds.length > 1 ? (
					<div className='mt-2 flex flex-wrap gap-1'>
						<KindChip
							active={activeKind === 'all'}
							onClick={() => setActiveKind('all')}
							label='Tất cả'
							count={materials.length}
						/>
						{availableKinds.map(kind => (
							<KindChip
								key={kind}
								active={activeKind === kind}
								onClick={() => setActiveKind(kind)}
								label={KIND_LABEL[kind]}
								count={materials.filter(m => m.kind === kind).length}
							/>
						))}
					</div>
				) : null}
			</div>

			<div className='min-h-0 flex-1 overflow-y-auto px-5 py-4'>
				{filtered.length === 0 ? (
					<div className='flex h-full items-center justify-center'>
						<p className='text-sm text-muted-foreground'>Không tìm thấy hạt phù hợp.</p>
					</div>
				) : (
					<ul className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
						{filtered.map(material => {
							const selected = draft.includes(material.id);
							const order = selected ? draft.indexOf(material.id) + 1 : null;
							return (
								<li key={material.id}>
									<button
										type='button'
										onClick={() => toggle(material.id)}
										className={cn(
											'group flex w-full flex-col overflow-hidden rounded-lg border text-left transition',
											selected
												? 'border-foreground ring-2 ring-foreground/20'
												: 'border-border/60 hover:border-foreground/40 hover:shadow-sm'
										)}
									>
										<div className='relative aspect-square w-full overflow-hidden bg-muted'>
											<img
												src={publicAssetUrl(material.image || MATERIAL_FALLBACK_IMG)}
												alt={material.name}
												loading='lazy'
												className='size-full object-cover transition group-hover:scale-105'
												onError={e => {
													(e.currentTarget as HTMLImageElement).src = MATERIAL_FALLBACK_IMG;
												}}
											/>
											{selected ? (
												<span className='absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-full bg-foreground text-background shadow-sm'>
													{order != null ? (
														<span className='text-[10px] font-semibold tabular-nums'>{order}</span>
													) : (
														<CheckIcon className='size-3.5' />
													)}
												</span>
											) : null}
										</div>
										<div className='space-y-0.5 px-2.5 py-2'>
											<p className='line-clamp-1 text-xs font-medium tracking-tight'>{material.name}</p>
											<div className='flex items-center justify-between gap-1.5 text-[11px] text-muted-foreground'>
												<span className='tabular-nums'>{material.priceVnd.toLocaleString('vi-VN')}₫</span>
												{material.displaySize || material.sizeMm != null ? (
													<span className='shrink-0'>
														{material.displaySize ?? `${material.sizeMm}mm`}
													</span>
												) : null}
											</div>
										</div>
									</button>
								</li>
							);
						})}
					</ul>
				)}
			</div>

			<DialogFooter className='shrink-0 flex-row items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-5 py-3 sm:justify-between'>
				<div className='flex items-center gap-2 text-xs'>
					<Badge variant={canConfirm ? 'success' : 'outline'} className='tabular-nums'>
						{draft.length}/{minSelected}
					</Badge>
					{remaining > 0 ? (
						<span className='text-muted-foreground'>cần thêm {remaining} hạt</span>
					) : (
						<span className='text-muted-foreground'>đã đủ tối thiểu</span>
					)}
				</div>
				<div className='flex items-center gap-2'>
					<Button type='button' variant='ghost' size='sm' onClick={onCancel}>
						Huỷ
					</Button>
					<Button type='button' size='sm' onClick={confirm} disabled={!canConfirm}>
						Xác nhận
					</Button>
				</div>
			</DialogFooter>
		</DialogContent>
	);
}

function KindChip({
	active,
	onClick,
	label,
	count,
}: {
	active: boolean;
	onClick: () => void;
	label: string;
	count: number;
}) {
	return (
		<button
			type='button'
			onClick={onClick}
			className={cn(
				'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition',
				active
					? 'bg-foreground text-background'
					: 'text-muted-foreground hover:bg-muted'
			)}
		>
			{label}
			<span
				className={cn(
					'tabular-nums',
					active ? 'text-background/80' : 'text-muted-foreground/70'
				)}
			>
				{count}
			</span>
		</button>
	);
}
