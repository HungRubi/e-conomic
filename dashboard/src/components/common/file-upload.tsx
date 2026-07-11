import { cn } from '@/lib/utils';
import { ImageDownIcon } from 'lucide-react';
import { type ChangeEvent, type DragEvent, useRef, useState } from 'react';

export interface FileType {
	id: string;
	url: string;
	file: File;
}

export interface FileUploadProps {
	label: string;
	multiple?: boolean;
	hint?: string;
	hasError?: boolean;
	/** Khi có URL ảnh (đã lưu / preview), hiển thị ngay trong vùng kéo-thả. */
	previewSrc?: string | null;
	formats: string[];
	disabled?: boolean;
	onUploaded: (files: FileType[]) => void;
}

export function FileUpload({
	label,
	hint,
	multiple = true,
	hasError,
	previewSrc,
	formats,
	disabled,
	onUploaded,
}: FileUploadProps) {
	const [isDragOver, setIsDragOver] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const dropZoneRef = useRef<HTMLButtonElement>(null);

	function handleOpenFileSelector() {
		if (disabled) return;
		inputRef.current?.click();
	}

	function handleDragEnter(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (disabled) return;
		const files = event.dataTransfer?.files;
		if (!files?.length) return;
		setIsDragOver(true);
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (!dropZoneRef.current || dropZoneRef.current.contains(event.relatedTarget as Node)) {
			return;
		}
		setIsDragOver(false);
	}

	function handleUploaded(files: FileList | null) {
		if (!files?.length) return;
		const fileList = Array.from(files);
		const fileObj = fileList.map(file => {
			const id = Math.random().toString(36).slice(2, 11);
			const previewUrl = URL.createObjectURL(file);
			return { id, url: previewUrl, file };
		});
		onUploaded(fileObj);
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		setIsDragOver(false);
		if (disabled) return;
		handleUploaded(event.dataTransfer?.files ?? null);
	}

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		handleUploaded(event.target.files);
		event.target.value = '';
	}

	return (
		<div>
			<button
				ref={dropZoneRef}
				type='button'
				disabled={disabled}
				onClick={handleOpenFileSelector}
				onDrop={handleDrop}
				onDragOver={e => e.preventDefault()}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				className={cn(
					'border-border bg-muted/30 flex w-full flex-col items-center gap-2 rounded-lg border border-dashed transition-colors',
					previewSrc ? 'p-4' : 'p-8',
					'hover:border-primary/60 focus-visible:border-primary focus-visible:ring-ring outline-none focus-visible:ring-2',
					!disabled && 'cursor-pointer',
					disabled && 'pointer-events-none opacity-50',
					hasError && 'border-destructive',
					isDragOver && !disabled && 'border-primary bg-primary/5'
				)}
			>
				{previewSrc ? (
					<>
						<div className='bg-muted relative w-full max-w-sm overflow-hidden rounded-md border'>
							<img
								src={previewSrc}
								alt=''
								className='mx-auto max-h-40 w-full object-contain'
								loading='lazy'
							/>
						</div>
						<div className='text-muted-foreground flex flex-col items-center gap-1 text-center'>
							<span className='text-sm font-medium text-foreground'>{label}</span>
							{hint ? <span className='max-w-md text-xs leading-relaxed'>{hint}</span> : null}
						</div>
					</>
				) : (
					<>
						<div className='text-muted-foreground flex items-center gap-2'>
							<ImageDownIcon className='size-5 shrink-0' aria-hidden />
							<span className='text-sm font-medium'>{label}</span>
						</div>
						{hint ? (
							<span className='text-muted-foreground max-w-md text-center text-xs leading-relaxed'>
								{hint}
							</span>
						) : null}
					</>
				)}
			</button>
			<input
				hidden
				ref={inputRef}
				onChange={handleFileChange}
				type='file'
				accept={formats.join(',')}
				multiple={multiple}
				disabled={disabled}
			/>
		</div>
	);
}
