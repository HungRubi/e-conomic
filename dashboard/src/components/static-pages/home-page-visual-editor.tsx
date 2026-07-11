'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

import { uploadProductImage } from '@/api/admin-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SingleImageUrlDropzone } from '@/components/common/single-image-url-dropzone';
import { Textarea } from '@/components/ui/textarea';
import {
	type CTAButton,
	type GridCardItem,
	type HomeContentV1,
	type HomeSection,
	TEMPLATE_IDS,
	TEMPLATE_LABELS,
	newHomeSection,
} from '@/lib/home-page-admin';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, Trash2Icon, Settings2Icon } from 'lucide-react';
import { toast } from 'sonner';

/* ─── Upload helper ─── */

async function uploadImage(file: File): Promise<string> {
	const { url } = await uploadProductImage(file);
	return url;
}

/* ─── Constants ─── */

const GOOGLE_FONTS = [
	'Inter',
	'Lora',
	'Playfair Display',
	'Nunito',
	'Cormorant Garamond',
	'DM Serif Display',
	'EB Garamond',
	'Libre Baskerville',
	'Merriweather',
	'Montserrat',
	'Open Sans',
	'Poppins',
	'Raleway',
	'Source Sans Pro',
	'Work Sans',
] as const;

const FONT_SIZE_OPTIONS = [
	{ value: 'text-sm', label: 'Nhỏ (sm)' },
	{ value: 'text-base', label: 'Vừa (base)' },
	{ value: 'text-lg', label: 'Lớn (lg)' },
	{ value: 'text-xl', label: 'XL' },
	{ value: 'text-2xl', label: '2XL' },
	{ value: 'text-3xl', label: '3XL' },
	{ value: 'text-4xl sm:text-5xl', label: '4XL→5XL' },
	{ value: 'text-5xl sm:text-6xl', label: '5XL→6XL' },
];

const BG_COLOR_PRESETS = [
	{ value: 'white', label: 'Trắng', color: '#fff', textColor: '#000' },
	{ value: '#f3efe6', label: 'Kem nhạt', color: '#f3efe6', textColor: '#000' },
	{ value: '#f5f2e9', label: 'Kem', color: '#f5f2e9', textColor: '#000' },
	{ value: '#fbf4e6', label: 'Kem sáng', color: '#fbf4e6', textColor: '#000' },
	{ value: '#1f3424', label: 'Xanh đậm', color: '#1f3424', textColor: '#fff' },
	{ value: '#2b3127', label: 'Xanh tối', color: '#2b3127', textColor: '#fff' },
];

/* ─── Font Select ─── */

function FontSelect({
	value,
	onChange,
	disabled,
}: {
	value: string;
	onChange: (v: string) => void;
	disabled: boolean;
}) {
	const isCustom = value && !GOOGLE_FONTS.includes(value as (typeof GOOGLE_FONTS)[number]);
	return (
		<div className='flex gap-2'>
			<Select
				value={isCustom ? '__custom__' : value}
				onValueChange={v => {
					if (v !== '__custom__') onChange(v);
				}}
				disabled={disabled}
			>
				<SelectTrigger className='flex-1'>
					<SelectValue placeholder='Chọn font' />
				</SelectTrigger>
				<SelectContent>
					{GOOGLE_FONTS.map(f => (
						<SelectItem key={f} value={f} style={{ fontFamily: f }}>
							{f}
						</SelectItem>
					))}
					<SelectItem value='__custom__'>Font khác…</SelectItem>
				</SelectContent>
			</Select>
			{isCustom ? (
				<Input
					className='w-36 font-mono text-xs'
					value={value}
					onChange={e => onChange(e.target.value)}
					disabled={disabled}
					placeholder='Tên font'
				/>
			) : null}
		</div>
	);
}

/* ─── Image with link ─── */

function ImageWithLinkField({
	value,
	linkValue,
	onChange,
	onLinkChange,
	disabled,
	label,
	hint,
}: {
	value: string;
	linkValue?: string;
	onChange: (v: string) => void;
	onLinkChange?: (v: string) => void;
	disabled: boolean;
	label: string;
	hint?: string;
}) {
	return (
		<Field>
			<FieldLabel>{label}</FieldLabel>
			{hint ? <p className='text-xs text-muted-foreground mt-1'>{hint}</p> : null}
			<div className='mt-1.5'>
				<SingleImageUrlDropzone
					label={value ? 'Thay ảnh' : 'Chọn ảnh'}
					url={value}
					disabled={disabled}
					onUploadFile={async f => {
						try {
							onChange(await uploadImage(f));
						} catch {
							toast.error('Tải ảnh thất bại');
						}
					}}
				/>
				{onLinkChange !== undefined ? (
					<Input
						className='mt-2 font-mono text-xs'
						value={linkValue ?? ''}
						onChange={e => onLinkChange(e.target.value)}
						disabled={disabled}
						placeholder='Link khi click vào ảnh (vd: /product/slug-1)'
					/>
				) : null}
			</div>
		</Field>
	);
}

/* ─── Buttons Editor ─── */

