import { type FileType, FileUpload } from '@/components/common/file-upload';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { cn } from '@/lib/utils';

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export type SingleImageUrlDropzoneProps = {
	label: string;
	hint?: string;
	url: string;
	/** Gọi khi URL đổi (ví dụ sau upload file). Không còn ô nhập URL thủ công. */
	onUrlChange?: (next: string) => void;
	disabled?: boolean;
	uploadBusy?: boolean;
	onUploadFile: (file: File) => Promise<void>;
	hasError?: boolean;
};

/**
 * Một ảnh: kéo thả / chọn file; preview hiển thị trong vùng file loader (không nhập URL tay).
 */
export function SingleImageUrlDropzone({
	label,
	hint,
	url,
	disabled,
	uploadBusy,
	onUploadFile,
	hasError,
}: SingleImageUrlDropzoneProps) {
	const busy = Boolean(disabled) || Boolean(uploadBusy);
	const trimmed = url.trim();
	const previewSrc = trimmed ? publicAssetUrl(trimmed) : null;

	async function onUploaded(files: FileType[]) {
		const f = files[0];
		if (!f) return;
		await onUploadFile(f.file);
	}

	return (
		<div
			className={cn(
				'border-border overflow-hidden rounded-lg border bg-background',
				hasError && 'border-destructive'
			)}
		>
			<FileUpload
				label={label}
				hint={hint}
				multiple={false}
				formats={SUPPORTED_FORMATS}
				hasError={hasError}
				previewSrc={previewSrc}
				disabled={busy}
				onUploaded={files => void onUploaded(files)}
			/>
		</div>
	);
}
