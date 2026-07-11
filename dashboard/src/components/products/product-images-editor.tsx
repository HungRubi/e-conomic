import { uploadProductImage } from '@/api/admin-products';
import { generateId } from '@/lib/generate-id';
import { AuthApiError } from '@/auth/auth-api';
import { FileUpload, type FileType } from '@/components/common/file-upload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { cn } from '@/lib/utils';
import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

export type ProductImageEntry = { id: string; url: string };

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

function hasInvalidType(files: FileType[]) {
	return files.find(f => !SUPPORTED_FORMATS.includes(f.file.type));
}

type SortableRowProps = {
	entry: ProductImageEntry;
	index: number;
	disabled: boolean;
	onDelete: () => void;
};

function SortableImageRow({ entry, index, disabled, onDelete }: SortableRowProps) {
	const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
		id: entry.id,
	});

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<li
			ref={setNodeRef}
			style={style}
			className={cn(
				'bg-card flex items-center gap-3 rounded-lg border p-2 pr-3',
				isDragging && 'opacity-60 ring-2 ring-foreground/20'
			)}
		>
			<button
				type='button'
				className='text-muted-foreground hover:text-foreground touch-none p-1 disabled:pointer-events-none disabled:opacity-40'
				ref={setActivatorNodeRef}
				{...listeners}
				{...attributes}
				disabled={disabled}
				aria-label='Kéo để đổi thứ tự'
			>
				<GripVerticalIcon className='size-5' />
			</button>
			<div className='relative shrink-0'>
				<img
					src={publicAssetUrl(entry.url)}
					alt=''
					className='bg-muted size-14 rounded-md border object-cover'
				/>
				{index === 0 ? (
					<Badge
						variant='default'
						className='pointer-events-none absolute -right-1 -top-1 h-5 min-w-5 px-1 text-[10px] font-semibold leading-none'
					>
						Chính
					</Badge>
				) : null}
			</div>
			<div className='min-w-0 flex-1'>
				<p className='truncate font-mono text-xs' title={entry.url}>
					{entry.url}
				</p>
			</div>
			<Button
				type='button'
				variant='ghost'
				size='icon'
				className='text-muted-foreground shrink-0'
				disabled={disabled}
				onClick={onDelete}
				aria-label='Xóa ảnh'
			>
				<Trash2Icon className='size-4' />
			</Button>
		</li>
	);
}

type ProductImagesEditorProps = {
	entries: ProductImageEntry[];
	onEntriesChange: (next: ProductImageEntry[]) => void;
	disabled?: boolean;
	/** Lỗi validate — hiển thị dưới khối ảnh, cuộn tới `fieldId` */
	fieldError?: string | null;
};

export function ProductImagesEditor({ entries, onEntriesChange, disabled, fieldError }: ProductImagesEditorProps) {
	const [uploadBusy, setUploadBusy] = React.useState(false);
	const [urlDraft, setUrlDraft] = React.useState('');
	const [activeId, setActiveId] = React.useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor)
	);

	const activeEntry = activeId ? entries.find(e => e.id === activeId) : undefined;

	function handleDragStart(e: DragStartEvent) {
		setActiveId(String(e.active.id));
	}

	function handleDragEnd(e: DragEndEvent) {
		setActiveId(null);
		const { active, over } = e;
		if (!over || active.id === over.id) return;
		const oldIndex = entries.findIndex(x => x.id === active.id);
		const newIndex = entries.findIndex(x => x.id === over.id);
		if (oldIndex < 0 || newIndex < 0) return;
		onEntriesChange(arrayMove(entries, oldIndex, newIndex));
	}

	function handleDragCancel() {
		setActiveId(null);
	}

	async function handleUploaded(files: FileType[]) {
		const bad = hasInvalidType(files);
		if (bad) {
			files.forEach(f => URL.revokeObjectURL(f.url));
			toast.error(`định dạng không hỗ trợ: ${bad.file.name}`);
			return;
		}

		setUploadBusy(true);
		try {
			const uploaded: string[] = [];
			for (const f of files) {
				try {
					const { url } = await uploadProductImage(f.file);
					uploaded.push(url);
				} catch (err) {
					toast.error(err instanceof AuthApiError ? err.message : 'Tải ảnh thất bại');
				} finally {
					URL.revokeObjectURL(f.url);
				}
			}
			if (uploaded.length) {
				const appended = uploaded.map(url => ({ id: generateId(), url }));
				onEntriesChange([...entries, ...appended]);
				toast.success(`đã tải ${uploaded.length} ảnh`);
			}
		} finally {
			setUploadBusy(false);
		}
	}

	function appendUrl() {
		const t = urlDraft.trim();
		if (!t) return;
		if (entries.some(e => e.url.trim() === t)) {
			toast.message('URL đã có trong danh sách');
			return;
		}
		onEntriesChange([...entries, { id: generateId(), url: t }]);
		setUrlDraft('');
	}

	function removeAt(i: number) {
		onEntriesChange(entries.filter((_, idx) => idx !== i));
	}

	return (
		<div id='pf-images' className='space-y-4'>
			{fieldError ? <p className='text-destructive text-sm'>{fieldError}</p> : null}
			<Field>
				<FieldLabel htmlFor='pf-image-url-append'>Thêm ảnh bằng URL</FieldLabel>
				<div className='mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-center'>
					<Input
						id='pf-image-url-append'
						value={urlDraft}
						onChange={e => setUrlDraft(e.target.value)}
						disabled={disabled}
						placeholder='https://… hoặc /upload/…'
						className='min-w-0 flex-1'
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.preventDefault();
								appendUrl();
							}
						}}
					/>
					<Button
						type='button'
						variant='outline'
						disabled={disabled}
						onClick={appendUrl}
						className='sm:shrink-0'
					>
						Thêm URL
					</Button>
				</div>
			</Field>

			<FileUpload
				label='Thêm nhiều ảnh'
				hint='JPEG, PNG, WebP, GIF, SVG — có thể chọn nhiều file cùng lúc. Ảnh đầu danh sách là ảnh chính (thumbnail).'
				formats={SUPPORTED_FORMATS}
				hasError={false}
				disabled={Boolean(disabled) || uploadBusy}
				onUploaded={files => void handleUploaded(files)}
			/>
			{uploadBusy ? <p className='text-muted-foreground text-xs'>Đang tải ảnh lên…</p> : null}

			{entries.length > 0 ? (
				<div>
					<p className='text-muted-foreground mb-2 text-xs'>Kéo để sắp xếp — ảnh đầu là ảnh chính.</p>
					<DndContext
						sensors={sensors}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
						onDragCancel={handleDragCancel}
					>
						<SortableContext items={entries.map(e => e.id)} strategy={verticalListSortingStrategy}>
							<ul className='flex flex-col gap-2'>
								{entries.map((entry, index) => (
									<SortableImageRow
										key={entry.id}
										entry={entry}
										index={index}
										disabled={Boolean(disabled)}
										onDelete={() => removeAt(index)}
									/>
								))}
							</ul>
						</SortableContext>
						<DragOverlay dropAnimation={null}>
							{activeEntry ? (
								<div className='bg-card flex items-center gap-3 rounded-lg border p-2 ring-2 ring-foreground/20'>
									<GripVerticalIcon className='text-muted-foreground size-5 shrink-0' />
									<img
										src={publicAssetUrl(activeEntry.url)}
										alt=''
										className='bg-muted size-14 rounded-md border object-cover'
									/>
								</div>
							) : null}
						</DragOverlay>
					</DndContext>
				</div>
			) : null}
		</div>
	);
}
