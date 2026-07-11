import { type AdminCampaignRow } from '@/api/admin-campaigns';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
	Drawer,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerPageContent,
	DrawerTitle,
} from '@/components/ui/drawer';
import { SingleImageUrlDropzone } from '@/components/common/single-image-url-dropzone';
import { digitsOnly, type FieldErrorMap } from '@/lib/form-field-ui';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api-client';

type CampaignFormDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	formBusy: boolean;
	formError: string | null;
	fieldErrors: FieldErrorMap;
	formTitle: string;
	formSlug: string;
	formDescription: string;
	formBannerImageUrl: string;
	formStartsAt: string;
	formEndsAt: string;
	formSortOrder: string;
	formStatus: AdminCampaignRow['status'];
	onFormTitleChange: (value: string) => void;
	onFormSlugChange: (value: string) => void;
	onFormDescriptionChange: (value: string) => void;
	onFormBannerImageUrlChange: (value: string) => void;
	onFormStartsAtChange: (value: string) => void;
	onFormEndsAtChange: (value: string) => void;
	onFormSortOrderChange: (value: string) => void;
	onFormStatusChange: (value: AdminCampaignRow['status']) => void;
	onSubmit: () => void;
	onFieldErrorStrip: (field: string) => void;
};

export function CampaignFormDrawer({
	open,
	onOpenChange,
	formBusy,
	formError,
	fieldErrors,
	formTitle,
	formSlug,
	formDescription,
	formBannerImageUrl,
	formStartsAt,
	formEndsAt,
	formSortOrder,
	formStatus,
	onFormTitleChange,
	onFormSlugChange,
	onFormDescriptionChange,
	onFormBannerImageUrlChange,
	onFormStartsAtChange,
	onFormEndsAtChange,
	onFormSortOrderChange,
	onFormStatusChange,
	onSubmit,
	onFieldErrorStrip,
}: CampaignFormDrawerProps) {
	return (
		<Drawer open={open} onOpenChange={onOpenChange} modal shouldScaleBackground={false}>
			<DrawerPageContent className='flex flex-col gap-0 p-0' showCloseButton>
				<DrawerHeader className='shrink-0 border-b px-6 py-5 pr-16 text-left'>
					<DrawerTitle>Chiến dịch mới</DrawerTitle>
					<DrawerDescription className='mt-1.5 max-w-2xl'>
						Tạo chiến dịch khuyến mãi mới. Có thể thêm mã giảm giá vào chiến dịch sau.
					</DrawerDescription>
				</DrawerHeader>

				<div className='min-h-0 flex-1 overflow-y-auto'>
					<div className='mx-auto w-full max-w-6xl px-6 py-6 pb-8'>
						{formError ? (
							<p className='text-destructive bg-destructive/10 mb-6 rounded-md px-3 py-2 text-sm'>
								{formError}
							</p>
						) : null}

						<FieldGroup className='flex flex-col gap-8'>
							<section className='space-y-4'>
								<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
									Thông tin chiến dịch
								</p>
								<div className='grid gap-4 lg:grid-cols-2'>
									<Field>
										<FieldLabel htmlFor='camp-title'>Tên chiến dịch</FieldLabel>
										<Input
											id='camp-title'
											value={formTitle}
											onChange={e => {
												onFormTitleChange(e.target.value);
												onFieldErrorStrip('camp-title');
											}}
											disabled={formBusy}
											aria-invalid={Boolean(fieldErrors['camp-title'])}
											className={cn(fieldErrors['camp-title'] && 'border-destructive')}
										/>
										{fieldErrors['camp-title'] ? (
											<p className='text-destructive mt-1 text-xs'>{fieldErrors['camp-title']}</p>
										) : null}
									</Field>
									<Field>
										<FieldLabel htmlFor='camp-slug'>Slug (URL, tuỳ chọn)</FieldLabel>
										<Input
											id='camp-slug'
											value={formSlug}
											onChange={e => {
												onFormSlugChange(e.target.value);
												onFieldErrorStrip('camp-slug');
											}}
											disabled={formBusy}
											aria-invalid={Boolean(fieldErrors['camp-slug'])}
											className={cn(fieldErrors['camp-slug'] && 'border-destructive')}
											placeholder='VD: he-ruc-ro'
										/>
										{fieldErrors['camp-slug'] ? (
											<p className='text-destructive mt-1 text-xs'>{fieldErrors['camp-slug']}</p>
										) : null}
									</Field>
								</div>
								<Field>
									<FieldLabel htmlFor='camp-desc'>Mô tả</FieldLabel>
									<Textarea
										id='camp-desc'
										value={formDescription}
										onChange={e => onFormDescriptionChange(e.target.value)}
										disabled={formBusy}
										rows={3}
										className='min-h-20 w-full'
									/>
								</Field>
								<Field>
									<FieldLabel>Banner Image (tuỳ chọn)</FieldLabel>
									<SingleImageUrlDropzone
										label='Kéo thả hoặc click để tải ảnh banner'
										hint='định dạng: JPG, PNG, GIF, WebP, SVG'
										url={formBannerImageUrl || ''}
										onUrlChange={url => {
											onFormBannerImageUrlChange(url);
											onFieldErrorStrip('camp-banner');
										}}
										disabled={formBusy}
										onUploadFile={async file => {
											try {
												const formData = new FormData();
												formData.append('file', file);
												const response = await apiFetch('/upload/promotion-banner', {
													method: 'POST',
													body: formData,
												});
												if (!response.ok) {
													const errorData = await response
														.json()
														.catch(() => ({ message: 'Upload failed' }));
													throw new Error(errorData.message || 'Upload failed');
												}
												const data = await response.json();
												onFormBannerImageUrlChange(data.url);
												onFieldErrorStrip('camp-banner');
											} catch (error) {
												console.error('Upload error:', error);
												alert(error instanceof Error ? error.message : 'Không thể tải ảnh lên');
											}
										}}
										hasError={Boolean(fieldErrors['camp-banner'])}
									/>
								</Field>
							</section>

							<section className='space-y-4'>
								<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
									Thời gian & hiển thị
								</p>
								<div className='grid gap-4 lg:grid-cols-2'>
									<Field>
										<FieldLabel htmlFor='camp-starts'>Bắt đầu (tuỳ chọn)</FieldLabel>
										<Input
											id='camp-starts'
											type='date'
											value={formStartsAt}
											onChange={e => onFormStartsAtChange(e.target.value)}
											disabled={formBusy}
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor='camp-ends'>Kết thúc (tuỳ chọn)</FieldLabel>
										<Input
											id='camp-ends'
											type='date'
											value={formEndsAt}
											onChange={e => onFormEndsAtChange(e.target.value)}
											disabled={formBusy}
										/>
									</Field>
								</div>
								<div className='grid gap-4 lg:grid-cols-2'>
									<Field>
										<FieldLabel htmlFor='camp-sort'>Thứ tự hiển thị</FieldLabel>
										<Input
											id='camp-sort'
											inputMode='numeric'
											pattern='[0-9]*'
											value={formSortOrder}
											onChange={e => onFormSortOrderChange(digitsOnly(e.target.value))}
											disabled={formBusy}
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor='camp-status'>Trạng thái</FieldLabel>
										<Select
											value={formStatus}
											onValueChange={v => onFormStatusChange(v as AdminCampaignRow['status'])}
											disabled={formBusy}
										>
											<SelectTrigger id='camp-status'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectItem value='DRAFT'>Nháp</SelectItem>
													<SelectItem value='ACTIVE'>Hoạt động</SelectItem>
													<SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
									</Field>
								</div>
							</section>
						</FieldGroup>
					</div>
				</div>

				<DrawerFooter className='mt-auto shrink-0 border-t px-0 py-0'>
					<div className='mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 sm:flex-row sm:justify-end'>
						<Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={formBusy}>
							Hủy
						</Button>
						<Button type='button' onClick={onSubmit} disabled={formBusy}>
							{formBusy ? 'Đang lưu…' : 'Lưu'}
						</Button>
					</div>
				</DrawerFooter>
			</DrawerPageContent>
		</Drawer>
	);
}
