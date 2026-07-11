'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
	type AboutContentV1,
	type AboutProductSpotlightSection,
	type AboutSectionV1,
	type AboutSplitSection,
	newEmptyProductSpotlightSection,
	newEmptySplitSection,
} from '@/lib/about-page-admin';
import { ChevronDownIcon, ChevronUpIcon, ImagePlusIcon, PlusIcon, Trash2Icon } from 'lucide-react';

export type AboutPageVisualEditorProps = {
	value: AboutContentV1;
	onChange: (next: AboutContentV1) => void;
	disabled: boolean;
	uploadImage: (file: File) => Promise<string>;
	uploadBusy?: boolean;
};

function updateHero<K extends keyof AboutContentV1['hero']>(
	draft: AboutContentV1,
	key: K,
	val: AboutContentV1['hero'][K]
): AboutContentV1 {
	return { ...draft, hero: { ...draft.hero, [key]: val } };
}

function ImageUrlList({
	label,
	urls,
	onUrlsChange,
	disabled,
	uploadImage,
	uploadBusy,
}: {
	label: string;
	urls: string[];
	onUrlsChange: (next: string[]) => void;
	disabled: boolean;
	uploadImage: (file: File) => Promise<string>;
	uploadBusy?: boolean;
}) {
	const hiddenFileRef = React.useRef<HTMLInputElement | null>(null);
	const [pendingUploadIndex, setPendingUploadIndex] = React.useState<number | null>(null);
	const [uploadIndex, setUploadIndex] = React.useState<number | null>(null);

	function setUrl(i: number, v: string) {
		const next = [...urls];
		next[i] = v;
		onUrlsChange(next);
	}

	function addRow() {
		onUrlsChange([...urls, '']);
	}

	function removeRow(i: number) {
		const next = urls.filter((_, j) => j !== i);
		onUrlsChange(next.length ? next : ['']);
	}

	async function onPickFile(i: number, file: File | undefined) {
		if (!file) return;
		setUploadIndex(i);
		try {
			const url = await uploadImage(file);
			setUrl(i, url);
		} finally {
			setUploadIndex(null);
		}
	}

	const busy = Boolean(disabled) || Boolean(uploadBusy);

	return (
		<Field>
			<FieldLabel>{label}</FieldLabel>
			<input
				ref={hiddenFileRef}
				type='file'
				accept='image/jpeg,image/png,image/gif,image/webp,image/svg+xml'
				className='hidden'
				disabled={busy}
				aria-hidden
				onChange={e => {
					const f = e.target.files?.[0];
					const idx = pendingUploadIndex;
					e.target.value = '';
					setPendingUploadIndex(null);
					if (idx !== null) void onPickFile(idx, f);
				}}
			/>
			<p className='text-muted-foreground mt-1 text-xs'>
				Mỗi dòng là một ảnh (carousel). Có thể dán URL hoặc tải file lên.
			</p>
			<div className='mt-2 flex flex-col gap-2'>
				{urls.map((u, i) => (
					<div key={i} className='flex flex-wrap items-center gap-2'>
						<Input
							className='min-w-48 flex-1 font-mono text-xs'
							value={u}
							onChange={e => setUrl(i, e.target.value)}
							disabled={busy}
							placeholder='https://… hoặc /images/…'
							spellCheck={false}
						/>
						<Button
							type='button'
							variant='outline'
							size='sm'
							className='shrink-0 gap-1'
							disabled={busy}
							onClick={() => {
								setPendingUploadIndex(i);
								queueMicrotask(() => hiddenFileRef.current?.click());
							}}
						>
							<ImagePlusIcon className='size-4' />
							{uploadIndex === i ? 'Đang tải…' : 'Tải lên'}
						</Button>
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='shrink-0'
							disabled={busy}
							onClick={() => removeRow(i)}
							aria-label='Xóa ảnh'
						>
							<Trash2Icon className='size-4' />
						</Button>
					</div>
				))}
				<Button
					type='button'
					variant='outline'
					size='sm'
					className='w-fit gap-1'
					disabled={busy}
					onClick={addRow}
				>
					<PlusIcon className='size-4' />
					Thêm ảnh
				</Button>
			</div>
		</Field>
	);
}