function ButtonsEditor({
	buttons,
	onChange,
	disabled,
}: {
	buttons: CTAButton[];
	onChange: (v: CTAButton[]) => void;
	disabled: boolean;
}) {
	return (
		<Field>
			<FieldLabel>Nút CTA</FieldLabel>
			<div className='mt-2 flex flex-col gap-2'>
				{buttons.map((btn, i) => (
					<div key={i} className='flex flex-wrap items-center gap-2 rounded-md border p-2'>
						<Input
							className='min-w-20 flex-1 text-sm'
							value={btn.label}
							onChange={e => {
								const n = [...buttons];
								n[i] = { ...n[i], label: e.target.value };
								onChange(n);
							}}
							disabled={disabled}
							placeholder='Nhãn'
						/>
						<Input
							className='min-w-20 flex-1 font-mono text-xs'
							value={btn.href}
							onChange={e => {
								const n = [...buttons];
								n[i] = { ...n[i], href: e.target.value };
								onChange(n);
							}}
							disabled={disabled}
							placeholder='/link'
						/>
						<Select
							value={btn.variant}
							onValueChange={v => {
								const n = [...buttons];
								n[i] = { ...n[i], variant: v as CTAButton['variant'] };
								onChange(n);
							}}
							disabled={disabled}
						>
							<SelectTrigger className='w-24'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='primary'>Chính</SelectItem>
								<SelectItem value='secondary'>Phụ</SelectItem>
								<SelectItem value='outline'>Viền</SelectItem>
							</SelectContent>
						</Select>
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='size-8'
							disabled={disabled}
							onClick={() => onChange(buttons.filter((_, j) => j !== i))}
							aria-label='Xoá nút'
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
					disabled={disabled}
					onClick={() => onChange([...buttons, { label: '', href: '#', variant: 'primary' }])}
				>
					<PlusIcon className='size-4' /> Thêm nút
				</Button>
			</div>
		</Field>
	);
}

/* ─── Card List Editor ─── */

function CardListEditor({
	cards,
	onChange,
	disabled,
}: {
	cards: GridCardItem[];
	onChange: (v: GridCardItem[]) => void;
	disabled: boolean;
}) {
	return (
		<div className='space-y-3'>
			<p className='text-sm font-medium'>Cards</p>
			{cards.map((card, i) => (
				<Card key={i} className='border-dashed'>
					<CardHeader className='py-3 pb-0'>
						<div className='flex items-center justify-between'>
							<span className='text-xs font-medium uppercase text-muted-foreground'>Card {i + 1}</span>
							<Button
								type='button'
								variant='ghost'
								size='sm'
								className='text-destructive'
								disabled={disabled || cards.length <= 1}
								onClick={() => onChange(cards.filter((_, j) => j !== i))}
							>
								Xoá
							</Button>
						</div>
					</CardHeader>
					<CardContent className='flex flex-col gap-3 pt-3'>
						<ImageWithLinkField
							label='Ảnh'
							value={card.imageUrl ?? ''}
							onChange={v => {
								const n = [...cards];
								n[i] = { ...n[i], imageUrl: v };
								onChange(n);
							}}
							disabled={disabled}
						/>
						<Field>
							<FieldLabel>Tiêu đề</FieldLabel>
							<Input
								className='mt-1.5'
								value={card.title}
								onChange={e => {
									const n = [...cards];
									n[i] = { ...n[i], title: e.target.value };
									onChange(n);
								}}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Mô tả</FieldLabel>
							<Textarea
								className='mt-1.5 min-h-16'
								value={card.description}
								onChange={e => {
									const n = [...cards];
									n[i] = { ...n[i], description: e.target.value };
									onChange(n);
								}}
								disabled={disabled}
								rows={3}
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
				disabled={disabled}
				onClick={() => onChange([...cards, { title: 'Card mới', description: '' }])}
			>
				<PlusIcon className='size-4' /> Thêm card
			</Button>
		</div>
	);
}

/* ─── Single Section Editor (detail panel) ─── */

function SectionDetailEditor({
	section,
	onChange,
	onBack,
	disabled,
}: {
	section: HomeSection;
	onChange: (s: HomeSection) => void;
	onBack: () => void;
	disabled: boolean;
}) {
	const content = section.content;
	const patch = (p: Record<string, unknown>) => onChange({ ...section, content: { ...content, ...p } });
	const str = (k: string, fb = '') => (typeof content[k] === 'string' ? (content[k] as string) : fb);
	const bool = (k: string, fb = false) => (typeof content[k] === 'boolean' ? (content[k] as boolean) : fb);
	const num = (k: string, fb = 0) => (typeof content[k] === 'number' ? (content[k] as number) : fb);

	// Style overrides
	const [showStyle, setShowStyle] = React.useState(false);
	const style = section.style ?? {};

	function stylePatch(p: Record<string, unknown>) {
		onChange({ ...section, style: { ...style, ...p } as typeof section.style });
	}

	return (
		<div className='flex flex-col gap-4'>
			{/* Header */}
			<div className='flex items-center gap-2 border-b pb-3'>
				<Button type='button' variant='ghost' size='sm' onClick={onBack} className='gap-1'>
					<ChevronLeftIcon className='size-4' /> Quay lại danh sách
				</Button>
				<span className='text-xs text-muted-foreground'>{TEMPLATE_LABELS[section.templateId]}</span>
			</div>

			{/* Label */}
			<Field>
				<FieldLabel>Tên hiển thị</FieldLabel>
				<Input
					className='mt-1.5'
					value={section.label}
					onChange={e => onChange({ ...section, label: e.target.value })}
					disabled={disabled}
					placeholder='VD: Hero Banner, Sản phẩm nổi bật...'
				/>
			</Field>

			{/* Template-specific content */}
			{renderTemplateContent()}

			{/* Style toggles */}
			<Button
				type='button'
				variant='outline'
				size='sm'
				className='w-fit gap-1'
				onClick={() => setShowStyle(!showStyle)}
				disabled={disabled}
			>
				<Settings2Icon className='size-4' /> {showStyle ? 'Ẩn' : 'Hiện'} tuỳ chỉnh màu nền & font
			</Button>
			{showStyle ? (
				<Card>
					<CardHeader className='pb-3'>
						<CardTitle className='text-sm'>Màu nền & font</CardTitle>
					</CardHeader>
					<CardContent className='flex flex-col gap-4'>
						<Field>
							<FieldLabel>Màu nền</FieldLabel>
							<div className='mt-1.5 flex flex-wrap gap-2'>
								{BG_COLOR_PRESETS.map(p => {
									const active =
										(style as any)?.background?.type === 'color' &&
										(style as any)?.background?.value === p.value;
									return (
										<button
											key={p.value}
											type='button'
											className={`h-8 rounded-md px-3 text-xs font-medium transition ${active ? 'ring-2 ring-foreground ring-offset-2' : 'ring-1 ring-foreground/20'}`}
											style={{ backgroundColor: p.color, color: p.textColor }}
											disabled={disabled}
											onClick={() =>
												stylePatch({
													background: active ? null : { type: 'color', value: p.value },
												})
											}
										>
											{p.label}
										</button>
									);
								})}
							</div>
						</Field>
						<div className='grid gap-3 sm:grid-cols-2'>
							<Field>
								<FieldLabel>Font heading</FieldLabel>
								<div className='mt-1.5'>
									<FontSelect
										value={(style as any)?.fonts?.headingFamily ?? ''}
										onChange={v =>
											stylePatch({ fonts: { ...(style as any)?.fonts, headingFamily: v } })
										}
										disabled={disabled}
									/>
								</div>
							</Field>
							<Field>
								<FieldLabel>Cỡ heading</FieldLabel>
								<Select
									value={(style as any)?.fonts?.headingSize ?? ''}
									onValueChange={v =>
										stylePatch({ fonts: { ...(style as any)?.fonts, headingSize: v } })
									}
									disabled={disabled}
								>
									<SelectTrigger className='mt-1.5'>
										<SelectValue placeholder='Mặc định' />
									</SelectTrigger>
									<SelectContent>
										{FONT_SIZE_OPTIONS.map(o => (
											<SelectItem key={o.value} value={o.value}>
												{o.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						</div>
					</CardContent>
				</Card>
			) : null}

			{/* Save note */}
			{!disabled ? (
				<p className='text-xs text-muted-foreground border-t pt-3'>
					đã lưu tự động. Nhấn "Lưu nội dung trang chủ" bên dưới để ghi vào trang.
				</p>
			) : null}
		</div>
	);

	function renderTemplateContent() {
		switch (section.templateId) {
			case 'hero':
				return (
					<div className='flex flex-col gap-4'>
						<div className='flex items-center gap-3'>
							<Checkbox
								checked={bool('showEyebrow', true)}
								onCheckedChange={v => patch({ showEyebrow: Boolean(v) })}
								disabled={disabled}
							/>
							<Label>Hiện dòng phụ</Label>
						</div>
						{bool('showEyebrow', true) ? (
							<Field>
								<FieldLabel>Dòng phụ</FieldLabel>
								<Input
									className='mt-1.5'
									value={str('eyebrow')}
									onChange={e => patch({ eyebrow: e.target.value })}
									disabled={disabled}
								/>
							</Field>
						) : null}
						<div className='flex items-center gap-3'>
							<Checkbox
								checked={bool('showTitle', true)}
								onCheckedChange={v => patch({ showTitle: Boolean(v) })}
								disabled={disabled}
							/>
							<Label>Hiện tiêu đề</Label>
						</div>
						{bool('showTitle', true) ? (
							<Field>
								<FieldLabel>Tiêu đề</FieldLabel>
								<Input
									className='mt-1.5'
									value={str('title')}
									onChange={e => patch({ title: e.target.value })}
									disabled={disabled}
								/>
							</Field>
						) : null}
						<div className='flex items-center gap-3'>
							<Checkbox
								checked={bool('showDescription', true)}
								onCheckedChange={v => patch({ showDescription: Boolean(v) })}
								disabled={disabled}
							/>
							<Label>Hiện mô tả</Label>
						</div>
						{bool('showDescription', true) ? (
							<Field>
								<FieldLabel>Mô tả</FieldLabel>
								<Textarea
									className='mt-1.5 min-h-24'
									value={str('description')}
									onChange={e => patch({ description: e.target.value })}
									disabled={disabled}
									rows={4}
								/>
							</Field>
						) : null}
						<ImageWithLinkField
							label='Ảnh nền Desktop'
							value={getBg('desktop')}
							onChange={v => patchBg('desktop', v)}
							disabled={disabled}
						/>
						<ImageWithLinkField
							label='Ảnh nền Mobile'
							value={getBg('mobile')}
							onChange={v => patchBg('mobile', v)}
							disabled={disabled}
						/>
						<Field>
							<FieldLabel>Căn text</FieldLabel>
							<Select
								value={str('alignment', 'center')}
								onValueChange={v => patch({ alignment: v })}
								disabled={disabled}
							>
								<SelectTrigger className='mt-1.5'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='center'>Giữa</SelectItem>
									<SelectItem value='left'>Trái</SelectItem>
								</SelectContent>
							</Select>
						</Field>
						{Array.isArray(content.buttons) ? (
							<ButtonsEditor
								buttons={content.buttons as CTAButton[]}
								onChange={v => patch({ buttons: v })}
								disabled={disabled}
							/>
						) : null}
					</div>
				);
			case 'two-column':
				return (
					<div className='flex flex-col gap-4'>
						<div className='grid gap-4 sm:grid-cols-2'>
							<Field>
								<FieldLabel>Bố cục</FieldLabel>
								<Select
									value={str('layout', 'text-left')}
									onValueChange={v => patch({ layout: v })}
									disabled={disabled}
								>
									<SelectTrigger className='mt-1.5'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='text-left'>Chữ trái - ảnh phải</SelectItem>
										<SelectItem value='text-right'>Ảnh trái - chữ phải</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel>Tỉ lệ</FieldLabel>
								<Select
									value={str('ratio', '50-50')}
									onValueChange={v => patch({ ratio: v })}
									disabled={disabled}
								>
									<SelectTrigger className='mt-1.5'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='50-50'>50/50</SelectItem>
										<SelectItem value='60-40'>60/40</SelectItem>
										<SelectItem value='40-60'>40/60</SelectItem>
										<SelectItem value='70-30'>70/30</SelectItem>
									</SelectContent>
								</Select>
							</Field>
						</div>
						<Field>
							<FieldLabel>Dòng phụ</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('eyebrow')}
								onChange={e => patch({ eyebrow: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Tiêu đề</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('title')}
								onChange={e => patch({ title: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Mô tả</FieldLabel>
							<Textarea
								className='mt-1.5 min-h-20'
								value={str('description')}
								onChange={e => patch({ description: e.target.value })}
								disabled={disabled}
								rows={4}
							/>
						</Field>
						<ImageListField disabled={disabled} />
					</div>
				);
			case 'grid-cards':
				return (
					<div className='flex flex-col gap-4'>
						<Field>
							<FieldLabel>Dòng phụ</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('eyebrow')}
								onChange={e => patch({ eyebrow: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Tiêu đề</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('title')}
								onChange={e => patch({ title: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Mô tả</FieldLabel>
							<Textarea
								className='mt-1.5 min-h-20'
								value={str('description')}
								onChange={e => patch({ description: e.target.value })}
								disabled={disabled}
								rows={3}
							/>
						</Field>
						<div className='grid gap-4 sm:grid-cols-2'>
							<Field>
								<FieldLabel>Số cột</FieldLabel>
								<Select
									value={String(num('columns', 3))}
									onValueChange={v => patch({ columns: Number(v) })}
									disabled={disabled}
								>
									<SelectTrigger className='mt-1.5'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='2'>2</SelectItem>
										<SelectItem value='3'>3</SelectItem>
										<SelectItem value='4'>4</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel>Kiểu card</FieldLabel>
								<Select
									value={str('cardStyle', 'shadow')}
									onValueChange={v => patch({ cardStyle: v })}
									disabled={disabled}
								>
									<SelectTrigger className='mt-1.5'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='shadow'>Đổ bóng</SelectItem>
										<SelectItem value='bordered'>Viền</SelectItem>
										<SelectItem value='minimal'>Tối giản</SelectItem>
									</SelectContent>
								</Select>
							</Field>
						</div>
						{Array.isArray(content.cards) ? (
							<CardListEditor
								cards={content.cards as GridCardItem[]}
								onChange={v => patch({ cards: v })}
								disabled={disabled}
							/>
						) : null}
					</div>
				);
			case 'video':
				return (
					<div className='flex flex-col gap-4'>
						<Field>
							<FieldLabel>URL YouTube</FieldLabel>
							<Input
								className='mt-1.5 font-mono text-xs'
								value={str('youtubeUrl')}
								onChange={e => patch({ youtubeUrl: e.target.value })}
								disabled={disabled}
								placeholder='https://www.youtube.com/watch?v=...'
							/>
						</Field>
						<Field>
							<FieldLabel>Tiêu đề</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('title')}
								onChange={e => patch({ title: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Mô tả</FieldLabel>
							<Textarea
								className='mt-1.5 min-h-20'
								value={str('description')}
								onChange={e => patch({ description: e.target.value })}
								disabled={disabled}
								rows={3}
							/>
						</Field>
						<ImageWithLinkField
							label='Ảnh thumbnail'
							value={str('thumbnailUrl')}
							onChange={v => patch({ thumbnailUrl: v })}
							disabled={disabled}
						/>
						<div className='flex items-center gap-3'>
							<Checkbox
								checked={bool('autoplay', true)}
								onCheckedChange={v => patch({ autoplay: Boolean(v) })}
								disabled={disabled}
							/>
							<Label>Tự động phát</Label>
						</div>
					</div>
				);
			case 'cta-banner':
				return (
					<div className='flex flex-col gap-4'>
						<ImageWithLinkField
							label='Ảnh nền'
							value={str('backgroundImage')}
							onChange={v => patch({ backgroundImage: v })}
							disabled={disabled}
						/>
						<Field>
							<FieldLabel>Dòng phụ</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('eyebrow')}
								onChange={e => patch({ eyebrow: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Tiêu đề</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('title')}
								onChange={e => patch({ title: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Mô tả</FieldLabel>
							<Textarea
								className='mt-1.5 min-h-20'
								value={str('description')}
								onChange={e => patch({ description: e.target.value })}
								disabled={disabled}
								rows={3}
							/>
						</Field>
						<Field>
							<FieldLabel>Căn text</FieldLabel>
							<Select
								value={str('alignment', 'center')}
								onValueChange={v => patch({ alignment: v })}
								disabled={disabled}
							>
								<SelectTrigger className='mt-1.5'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='center'>Giữa</SelectItem>
									<SelectItem value='left'>Trái</SelectItem>
								</SelectContent>
							</Select>
						</Field>
						{Array.isArray(content.buttons) ? (
							<ButtonsEditor
								buttons={content.buttons as CTAButton[]}
								onChange={v => patch({ buttons: v })}
								disabled={disabled}
							/>
						) : null}
					</div>
				);
			case 'featured-products':
				return (
					<div className='flex flex-col gap-4'>
						<Field>
							<FieldLabel>Tiêu đề</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('title')}
								onChange={e => patch({ title: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Mô tả</FieldLabel>
							<Textarea
								className='mt-1.5 min-h-20'
								value={str('description')}
								onChange={e => patch({ description: e.target.value })}
								disabled={disabled}
								rows={3}
							/>
						</Field>
						<Field>
							<FieldLabel>Số sản phẩm hiển thị</FieldLabel>
							<Input
								type='number'
								min={1}
								max={8}
								className='mt-1.5 w-24'
								value={String(num('count', 4))}
								onChange={e => patch({ count: Number(e.target.value) })}
								disabled={disabled}
							/>
						</Field>
						<div className='grid gap-4 sm:grid-cols-2'>
							<Field>
								<FieldLabel>Sắp xếp</FieldLabel>
								<Select
									value={str('sortBy', 'default')}
									onValueChange={v => patch({ sortBy: v })}
									disabled={disabled}
								>
									<SelectTrigger className='mt-1.5'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='default'>Mặc định</SelectItem>
										<SelectItem value='newest'>Mới nhất</SelectItem>
										<SelectItem value='best-seller'>Bán chạy</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel>Bố cục</FieldLabel>
								<Select
									value={str('layout', 'grid')}
									onValueChange={v => patch({ layout: v })}
									disabled={disabled}
								>
									<SelectTrigger className='mt-1.5'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='grid'>Grid</SelectItem>
										<SelectItem value='carousel'>Carousel</SelectItem>
									</SelectContent>
								</Select>
							</Field>
						</div>
					</div>
				);
			case 'soul-jewelry':
				return (
					<div className='flex flex-col gap-4'>
						<Field>
							<FieldLabel>Dòng phụ</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('eyebrow')}
								onChange={e => patch({ eyebrow: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Tiêu đề</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('title')}
								onChange={e => patch({ title: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Mô tả</FieldLabel>
							<Textarea
								className='mt-1.5 min-h-20'
								value={str('description')}
								onChange={e => patch({ description: e.target.value })}
								disabled={disabled}
								rows={4}
							/>
						</Field>
						<ImageListField disabled={disabled} />
						<div className='flex items-center gap-3'>
							<Checkbox
								checked={bool('showPillars', true)}
								onCheckedChange={v => patch({ showPillars: Boolean(v) })}
								disabled={disabled}
							/>
							<Label>Hiện pillars</Label>
						</div>
						<PillarEditor content={content} patch={patch} disabled={disabled} />
					</div>
				);
			case 'healing-space':
				return (
					<div className='flex flex-col gap-4'>
						<Field>
							<FieldLabel>Dòng phụ</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('eyebrow')}
								onChange={e => patch({ eyebrow: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Tiêu đề</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('title')}
								onChange={e => patch({ title: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Mô tả</FieldLabel>
							<Textarea
								className='mt-1.5 min-h-20'
								value={str('description')}
								onChange={e => patch({ description: e.target.value })}
								disabled={disabled}
								rows={4}
							/>
						</Field>
						<ImageListField disabled={disabled} />
						<div className='flex items-center gap-3'>
							<Checkbox
								checked={bool('showItems', true)}
								onCheckedChange={v => patch({ showItems: Boolean(v) })}
								disabled={disabled}
							/>
							<Label>Hiện danh sách dịch vụ</Label>
						</div>
						<HealingItemsEditor content={content} patch={patch} disabled={disabled} />
						<Field>
							<FieldLabel>Card phụ (eyebrow)</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('cardEyebrow')}
								onChange={e => patch({ cardEyebrow: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Card phụ (mô tả)</FieldLabel>
							<Textarea
								className='mt-1.5 min-h-16'
								value={str('cardDescription')}
								onChange={e => patch({ cardDescription: e.target.value })}
								disabled={disabled}
								rows={3}
							/>
						</Field>
					</div>
				);
			case 'connection':
				return (
					<div className='flex flex-col gap-4'>
						<ImageWithLinkField
							label='Ảnh nền'
							value={str('backgroundImage')}
							onChange={v => patch({ backgroundImage: v })}
							disabled={disabled}
						/>
						<Field>
							<FieldLabel>Dòng phụ</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('eyebrow')}
								onChange={e => patch({ eyebrow: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Tiêu đề</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('title')}
								onChange={e => patch({ title: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Mô tả</FieldLabel>
							<Textarea
								className='mt-1.5 min-h-20'
								value={str('description')}
								onChange={e => patch({ description: e.target.value })}
								disabled={disabled}
								rows={4}
							/>
						</Field>
						<ConnectionItemsEditor content={content} patch={patch} disabled={disabled} />
					</div>
				);
			case 'customer-feedbacks':
				return (
					<div className='flex flex-col gap-4'>
						<Field>
							<FieldLabel>Tiêu đề</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('title')}
								onChange={e => patch({ title: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<div className='grid gap-4 sm:grid-cols-2'>
							<Field>
								<FieldLabel>Số lượng</FieldLabel>
								<Input
									type='number'
									min={1}
									max={12}
									className='mt-1.5 w-24'
									value={String(num('count', 4))}
									onChange={e => patch({ count: Number(e.target.value) })}
									disabled={disabled}
								/>
							</Field>
							<Field>
								<FieldLabel>Bố cục</FieldLabel>
								<Select
									value={str('layout', 'grid')}
									onValueChange={v => patch({ layout: v })}
									disabled={disabled}
								>
									<SelectTrigger className='mt-1.5'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='grid'>Grid</SelectItem>
										<SelectItem value='carousel'>Carousel</SelectItem>
									</SelectContent>
								</Select>
							</Field>
						</div>
					</div>
				);
			case 'gallery':
				return (
					<div className='flex flex-col gap-4'>
						<div className='grid gap-4 sm:grid-cols-2'>
							<Field>
								<FieldLabel>Bố cục</FieldLabel>
								<Select
									value={str('layout', 'grid')}
									onValueChange={v => patch({ layout: v })}
									disabled={disabled}
								>
									<SelectTrigger className='mt-1.5'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='grid'>Grid</SelectItem>
										<SelectItem value='masonry'>Masonry</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel>Số cột</FieldLabel>
								<Select
									value={String(num('columns', 3))}
									onValueChange={v => patch({ columns: Number(v) })}
									disabled={disabled}
								>
									<SelectTrigger className='mt-1.5'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='2'>2</SelectItem>
										<SelectItem value='3'>3</SelectItem>
										<SelectItem value='4'>4</SelectItem>
									</SelectContent>
								</Select>
							</Field>
						</div>
						<ImageListField disabled={disabled} />
					</div>
				);
			case 'rich-text':
				return (
					<div className='flex flex-col gap-4'>
						<Field>
							<FieldLabel>Nội dung (HTML)</FieldLabel>
							<Textarea
								className='mt-1.5 font-mono text-xs'
								value={str('content')}
								onChange={e => patch({ content: e.target.value })}
								disabled={disabled}
								rows={8}
							/>
						</Field>
						<Field>
							<FieldLabel>Căn text</FieldLabel>
							<Select
								value={str('alignment', 'left')}
								onValueChange={v => patch({ alignment: v })}
								disabled={disabled}
							>
								<SelectTrigger className='mt-1.5'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='left'>Trái</SelectItem>
									<SelectItem value='center'>Giữa</SelectItem>
									<SelectItem value='right'>Phải</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>
				);
			case 'split-blocks':
				return (
					<div className='flex flex-col gap-4'>
						<Field>
							<FieldLabel>Dòng phụ</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('eyebrow')}
								onChange={e => patch({ eyebrow: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Tiêu đề</FieldLabel>
							<Input
								className='mt-1.5'
								value={str('title')}
								onChange={e => patch({ title: e.target.value })}
								disabled={disabled}
							/>
						</Field>
						<Field>
							<FieldLabel>Mô tả</FieldLabel>
							<Textarea
								className='mt-1.5 min-h-20'
								value={str('description')}
								onChange={e => patch({ description: e.target.value })}
								disabled={disabled}
								rows={3}
							/>
						</Field>
						<ImageListField disabled={disabled} />
						<Field>
							<FieldLabel>Mô tả CTA</FieldLabel>
							<Textarea
								className='mt-1.5 min-h-16'
								value={str('ctaDescription')}
								onChange={e => patch({ ctaDescription: e.target.value })}
								disabled={disabled}
								rows={2}
							/>
						</Field>
						<div className='grid gap-4 sm:grid-cols-2'>
							<Field>
								<FieldLabel>Chữ nút</FieldLabel>
								<Input
									className='mt-1.5'
									value={str('ctaLabel')}
									onChange={e => patch({ ctaLabel: e.target.value })}
									disabled={disabled}
								/>
							</Field>
							<Field>
								<FieldLabel>Liên kết</FieldLabel>
								<Input
									className='mt-1.5 font-mono text-xs'
									value={str('ctaHref')}
									onChange={e => patch({ ctaHref: e.target.value })}
									disabled={disabled}
								/>
							</Field>
						</div>
					</div>
				);
			default:
				return <p className='text-sm text-muted-foreground'>Chưa có form cho loại này.</p>;
		}
	}

	function getBg(key: string): string {
		const bg = content.backgroundImage;
		if (typeof bg === 'object' && bg !== null) return ((bg as Record<string, unknown>)[key] as string) || '';
		return '';
	}
	function patchBg(key: string, val: string) {
		const cur =
			typeof content.backgroundImage === 'object' && content.backgroundImage !== null
				? (content.backgroundImage as Record<string, unknown>)
				: {};
		patch({ backgroundImage: { ...cur, [key]: val } });
	}

	/* ─── Pillar Editor (soul-jewelry) ─── */
	function PillarEditor({
		content: c,
		patch: p,
		disabled: d,
	}: {
		content: Record<string, unknown>;
		patch: (x: Record<string, unknown>) => void;
		disabled: boolean;
	}) {
		const pillars = Array.isArray(c.pillars) ? (c.pillars as { title: string; description: string }[]) : [];
		return (
			<div className='space-y-3'>
				<p className='text-sm font-medium'>Pillars</p>
				{pillars.map((pillar, i) => (
					<div key={i} className='flex items-start gap-2 rounded-md border p-2'>
						<div className='flex-1 space-y-2'>
							<Input
								className='text-sm'
								value={pillar.title}
								onChange={e => {
									const n = [...pillars];
									n[i] = { ...n[i], title: e.target.value };
									p({ pillars: n });
								}}
								disabled={d}
								placeholder='Tiêu đề'
							/>
							<Textarea
								className='min-h-16 text-sm'
								value={pillar.description}
								onChange={e => {
									const n = [...pillars];
									n[i] = { ...n[i], description: e.target.value };
									p({ pillars: n });
								}}
								disabled={d}
								placeholder='Mô tả'
								rows={2}
							/>
						</div>
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='size-8 shrink-0'
							disabled={d || pillars.length <= 1}
							onClick={() => p({ pillars: pillars.filter((_, j) => j !== i) })}
							aria-label='Xoá'
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
					disabled={d}
					onClick={() => p({ pillars: [...pillars, { title: '', description: '' }] })}
				>
					<PlusIcon className='size-4' /> Thêm pillar
				</Button>
			</div>
		);
	}

	/* ─── Healing Items Editor (healing-space) ─── */
	function HealingItemsEditor({
		content: c,
		patch: p,
		disabled: d,
	}: {
		content: Record<string, unknown>;
		patch: (x: Record<string, unknown>) => void;
		disabled: boolean;
	}) {
		const items = Array.isArray(c.items) ? (c.items as { title: string; description: string }[]) : [];
		return (
			<div className='space-y-3'>
				<p className='text-sm font-medium'>Dịch vụ</p>
				{items.map((item, i) => (
					<div key={i} className='flex items-start gap-2 rounded-md border p-2'>
						<div className='flex-1 space-y-2'>
							<Input
								className='text-sm'
								value={item.title}
								onChange={e => {
									const n = [...items];
									n[i] = { ...n[i], title: e.target.value };
									p({ items: n });
								}}
								disabled={d}
								placeholder='Tiêu đề'
							/>
							<Textarea
								className='min-h-16 text-sm'
								value={item.description}
								onChange={e => {
									const n = [...items];
									n[i] = { ...n[i], description: e.target.value };
									p({ items: n });
								}}
								disabled={d}
								placeholder='Mô tả'
								rows={2}
							/>
						</div>
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='size-8 shrink-0'
							disabled={d || items.length <= 1}
							onClick={() => p({ items: items.filter((_, j) => j !== i) })}
							aria-label='Xoá'
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
					disabled={d}
					onClick={() => p({ items: [...items, { title: '', description: '' }] })}
				>
					<PlusIcon className='size-4' /> Thêm dịch vụ
				</Button>
			</div>
		);
	}

	/* ─── Connection Items Editor (connection) ─── */
	function ConnectionItemsEditor({
		content: c,
		patch: p,
		disabled: d,
	}: {
		content: Record<string, unknown>;
		patch: (x: Record<string, unknown>) => void;
		disabled: boolean;
	}) {
		const items = Array.isArray(c.items) ? (c.items as { title: string; description: string }[]) : [];
		return (
			<div className='space-y-3'>
				<p className='text-sm font-medium'>Mục</p>
				{items.map((item, i) => (
					<div key={i} className='flex items-start gap-2 rounded-md border p-2'>
						<div className='flex-1 space-y-2'>
							<Input
								className='text-sm'
								value={item.title}
								onChange={e => {
									const n = [...items];
									n[i] = { ...n[i], title: e.target.value };
									p({ items: n });
								}}
								disabled={d}
								placeholder='Tiêu đề'
							/>
							<Textarea
								className='min-h-16 text-sm'
								value={item.description}
								onChange={e => {
									const n = [...items];
									n[i] = { ...n[i], description: e.target.value };
									p({ items: n });
								}}
								disabled={d}
								placeholder='Mô tả'
								rows={2}
							/>
						</div>
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='size-8 shrink-0'
							disabled={d || items.length <= 1}
							onClick={() => p({ items: items.filter((_, j) => j !== i) })}
							aria-label='Xoá'
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
					disabled={d}
					onClick={() => p({ items: [...items, { title: '', description: '' }] })}
				>
					<PlusIcon className='size-4' /> Thêm mục
				</Button>
			</div>
		);
	}

	function ImageListField({ disabled: d }: { disabled: boolean }) {
		const images = Array.isArray(content.images) ? (content.images as string[]) : [];
		const imageLinks = Array.isArray(content.imageLinks) ? (content.imageLinks as string[]) : [];
		return (
			<div className='space-y-3'>
				<p className='text-sm font-medium'>Ảnh</p>
				{images.map((u, i) => (
					<div key={i} className='flex items-start gap-2'>
						<div className='flex-1'>
							<ImageWithLinkField
								label={`Ảnh ${i + 1}`}
								value={u}
								linkValue={imageLinks[i] ?? ''}
								onChange={v => {
									const n = [...images];
									n[i] = v;
									patch({ images: n });
								}}
								onLinkChange={v => {
									const n = [...imageLinks];
									n[i] = v;
									patch({ imageLinks: n });
								}}
								disabled={d}
							/>
						</div>
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='mt-2 size-8 shrink-0'
							disabled={d || images.length <= 1}
							onClick={() => {
								patch({
									images: images.filter((_, j) => j !== i),
									imageLinks: imageLinks.filter((_, j) => j !== i),
								});
							}}
							aria-label='Xoá ảnh'
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
					disabled={d}
					onClick={() => patch({ images: [...images, ''], imageLinks: [...imageLinks, ''] })}
				>
					<PlusIcon className='size-4' /> Thêm ảnh
				</Button>
			</div>
		);
	}
}

/* ═══════════════════════════════════════
   MAIN — HomePageEditor with table list
   ═══════════════════════════════════════ */

export type HomePageEditorProps = {
	value: HomeContentV1;
	onChange: (next: HomeContentV1) => void;
	disabled: boolean;
};

export function HomePageEditor({ value, onChange, disabled }: HomePageEditorProps) {
	const [editingIdx, setEditingIdx] = React.useState<number | null>(null);

	if (editingIdx !== null) {
		const section = value.sections[editingIdx];
		if (!section) {
			setEditingIdx(null);
		} else {
			return (
				<SectionDetailEditor
					section={section}
					onChange={s =>
						onChange({ ...value, sections: value.sections.map((x, i) => (i === editingIdx ? s : x)) })
					}
					onBack={() => setEditingIdx(null)}
					disabled={disabled}
				/>
			);
		}
	}

	return <SectionListView value={value} onChange={onChange} disabled={disabled} onEdit={setEditingIdx} />;
}

/* ═══════════════════════════════════════
   SECTION LIST VIEW (table)
   ═══════════════════════════════════════ */

function SectionListView({
	value,
	onChange,
	disabled,
	onEdit,
}: {
	value: HomeContentV1;
	onChange: (v: HomeContentV1) => void;
	disabled: boolean;
	onEdit: (i: number) => void;
}) {
	const [templatePickerOpen, setTemplatePickerOpen] = React.useState(false);
	const [confirmRemoveIdx, setConfirmRemoveIdx] = React.useState<number | null>(null);

	React.useEffect(() => {
		if (templatePickerOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [templatePickerOpen]);

	// Page-level fonts
	const [showFonts, setShowFonts] = React.useState(false);

	const isProtected = (i: number) => value.sections[i]?.templateId === 'hero';

	function move(i: number, dir: -1 | 1) {
		const j = i + dir;
		if (j < 0 || j >= value.sections.length) return;
		if (isProtected(i) || isProtected(j)) return; // hero không được di chuyển
		const s = [...value.sections];
		[s[i], s[j]] = [s[j], s[i]];
		onChange({ ...value, sections: s });
	}

	function remove(i: number) {
		if (isProtected(i)) return; // hero không được xoá
		onChange({ ...value, sections: value.sections.filter((_, j) => j !== i) });
		setConfirmRemoveIdx(null);
	}

	// Hero pinned at first — handled by addSection ensuring hero always first

	return (
		<div>
			{/* Page fonts collapsed */}
			<Card className='mb-4'>
				<CardHeader className='py-3 cursor-pointer' onClick={() => setShowFonts(!showFonts)}>
					<div className='flex items-center justify-between'>
						<CardTitle className='text-sm font-semibold'>Cài đặt chung cho trang</CardTitle>
						<ChevronRightIcon className={`size-4 transition ${showFonts ? 'rotate-90' : ''}`} />
					</div>
				</CardHeader>
				{showFonts ? (
					<CardContent className='pb-4'>
						<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
							<Field>
								<FieldLabel>Font heading</FieldLabel>
								<div className='mt-1.5'>
									<FontSelect
										value={value.fonts.headingFamily}
										onChange={v =>
											onChange({ ...value, fonts: { ...value.fonts, headingFamily: v } })
										}
										disabled={disabled}
									/>
								</div>
							</Field>
							<Field>
								<FieldLabel>Font body</FieldLabel>
								<div className='mt-1.5'>
									<FontSelect
										value={value.fonts.bodyFamily}
										onChange={v => onChange({ ...value, fonts: { ...value.fonts, bodyFamily: v } })}
										disabled={disabled}
									/>
								</div>
							</Field>
							<Field>
								<FieldLabel>Cỡ heading</FieldLabel>
								<Select
									value={value.fonts.headingSize}
									onValueChange={v =>
										onChange({ ...value, fonts: { ...value.fonts, headingSize: v } })
									}
									disabled={disabled}
								>
									<SelectTrigger className='mt-1.5'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{FONT_SIZE_OPTIONS.map(o => (
											<SelectItem key={o.value} value={o.value}>
												{o.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel>Cỡ body</FieldLabel>
								<Select
									value={value.fonts.bodySize}
									onValueChange={v => onChange({ ...value, fonts: { ...value.fonts, bodySize: v } })}
									disabled={disabled}
								>
									<SelectTrigger className='mt-1.5'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{FONT_SIZE_OPTIONS.map(o => (
											<SelectItem key={o.value} value={o.value}>
												{o.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						</div>
					</CardContent>
				) : null}
			</Card>

			{/* Toolbar */}
			<div className='flex items-center justify-between mb-2'>
				<p className='text-sm font-medium'>Các mục trên trang ({value.sections.length})</p>
				<Button
					type='button'
					size='sm'
					className='gap-1.5'
					disabled={disabled}
					onClick={() => setTemplatePickerOpen(true)}
				>
					<PlusIcon className='size-4' /> Thêm mục mới
				</Button>
			</div>

			{/* Template picker modal */}
			{templatePickerOpen && typeof document !== 'undefined'
				? createPortal(
						<div
							className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40'
							onClick={() => setTemplatePickerOpen(false)}
						>
							<Card
								className='w-full max-w-4xl max-h-[80vh] overflow-y-auto mx-4 shadow-2xl'
								onClick={e => e.stopPropagation()}
							>
								<CardHeader>
									<CardTitle className='text-base'>Chọn mẫu nội dung</CardTitle>
									<CardDescription>
										Chọn một mẫu để thêm vào trang. Sau khi chọn bạn sẽ chỉnh sửa nội dung ngay.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
										{TEMPLATE_IDS.filter(t => t !== 'hero').map(tid => (
											<button
												key={tid}
												type='button'
												className='flex flex-col items-start gap-2 rounded-xl border p-4 text-left hover:border-primary hover:bg-accent/30 transition'
												onClick={() => {
													const s = [...value.sections, newHomeSection(tid)];
													const hi = s.findIndex(x => x.templateId === 'hero');
													if (hi > 0) {
														const [h] = s.splice(hi, 1);
														s.unshift(h);
													}
													const newIdx = s.length - 1;
													onChange({ ...value, sections: s });
													setTemplatePickerOpen(false);
													setTimeout(() => onEdit(newIdx), 50);
												}}
											>
												<span className='text-lg'>{TEMPLATE_PREVIEW_ICONS[tid] ?? '📄'}</span>
												<span className='font-semibold text-sm'>{TEMPLATE_LABELS[tid]}</span>
												<span className='text-xs text-muted-foreground'>
													{templateDescriptions[tid] ?? ''}
												</span>
												<div className='mt-1 w-full h-16 rounded-lg bg-muted/30 flex items-center justify-center text-[10px] text-muted-foreground/60 px-2 text-center leading-tight'>
													{TEMPLATE_PREVIEW_TEXT[tid] ?? ''}
												</div>
											</button>
										))}
									</div>
								</CardContent>
							</Card>
						</div>,
						document.body
					)
				: null}

			{/* Table list */}
			<div className='overflow-hidden rounded-lg border'>
				<table className='w-full text-sm'>
					<thead className='bg-muted/50 text-xs uppercase text-muted-foreground'>
						<tr>
							<th className='w-8 px-2 py-2 text-center'>#</th>
							<th className='px-2 py-2 text-left'>Tên mục</th>
							<th className='px-2 py-2 text-left hidden sm:table-cell'>Loại</th>
							<th className='w-24 px-2 py-2 text-center'>Vị trí</th>
							<th className='w-10 px-2 py-2'></th>
						</tr>
					</thead>
					<tbody className='divide-y'>
						{value.sections.length === 0 ? (
							<tr>
								<td colSpan={5} className='px-4 py-8 text-center text-muted-foreground'>
									Chưa có mục nào. Bấm "Thêm mục mới" để bắt đầu.
								</td>
							</tr>
						) : (
							value.sections.map((section, i) => (
								<tr
									key={section.id}
									className={`group cursor-pointer hover:bg-muted/20 ${isProtected(i) ? 'bg-muted/10' : ''}`}
									onClick={() => onEdit(i)}
								>
									<td className='px-2 py-2.5 text-center text-muted-foreground font-mono text-xs'>
										{i + 1}
									</td>
									<td className='px-2 py-2.5'>
										<span className='font-medium'>{section.label}</span>
										{isProtected(i) ? (
											<span className='ml-2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap truncate'>
												1/{value.sections.length}
											</span>
										) : null}
									</td>
									<td className='px-2 py-2.5 text-muted-foreground text-xs hidden sm:table-cell'>
										{TEMPLATE_LABELS[section.templateId] ?? section.templateId}
									</td>
									<td className='px-2 py-2.5 text-center'>
										<div className='flex items-center justify-center gap-0.5'>
											<button
												type='button'
												disabled={disabled || i === 0 || isProtected(i) || isProtected(i - 1)}
												className='size-7 rounded hover:bg-accent disabled:opacity-20'
												onClick={e => {
													e.stopPropagation();
													move(i, -1);
												}}
												aria-label='Lên'
											>
												<ChevronLeftIcon className='size-3.5 mx-auto rotate-90' />
											</button>
											<span className='text-xs text-muted-foreground w-6 text-center'>
												{isProtected(i) ? 'Cố định' : `${i + 1}/${value.sections.length}`}
											</span>
											<button
												type='button'
												disabled={
													disabled ||
													i === value.sections.length - 1 ||
													isProtected(i) ||
													isProtected(i + 1)
												}
												className='size-7 rounded hover:bg-accent disabled:opacity-20'
												onClick={e => {
													e.stopPropagation();
													move(i, 1);
												}}
												aria-label='Xuống'
											>
												<ChevronRightIcon className='size-3.5 mx-auto rotate-90' />
											</button>
										</div>
									</td>
									<td className='px-2 py-2.5 text-right'>
										{isProtected(i) ? null : (
											<button
												type='button'
												disabled={disabled}
												className='size-7 rounded text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition'
												onClick={function (e) {
													e.stopPropagation();
													setConfirmRemoveIdx(i);
												}}
												aria-label='Xoá'
											>
												<Trash2Icon className='size-3.5 mx-auto' />
											</button>
										)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Remove confirm */}
			<AlertDialog
				open={confirmRemoveIdx !== null}
				onOpenChange={o => {
					if (!o) setConfirmRemoveIdx(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xoá mục này?</AlertDialogTitle>
						<AlertDialogDescription>
							Mục{' '}
							<span className='font-medium text-foreground'>
								{confirmRemoveIdx !== null ? value.sections[confirmRemoveIdx]?.label : ''}
							</span>{' '}
							sẽ bị xoá khỏi trang chủ.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={disabled}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							disabled={disabled}
							className='bg-destructive text-destructive-foreground'
							onClick={() => {
								if (confirmRemoveIdx !== null) remove(confirmRemoveIdx);
							}}
						>
							Xoá
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

const templateDescriptions: Record<string, string> = {
	hero: 'Banner lớn đầu trang với ảnh nền và nút bấm',
	'soul-jewelry': 'Giới thiệu với chữ, pillars và 3 ảnh trang sức',
	'healing-space': 'Không gian với ảnh ghép và danh sách dịch vụ',
	connection: 'Banner toàn màn hình với 3 mục giới thiệu',
	'two-column': 'Một cột chữ và một cột ảnh đặt cạnh nhau',
	'grid-cards': 'Nhiều thẻ có ảnh nền xếp lưới',
	gallery: 'Bộ sưu tập ảnh dạng lưới',
	'featured-products': 'Danh sách sản phẩm nổi bật',
	video: 'Video YouTube nhúng vào trang',
	'cta-banner': 'Banner kêu gọi với ảnh nền và nút',
	'rich-text': 'Nội dung văn bản có thể định dạng',
	'customer-feedbacks': 'Phản hồi từ khách hàng',
	'split-blocks': 'Nhiều nhóm nội dung với danh sách',
};

const TEMPLATE_PREVIEW_ICONS: Record<string, string> = {
	'soul-jewelry': '💎',
	'healing-space': '🏡',
	connection: '🤝',
	'two-column': '📐',
	'grid-cards': '📇',
	gallery: '🖼️',
	'featured-products': '🏷️',
	video: '🎬',
	'cta-banner': '📣',
	'rich-text': '📝',
	'customer-feedbacks': '⭐',
	'split-blocks': '🧩',
};

const TEMPLATE_PREVIEW_TEXT: Record<string, string> = {
	'soul-jewelry': 'Chữ + pillars + 3 ảnh (1 lớn + 2 nhỏ)',
	'healing-space': '2 ảnh chồng + card info + items',
	connection: 'Bg toàn màn hình + 3 column items',
	'two-column': 'Chữ + ảnh 2 cột, tuỳ chỉnh layout',
	'grid-cards': 'Card ảnh overlay, 2-4 cột',
	gallery: 'Grid/masonry nhiều ảnh',
	'featured-products': 'Lấy từ danh sách sản phẩm',
	video: 'YouTube embed, autoplay',
	'cta-banner': 'Banner ảnh + text + nút',
	'rich-text': 'HTML thuần, căn trái/giữa/phải',
	'customer-feedbacks': 'Phản hồi từ API',
	'split-blocks': 'Groups + danh sách + CTA',
};
