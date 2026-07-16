import { uploadProductImage } from '@/api/admin-products';
import { AuthApiError } from '@/auth/auth-api';
import { FileUpload } from '@/components/common/file-upload';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { ImageIcon, Link2Icon, Trash2Icon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export type OgImageEditorProps = {
	value: string;
	productImages: string[];
	onSave: (next: string) => void;
	disabled?: boolean;
};

export function OgImageEditor({ value, productImages, onSave, disabled }: OgImageEditorProps) {
	const [urlDraft, setUrlDraft] = React.useState('');
	const [uploadBusy, setUploadBusy] = React.useState(false);

	const hasOg = !!value;
	const previewUrl = value ? publicAssetUrl(value) : null;

	function setAndSave(url: string) {
		const t = url.trim();
		if (!t) return;
		onSave(t);
		setUrlDraft('');
	}

	async function handleUploaded(files: { url: string; file: File }[]) {
		const f = files[0];
		if (!f) return;
		setUploadBusy(true);
		try {
			const { url } = await uploadProductImage(f.file);
			if (url) {
				onSave(url);
				toast.success('Đã cập nhật ảnh OG');
			}
		} catch (err) {
			toast.error(err instanceof AuthApiError ? err.message : 'Tải ảnh thất bại');
		} finally {
			URL.revokeObjectURL(f.url);
			setUploadBusy(false);
		}
	}

	return (
		<div className='space-y-3'>
			<label className='text-xs font-medium text-muted-foreground'>OG Image (Ảnh chia sẻ)</label>

			{/* Preview — giống ảnh sản phẩm */}
			<div className='bg-card flex items-center gap-3 rounded-lg border p-2 pr-3'>
				<div className='relative shrink-0'>
					{previewUrl ? (
						<>
							<img src={previewUrl} alt='' className='bg-muted size-14 rounded-md border object-cover' />
							<Badge
								variant='default'
								className='pointer-events-none absolute -right-1 -top-1 h-5 min-w-5 px-1 text-[10px] font-semibold leading-none'
							>
								OG
							</Badge>
						</>
					) : (
						<div className='bg-muted flex size-14 items-center justify-center rounded-md border text-muted-foreground'>
							<ImageIcon className='size-5' />
						</div>
					)}
				</div>
				<div className='min-w-0 flex-1'>
					{previewUrl ? (
						<p className='truncate font-mono text-xs' title={value}>
							{value}
						</p>
					) : (
						<p className='text-xs text-muted-foreground'>Mặc định: ảnh sản phẩm</p>
					)}
				</div>
				{previewUrl ? (
					<Button
						type='button'
						variant='ghost'
						size='icon'
						className='text-muted-foreground shrink-0'
						disabled={disabled}
						onClick={() => { onSave(''); toast.success('Đã xóa OG Image — sẽ dùng ảnh sản phẩm mặc định'); }}
						aria-label='Xóa ảnh OG'
					>
						<Trash2Icon className='size-4' />
					</Button>
				) : null}
			</div>

			{/* URL input + Add — giống ảnh sản phẩm */}
			<div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
				<Input
					value={urlDraft}
					onChange={e => setUrlDraft(e.target.value)}
					disabled={disabled}
					placeholder='https://… hoặc /upload/…'
					className='min-w-0 flex-1'
					onKeyDown={e => {
						if (e.key === 'Enter') { e.preventDefault(); setAndSave(urlDraft); }
					}}
				/>
				<Button type='button' variant='outline' disabled={disabled} onClick={() => setAndSave(urlDraft)} className='sm:shrink-0'>
					<Link2Icon className='size-4' />
				</Button>
			</div>

			{/* File upload — giống ảnh sản phẩm */}
			<FileUpload
				label='Tải file ảnh lên'
				hint='JPEG, PNG, WebP, GIF — thay thế OG Image hiện tại.'
				formats={SUPPORTED_FORMATS}
				hasError={false}
				disabled={Boolean(disabled) || uploadBusy}
				onUploaded={files => void handleUploaded(files)}
			/>
			{uploadBusy ? <p className='text-xs text-muted-foreground'>Đang tải ảnh lên…</p> : null}

			{/* Grid chọn từ ảnh sản phẩm */}
			{productImages.length > 0 ? (
				<div className='space-y-1.5'>
					<p className='text-xs text-muted-foreground'>Chọn từ ảnh sản phẩm:</p>
					<div className='flex flex-wrap gap-2'>
						{productImages.map((img, i) => (
							<button
								key={img}
								type='button'
								onClick={() => { onSave(img); toast.success('Đã cập nhật OG Image'); }}
								disabled={disabled}
								className={`relative size-14 overflow-hidden rounded-md border transition-all hover:ring-2 hover:ring-primary/50 ${
									value === img ? 'ring-2 ring-primary border-primary' : 'border-border'
								}`}
								title={`Ảnh ${i + 1}`}
							>
								<img
									src={publicAssetUrl(img)}
									alt={`Ảnh ${i + 1}`}
									className='size-full object-cover'
									loading='lazy'
								/>
							</button>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
}