function SplitSectionEditor({
	section,
	index,
	onChange,
	disabled,
	uploadImage,
	uploadBusy,
	onMoveUp,
	onMoveDown,
	onRemove,
}: {
	section: AboutSplitSection;
	index: number;
	onChange: (s: AboutSplitSection) => void;
	disabled: boolean;
	uploadImage: (file: File) => Promise<string>;
	uploadBusy?: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onRemove: () => void;
}) {
	const busy = Boolean(disabled) || Boolean(uploadBusy);
	return (
		<Card>
			<CardHeader className='pb-3'>
				<div className='flex flex-wrap items-start justify-between gap-2'>
					<div>
						<CardTitle className='text-base'>Phiên {index + 1} — Hai cột (chữ + ảnh)</CardTitle>
						<CardDescription>
							Phần kể chuyện: có thể dùng một đoạn mô tả hoặc nhiều đoạn văn riêng.
						</CardDescription>
					</div>
					<div className='flex shrink-0 gap-1'>
						<Button
							type='button'
							variant='outline'
							size='icon'
							className='size-8'
							disabled={busy}
							onClick={onMoveUp}
							aria-label='Lên trên'
						>
							<ChevronUpIcon className='size-4' />
						</Button>
						<Button
							type='button'
							variant='outline'
							size='icon'
							className='size-8'
							disabled={busy}
							onClick={onMoveDown}
							aria-label='Xuống dưới'
						>
							<ChevronDownIcon className='size-4' />
						</Button>
						<Button
							type='button'
							variant='destructive'
							size='icon'
							className='size-8'
							disabled={busy}
							onClick={onRemove}
							aria-label='Xóa phiên'
						>
							<Trash2Icon className='size-4' />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className='flex flex-col gap-4'>
				<div className='grid gap-4 sm:grid-cols-2'>
					<Field>
						<FieldLabel>Bố cục</FieldLabel>
						<Select
							value={section.variant}
							onValueChange={v => onChange({ ...section, variant: v as AboutSplitSection['variant'] })}
							disabled={busy}
						>
							<SelectTrigger className='mt-1.5'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='text-left-image-right'>Chữ trái — ảnh phải</SelectItem>
								<SelectItem value='image-left-text-right'>Ảnh trái — chữ phải</SelectItem>
							</SelectContent>
						</Select>
					</Field>
					<Field>
						<FieldLabel>Nền</FieldLabel>
						<Select
							value={section.background}
							onValueChange={v =>
								onChange({ ...section, background: v as AboutSplitSection['background'] })
							}
							disabled={busy}
						>
							<SelectTrigger className='mt-1.5'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='white'>Trắng</SelectItem>
								<SelectItem value='cream'>Kem</SelectItem>
							</SelectContent>
						</Select>
					</Field>
				</div>
				<Field>
					<FieldLabel>Dòng phụ (eyebrow)</FieldLabel>
					<Input
						className='mt-1.5'
						value={section.eyebrow ?? ''}
						onChange={e => onChange({ ...section, eyebrow: e.target.value })}
						disabled={busy}
					/>
				</Field>
				<Field>
					<FieldLabel>Tiêu đề</FieldLabel>
					<Input
						className='mt-1.5'
						value={section.title ?? ''}
						onChange={e => onChange({ ...section, title: e.target.value })}
						disabled={busy}
					/>
				</Field>
				<Field>
					<FieldLabel>Mô tả (một khối)</FieldLabel>
					<Textarea
						className='mt-1.5 min-h-24'
						value={section.description ?? ''}
						onChange={e => onChange({ ...section, description: e.target.value })}
						disabled={busy}
						rows={4}
					/>
				</Field>
				<Field>
					<FieldLabel>Các đoạn văn riêng (tuỳ chọn)</FieldLabel>
					<p className='text-muted-foreground mt-1 text-xs'>
						Nếu điền, website ưu tiên hiển thị các đoạn này thay cho mô tả một khối (tùy theme).
					</p>
					<div className='mt-2 flex flex-col gap-2'>
						{(section.paragraphs ?? []).map((p, i) => (
							<div key={i} className='flex gap-2'>
								<Textarea
									className='min-h-20 flex-1'
									value={p}
									onChange={e => {
										const next = [...(section.paragraphs ?? [])];
										next[i] = e.target.value;
										onChange({ ...section, paragraphs: next });
									}}
									disabled={busy}
									rows={3}
								/>
								<Button
									type='button'
									variant='ghost'
									size='icon'
									className='shrink-0'
									disabled={busy}
									onClick={() => {
										const next = (section.paragraphs ?? []).filter((_, j) => j !== i);
										onChange({ ...section, paragraphs: next.length ? next : undefined });
									}}
									aria-label='Xóa đoạn'
								>
									<Trash2Icon className='size-4' />
								</Button>
							</div>
						))}
						<Button
							type='button'
							variant='outline'
							size='sm'
							className='w-fit gap-1'
							disabled={busy}
							onClick={() => onChange({ ...section, paragraphs: [...(section.paragraphs ?? []), ''] })}
						>
							<PlusIcon className='size-4' />
							Thêm đoạn
						</Button>
					</div>
				</Field>
				<ImageUrlList
					label='Ảnh minh hoạ'
					urls={section.imageUrls}
					onUrlsChange={next => {
						const cleaned = next.map(s => s.trim()).filter(Boolean);
						onChange({ ...section, imageUrls: cleaned.length ? cleaned : ['/images/about/2.jpg'] });
					}}
					disabled={busy}
					uploadImage={uploadImage}
					uploadBusy={uploadBusy}
				/>
				<Field>
					<FieldLabel>Mô tả ảnh (alt)</FieldLabel>
					<Input
						className='mt-1.5'
						value={section.imageAlt ?? ''}
						onChange={e => onChange({ ...section, imageAlt: e.target.value })}
						disabled={busy}
					/>
				</Field>
			</CardContent>
		</Card>
	);
}

function syncBlockIcons(blocks: AboutProductSpotlightSection['blocks'], prev?: string[]): string[] {
	const n = blocks.length;
	const base = prev && prev.length === n ? [...prev] : blocks.map((_, i) => prev?.[i] ?? '🦋');
	while (base.length < n) base.push('🦋');
	return base.slice(0, n);
}

function ProductSpotlightEditor({
	section,
	index,
	onChange,
	disabled,
	uploadImage,
	uploadBusy,
	onMoveUp,
	onMoveDown,
	onRemove,
}: {
	section: AboutProductSpotlightSection;
	index: number;
	onChange: (s: AboutProductSpotlightSection) => void;
	disabled: boolean;
	uploadImage: (file: File) => Promise<string>;
	uploadBusy?: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onRemove: () => void;
}) {
	const busy = Boolean(disabled) || Boolean(uploadBusy);
	const icons = syncBlockIcons(section.blocks, section.blockIcons);

	function patch(next: AboutProductSpotlightSection) {
		const ic = syncBlockIcons(next.blocks, next.blockIcons);
		onChange({ ...next, blockIcons: ic });
	}

	return (
		<Card>
			<CardHeader className='pb-3'>
				<div className='flex flex-wrap items-start justify-between gap-2'>
					<div>
						<CardTitle className='text-base'>Phiên {index + 1} — Giới thiệu sản phẩm</CardTitle>
						<CardDescription>
							Nhiều nhóm (block), mỗi nhóm có tiêu đề và danh sách gạch đầu dòng.
						</CardDescription>
					</div>
					<div className='flex shrink-0 gap-1'>
						<Button
							type='button'
							variant='outline'
							size='icon'
							className='size-8'
							disabled={busy}
							onClick={onMoveUp}
							aria-label='Lên trên'
						>
							<ChevronUpIcon className='size-4' />
						</Button>
						<Button
							type='button'
							variant='outline'
							size='icon'
							className='size-8'
							disabled={busy}
							onClick={onMoveDown}
							aria-label='Xuống dưới'
						>
							<ChevronDownIcon className='size-4' />
						</Button>
						<Button
							type='button'
							variant='destructive'
							size='icon'
							className='size-8'
							disabled={busy}
							onClick={onRemove}
							aria-label='Xóa phiên'
						>
							<Trash2Icon className='size-4' />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className='flex flex-col gap-4'>
				<div className='grid gap-4 sm:grid-cols-2'>
					<Field>
						<FieldLabel>Nền</FieldLabel>
						<Select
							value={section.background}
							onValueChange={v =>
								patch({ ...section, background: v as AboutProductSpotlightSection['background'] })
							}
							disabled={busy}
						>
							<SelectTrigger className='mt-1.5'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='white'>Trắng</SelectItem>
								<SelectItem value='cream'>Kem</SelectItem>
							</SelectContent>
						</Select>
					</Field>
				</div>
				<Field>
					<FieldLabel>Dòng phụ (eyebrow)</FieldLabel>
					<Input
						className='mt-1.5'
						value={section.eyebrow}
						onChange={e => patch({ ...section, eyebrow: e.target.value })}
						disabled={busy}
					/>
				</Field>
				<Field>
					<FieldLabel>Tiêu đề</FieldLabel>
					<Input
						className='mt-1.5'
						value={section.title}
						onChange={e => patch({ ...section, title: e.target.value })}
						disabled={busy}
					/>
				</Field>
				<Field>
					<FieldLabel>Mô tả</FieldLabel>
					<Textarea
						className='mt-1.5 min-h-24'
						value={section.description}
						onChange={e => patch({ ...section, description: e.target.value })}
						disabled={busy}
						rows={4}
					/>
				</Field>
				<ImageUrlList
					label='Ảnh minh hoạ'
					urls={section.imageUrls}
					onUrlsChange={next => {
						const cleaned = next.map(s => s.trim()).filter(Boolean);
						patch({ ...section, imageUrls: cleaned.length ? cleaned : ['/images/about/4.jpg'] });
					}}
					disabled={busy}
					uploadImage={uploadImage}
					uploadBusy={uploadBusy}
				/>
				<Field>
					<FieldLabel>Mô tả ảnh (alt)</FieldLabel>
					<Input
						className='mt-1.5'
						value={section.imageAlt}
						onChange={e => patch({ ...section, imageAlt: e.target.value })}
						disabled={busy}
					/>
				</Field>

				<div className='space-y-3'>
					<p className='text-sm font-medium'>Các nhóm nội dung</p>
					{section.blocks.map((block, bi) => (
						<Card key={bi} className='border-dashed'>
							<CardHeader className='py-3 pb-0'>
								<div className='flex flex-wrap items-center justify-between gap-2'>
									<span className='text-muted-foreground text-xs font-medium uppercase'>
										Nhóm {bi + 1}
									</span>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										className='text-destructive'
										disabled={busy || section.blocks.length <= 1}
										onClick={() => {
											const blocks = section.blocks.filter((_, j) => j !== bi);
											patch({
												...section,
												blocks: blocks.length ? blocks : [{ title: '', items: [''] }],
											});
										}}
									>
										Xóa nhóm
									</Button>
								</div>
							</CardHeader>
							<CardContent className='flex flex-col gap-3 pt-3'>
								<div className='grid gap-3 sm:grid-cols-[auto_1fr] sm:items-end'>
									<Field className='w-24'>
										<FieldLabel>Icon</FieldLabel>
										<Input
											className='mt-1.5 text-center text-lg'
											value={icons[bi] ?? '🦋'}
											onChange={e => {
												const nextIcons = [...icons];
												nextIcons[bi] = e.target.value;
												patch({ ...section, blockIcons: nextIcons });
											}}
											disabled={busy}
											maxLength={8}
										/>
									</Field>
									<Field>
										<FieldLabel>Tiêu đề nhóm</FieldLabel>
										<Input
											className='mt-1.5'
											value={block.title}
											onChange={e => {
												const blocks = section.blocks.map((b, j) =>
													j === bi ? { ...b, title: e.target.value } : b
												);
												patch({ ...section, blocks });
											}}
											disabled={busy}
										/>
									</Field>
								</div>
								<Field>
									<FieldLabel>Mục danh sách (mỗi dòng một gạch đầu dòng)</FieldLabel>
									<Textarea
										className='mt-1.5 min-h-28 font-mono text-xs'
										value={block.items.join('\n')}
										onChange={e => {
											const lines = e.target.value.split('\n');
											const blocks = section.blocks.map((b, j) =>
												j === bi ? { ...b, items: lines.length ? lines : [''] } : b
											);
											patch({ ...section, blocks });
										}}
										disabled={busy}
										rows={6}
										spellCheck={false}
									/>
								</Field>
							</CardContent>
						</Card>
					))}
					<Button
						type='button'
						variant='outline'
						size='sm'
						className='gap-1'
						disabled={busy}
						onClick={() =>
							patch({ ...section, blocks: [...section.blocks, { title: 'Nhóm mới', items: [''] }] })
						}
					>
						<PlusIcon className='size-4' />
						Thêm nhóm
					</Button>
				</div>

				<Field>
					<FieldLabel>Mô tả nút kêu gọi (CTA)</FieldLabel>
					<Textarea
						className='mt-1.5 min-h-16'
						value={section.ctaDescription}
						onChange={e => patch({ ...section, ctaDescription: e.target.value })}
						disabled={busy}
						rows={2}
					/>
				</Field>
				<div className='grid gap-4 sm:grid-cols-2'>
					<Field>
						<FieldLabel>Chữ nút CTA</FieldLabel>
						<Input
							className='mt-1.5'
							value={section.ctaLabel}
							onChange={e => patch({ ...section, ctaLabel: e.target.value })}
							disabled={busy}
						/>
					</Field>
					<Field>
						<FieldLabel>Liên kết CTA</FieldLabel>
						<Input
							className='mt-1.5 font-mono text-sm'
							value={section.ctaHref}
							onChange={e => patch({ ...section, ctaHref: e.target.value })}
							disabled={busy}
							spellCheck={false}
						/>
					</Field>
				</div>
			</CardContent>
		</Card>
	);
}

export function AboutPageVisualEditor({
	value,
	onChange,
	disabled,
	uploadImage,
	uploadBusy,
}: AboutPageVisualEditorProps) {
	const busy = Boolean(disabled) || Boolean(uploadBusy);

	function replaceSection(i: number, s: AboutSectionV1) {
		const sections = value.sections.map((x, j) => (j === i ? s : x));
		onChange({ ...value, sections });
	}

	function moveSection(i: number, dir: -1 | 1) {
		const j = i + dir;
		if (j < 0 || j >= value.sections.length) return;
		const sections = [...value.sections];
		[sections[i], sections[j]] = [sections[j], sections[i]];
		onChange({ ...value, sections });
	}

	function removeSection(i: number) {
		const sections = value.sections.filter((_, j) => j !== i);
		onChange({ ...value, sections });
	}

	function addSection(kind: 'split' | 'product-spotlight') {
		const next = kind === 'split' ? newEmptySplitSection() : newEmptyProductSpotlightSection();
		onChange({ ...value, sections: [...value.sections, next] });
	}

	return (
		<div className='flex flex-col gap-6'>
			<Card>
				<CardHeader>
					<CardTitle className='text-base'>Khu vực đầu trang (Hero)</CardTitle>
					<CardDescription>Ảnh lớn phía trên, tiêu đề và nút dẫn tới cửa hàng.</CardDescription>
				</CardHeader>
				<CardContent className='flex flex-col gap-4'>
					<Field>
						<FieldLabel>Dòng phụ (eyebrow)</FieldLabel>
						<Input
							className='mt-1.5'
							value={value.hero.eyebrow}
							onChange={e => onChange(updateHero(value, 'eyebrow', e.target.value))}
							disabled={busy}
						/>
					</Field>
					<Field>
						<FieldLabel>Tiêu đề chính</FieldLabel>
						<Input
							className='mt-1.5'
							value={value.hero.title}
							onChange={e => onChange(updateHero(value, 'title', e.target.value))}
							disabled={busy}
						/>
					</Field>
					<Field>
						<FieldLabel>Đoạn giới thiệu</FieldLabel>
						<Textarea
							className='mt-1.5 min-h-28'
							value={value.hero.description}
							onChange={e => onChange(updateHero(value, 'description', e.target.value))}
							disabled={busy}
							rows={5}
						/>
					</Field>
					<ImageUrlList
						label='Ảnh hero (có thể nhiều ảnh)'
						urls={value.hero.imageUrls}
						onUrlsChange={next => {
							const cleaned = next.map(s => s.trim()).filter(Boolean);
							onChange(
								updateHero(value, 'imageUrls', cleaned.length ? cleaned : ['/images/about/1.jpg'])
							);
						}}
						disabled={busy}
						uploadImage={uploadImage}
						uploadBusy={uploadBusy}
					/>
					<Field>
						<FieldLabel>Mô tả ảnh (alt)</FieldLabel>
						<Input
							className='mt-1.5'
							value={value.hero.imageAlt}
							onChange={e => onChange(updateHero(value, 'imageAlt', e.target.value))}
							disabled={busy}
						/>
					</Field>
					<div className='grid gap-4 sm:grid-cols-2'>
						<Field>
							<FieldLabel>Chữ nút</FieldLabel>
							<Input
								className='mt-1.5'
								value={value.hero.ctaLabel}
								onChange={e => onChange(updateHero(value, 'ctaLabel', e.target.value))}
								disabled={busy}
							/>
						</Field>
						<Field>
							<FieldLabel>Liên kết nút</FieldLabel>
							<Input
								className='mt-1.5 font-mono text-sm'
								value={value.hero.ctaHref}
								onChange={e => onChange(updateHero(value, 'ctaHref', e.target.value))}
								disabled={busy}
								spellCheck={false}
							/>
						</Field>
					</div>
				</CardContent>
			</Card>

			<div className='flex flex-col gap-3'>
				<div className='flex flex-wrap items-center justify-between gap-2'>
					<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
						Các phiên bên dưới
					</p>
					<div className='flex flex-wrap gap-2'>
						<Button
							type='button'
							variant='outline'
							size='sm'
							className='gap-1'
							disabled={busy}
							onClick={() => addSection('split')}
						>
							<PlusIcon className='size-4' />
							Thêm hai cột
						</Button>
						<Button
							type='button'
							variant='outline'
							size='sm'
							className='gap-1'
							disabled={busy}
							onClick={() => addSection('product-spotlight')}
						>
							<PlusIcon className='size-4' />
							Thêm spotlight sản phẩm
						</Button>
					</div>
				</div>

				{value.sections.length === 0 ? (
					<p className='text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm'>
						Chưa có phiên nào. Thêm “hai cột” hoặc “spotlight” để bắt đầu.
					</p>
				) : (
					value.sections.map((sec, i) =>
						sec.type === 'split' ? (
							<SplitSectionEditor
								key={i}
								section={sec}
								index={i}
								onChange={s => replaceSection(i, s)}
								disabled={Boolean(disabled)}
								uploadImage={uploadImage}
								uploadBusy={uploadBusy}
								onMoveUp={() => moveSection(i, -1)}
								onMoveDown={() => moveSection(i, 1)}
								onRemove={() => removeSection(i)}
							/>
						) : (
							<ProductSpotlightEditor
								key={i}
								section={sec}
								index={i}
								onChange={s => replaceSection(i, s)}
								disabled={Boolean(disabled)}
								uploadImage={uploadImage}
								uploadBusy={uploadBusy}
								onMoveUp={() => moveSection(i, -1)}
								onMoveDown={() => moveSection(i, 1)}
								onRemove={() => removeSection(i)}
							/>
						)
					)
				)}
			</div>
		</div>
	);
}
