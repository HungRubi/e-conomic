import { type AdminPromotionDiscountRow } from '@/api/admin-promotion-discounts';
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
import { MultiSelectCombobox, type ComboboxOption } from '@/components/ui/multi-select-combobox';
import { digitsOnly, type FieldErrorMap } from '@/lib/form-field-ui';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api-client';

type PromotionDiscountFormDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editing: AdminPromotionDiscountRow | null;
	formBusy: boolean;
	formError: string | null;
	fieldErrors: FieldErrorMap;
	formTitle: string;
	formCode: string;
	formDescription: string;
	formBannerImageUrl: string;
	formType: 'PERCENT' | 'FIXED_AMOUNT';
	formValue: string;
	formMinOrderVnd: string;
	formMaxDiscountVnd: string;
	formUsageLimit: string;
	formPerUserLimit: string;
	formAppliesTo: 'ALL_PRODUCTS' | 'PRODUCTS' | 'CATEGORIES';
	formProductIds: string[];
	formCategoryIds: string[];
	formStartsAt: string;
	formEndsAt: string;
	formSortOrder: string;
	formCtaLabel: string;
	formCtaUrl: string;
	formStatus: AdminPromotionDiscountRow['status'];
	formCampaignId?: string;
	productOptions: ComboboxOption[];
	categoryOptions: ComboboxOption[];
	campaignOptions?: ComboboxOption[];
	onFormTitleChange: (value: string) => void;
	onFormCodeChange: (value: string) => void;
	onFormDescriptionChange: (value: string) => void;
	onFormBannerImageUrlChange: (value: string) => void;
	onFormTypeChange: (value: 'PERCENT' | 'FIXED_AMOUNT') => void;
	onFormValueChange: (value: string) => void;
	onFormMinOrderVndChange: (value: string) => void;
	onFormMaxDiscountVndChange: (value: string) => void;
	onFormUsageLimitChange: (value: string) => void;
	onFormPerUserLimitChange: (value: string) => void;
	onFormAppliesToChange: (value: 'ALL_PRODUCTS' | 'PRODUCTS' | 'CATEGORIES') => void;
	onFormProductIdsChange: (value: string[]) => void;
	onFormCategoryIdsChange: (value: string[]) => void;
	onFormStartsAtChange: (value: string) => void;
	onFormEndsAtChange: (value: string) => void;
	onFormSortOrderChange: (value: string) => void;
	onFormCtaLabelChange: (value: string) => void;
	onFormCtaUrlChange: (value: string) => void;
	onFormStatusChange: (value: AdminPromotionDiscountRow['status']) => void;
	onFormCampaignIdChange?: (value: string) => void;
	onSubmit: () => void;
	onFieldErrorStrip: (field: string) => void;
};

export function PromotionDiscountFormDrawer({
	open,
	onOpenChange,
	editing,
	formBusy,
	formError,
	fieldErrors,
	formTitle,
	formCode,
	formDescription,
	formBannerImageUrl,
	formType,
	formValue,
	formMinOrderVnd,
	formMaxDiscountVnd,
	formUsageLimit,
	formPerUserLimit,
	formAppliesTo,
	formProductIds,
	formCategoryIds,
	formStartsAt,
	formEndsAt,
	formSortOrder,
	formCtaLabel,
	formCtaUrl,
	formStatus,
	formCampaignId,
	productOptions,
	categoryOptions,
	campaignOptions,
	onFormTitleChange,
	onFormCodeChange,
	onFormDescriptionChange,
	onFormBannerImageUrlChange,
	onFormTypeChange,
	onFormValueChange,
	onFormMinOrderVndChange,
	onFormMaxDiscountVndChange,
	onFormUsageLimitChange,
	onFormPerUserLimitChange,
	onFormAppliesToChange,
	onFormProductIdsChange,
	onFormCategoryIdsChange,
	onFormStartsAtChange,
	onFormEndsAtChange,
	onFormSortOrderChange,
	onFormCtaLabelChange,
	onFormCtaUrlChange,
	onFormStatusChange,
	onFormCampaignIdChange,
	onSubmit,
	onFieldErrorStrip,
}: PromotionDiscountFormDrawerProps) {
	return (
		<Drawer open={open} onOpenChange={onOpenChange} modal shouldScaleBackground={false}>
			<DrawerPageContent className='flex flex-col gap-0 p-0' showCloseButton>
				<DrawerHeader className='shrink-0 border-b px-6 py-5 pr-16 text-left'>
					<DrawerTitle>{editing ? 'Sửa khuyến mãi' : 'Khuyến mãi mới'}</DrawerTitle>
					<DrawerDescription className='mt-1.5 max-w-2xl'>
						Quản lý mã giảm giá và chương trình khuyến mãi.
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
									Thông tin cơ bản
								</p>
								<div className='grid gap-4 lg:grid-cols-2'>
									<Field>
										<FieldLabel htmlFor='pd-title'>Tiêu đề</FieldLabel>
										<Input
											id='pd-title'
											value={formTitle}
											onChange={e => {
												onFormTitleChange(e.target.value);
												onFieldErrorStrip('pd-title');
											}}
											disabled={formBusy}
											aria-invalid={Boolean(fieldErrors['pd-title'])}
											className={cn(fieldErrors['pd-title'] && 'border-destructive')}
										/>
										{fieldErrors['pd-title'] ? (
											<p className='text-destructive mt-1 text-xs'>{fieldErrors['pd-title']}</p>
										) : null}
									</Field>
									<Field>
										<FieldLabel htmlFor='pd-code'>Mã giảm giá</FieldLabel>
										<Input
											id='pd-code'
											value={formCode}
											onChange={e => {
												onFormCodeChange(e.target.value.toUpperCase());
												onFieldErrorStrip('pd-code');
											}}
											disabled={formBusy}
											aria-invalid={Boolean(fieldErrors['pd-code'])}
											className={cn(fieldErrors['pd-code'] && 'border-destructive')}
											placeholder='VD: SUMMER2024'
										/>
										{fieldErrors['pd-code'] ? (
											<p className='text-destructive mt-1 text-xs'>{fieldErrors['pd-code']}</p>
										) : null}
									</Field>
								</div>
								<Field>
									<FieldLabel htmlFor='pd-desc'>Mô tả</FieldLabel>
									<Textarea
										id='pd-desc'
										value={formDescription}
										onChange={e => onFormDescriptionChange(e.target.value)}
										disabled={formBusy}
										rows={3}
										className='min-h-20 w-full'
									/>
								</Field>
								{onFormCampaignIdChange && campaignOptions ? (
									<Field>
										<FieldLabel htmlFor='pd-campaign'>Chiến dịch (tuỳ chọn)</FieldLabel>
										<Select
											value={formCampaignId || '__none__'}
											onValueChange={v => onFormCampaignIdChange(v === '__none__' ? '' : v)}
											disabled={formBusy}
										>
											<SelectTrigger id='pd-campaign'>
												<SelectValue placeholder='Không thuộc chiến dịch' />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectItem value='__none__'>Không thuộc chiến dịch</SelectItem>
													{campaignOptions.map(opt => (
														<SelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
									</Field>
								) : null}
								<Field>
									<FieldLabel htmlFor='pd-banner'>Banner Image URL (tuỳ chọn)</FieldLabel>
									<SingleImageUrlDropzone
										label='Kéo thả hoặc click để tải ảnh banner'
										hint='định dạng: JPG, PNG, GIF, WebP, SVG'
										url={formBannerImageUrl || ''}
										onUrlChange={url => {
											onFormBannerImageUrlChange(url);
											onFieldErrorStrip('pd-banner');
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
												onFieldErrorStrip('pd-banner');
											} catch (error) {
												console.error('Upload error:', error);
												alert(error instanceof Error ? error.message : 'Không thể tải ảnh lên');
											}
										}}
										hasError={Boolean(fieldErrors['pd-banner'])}
									/>
									{fieldErrors['pd-banner'] ? (
										<p className='text-destructive mt-1 text-xs'>{fieldErrors['pd-banner']}</p>
									) : null}
								</Field>
							</section>

							<section className='space-y-4'>
								<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
									Loại & giá trị giảm
								</p>
								<div className='grid gap-4 lg:grid-cols-2'>
									<Field>
										<FieldLabel htmlFor='pd-type'>Loại giảm giá</FieldLabel>
										<Select
											value={formType}
											onValueChange={v => onFormTypeChange(v as 'PERCENT' | 'FIXED_AMOUNT')}
											disabled={formBusy}
										>
											<SelectTrigger
												id='pd-type'
												className={cn(fieldErrors['pd-type'] && 'border-destructive')}
												aria-invalid={Boolean(fieldErrors['pd-type'])}
											>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectItem value='PERCENT'>Phần trăm (%)</SelectItem>
													<SelectItem value='FIXED_AMOUNT'>Số tiền cố định (VND)</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										{fieldErrors['pd-type'] ? (
											<p className='text-destructive mt-1 text-xs'>{fieldErrors['pd-type']}</p>
										) : null}
									</Field>
									<Field>
										<FieldLabel htmlFor='pd-value'>
											Giá trị {formType === 'PERCENT' ? '(%)' : '(VND)'}
										</FieldLabel>
										<Input
											id='pd-value'
											inputMode='numeric'
											pattern='[0-9]*'
											value={formValue}
											onChange={e => {
												onFormValueChange(digitsOnly(e.target.value));
												onFieldErrorStrip('pd-value');
											}}
											disabled={formBusy}
											aria-invalid={Boolean(fieldErrors['pd-value'])}
											className={cn(fieldErrors['pd-value'] && 'border-destructive')}
										/>
										{fieldErrors['pd-value'] ? (
											<p className='text-destructive mt-1 text-xs'>{fieldErrors['pd-value']}</p>
										) : null}
									</Field>
								</div>
								<div className='grid gap-4 lg:grid-cols-2'>
									<Field>
										<FieldLabel htmlFor='pd-min-order'>
											Đơn hàng tối thiểu (VND, tuỳ chọn)
										</FieldLabel>
										<Input
											id='pd-min-order'
											inputMode='numeric'
											pattern='[0-9]*'
											value={formMinOrderVnd}
											onChange={e => onFormMinOrderVndChange(digitsOnly(e.target.value))}
											disabled={formBusy}
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor='pd-max-discount'>Giảm tối đa (VND, tuỳ chọn)</FieldLabel>
										<Input
											id='pd-max-discount'
											inputMode='numeric'
											pattern='[0-9]*'
											value={formMaxDiscountVnd}
											onChange={e => onFormMaxDiscountVndChange(digitsOnly(e.target.value))}
											disabled={formBusy}
										/>
									</Field>
								</div>
							</section>

							<section className='space-y-4'>
								<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
									Thời gian & giới hạn
								</p>
								<div className='grid gap-4 lg:grid-cols-2'>
									<Field>
										<FieldLabel htmlFor='pd-starts'>Bắt đầu (tuỳ chọn)</FieldLabel>
										<Input
											id='pd-starts'
											type='date'
											value={formStartsAt}
											onChange={e => onFormStartsAtChange(e.target.value)}
											disabled={formBusy}
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor='pd-ends'>Kết thúc (tuỳ chọn)</FieldLabel>
										<Input
											id='pd-ends'
											type='date'
											value={formEndsAt}
											onChange={e => onFormEndsAtChange(e.target.value)}
											disabled={formBusy}
										/>
									</Field>
								</div>
								<div className='grid gap-4 lg:grid-cols-2'>
									<Field>
										<FieldLabel htmlFor='pd-usage-limit'>Giới hạn tổng (tuỳ chọn)</FieldLabel>
										<Input
											id='pd-usage-limit'
											inputMode='numeric'
											pattern='[0-9]*'
											value={formUsageLimit}
											onChange={e => onFormUsageLimitChange(digitsOnly(e.target.value))}
											disabled={formBusy}
											placeholder='Để trống = không giới hạn'
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor='pd-per-user'>Giới hạn mỗi user (mặc định: 1)</FieldLabel>
										<Input
											id='pd-per-user'
											inputMode='numeric'
											pattern='[0-9]*'
											value={formPerUserLimit}
											onChange={e => onFormPerUserLimitChange(digitsOnly(e.target.value))}
											disabled={formBusy}
											placeholder='1'
										/>
									</Field>
								</div>
							</section>

							<section className='space-y-4'>
								<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
									Áp dụng cho
								</p>
								<Field>
									<FieldLabel htmlFor='pd-applies-to'>Phạm vi áp dụng</FieldLabel>
									<Select
										value={formAppliesTo}
										onValueChange={v =>
											onFormAppliesToChange(v as 'ALL_PRODUCTS' | 'PRODUCTS' | 'CATEGORIES')
										}
										disabled={formBusy}
									>
										<SelectTrigger
											id='pd-applies-to'
											className={cn(fieldErrors['pd-applies-to'] && 'border-destructive')}
											aria-invalid={Boolean(fieldErrors['pd-applies-to'])}
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value='ALL_PRODUCTS'>Tất cả sản phẩm</SelectItem>
												<SelectItem value='PRODUCTS'>Sản phẩm cụ thể</SelectItem>
												<SelectItem value='CATEGORIES'>Danh mục cụ thể</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
									{fieldErrors['pd-applies-to'] ? (
										<p className='text-destructive mt-1 text-xs'>{fieldErrors['pd-applies-to']}</p>
									) : null}
								</Field>
								{formAppliesTo === 'PRODUCTS' ? (
									<Field>
										<FieldLabel htmlFor='pd-product-ids'>Chọn sản phẩm</FieldLabel>
										<MultiSelectCombobox
											options={productOptions}
											selectedValues={formProductIds}
											onSelectedChange={onFormProductIdsChange}
											placeholder='Chọn sản phẩm...'
											searchPlaceholder='Tìm sản phẩm...'
											emptyText='Không tìm thấy sản phẩm.'
											disabled={formBusy}
										/>
									</Field>
								) : null}
								{formAppliesTo === 'CATEGORIES' ? (
									<Field>
										<FieldLabel htmlFor='pd-category-ids'>Chọn danh mục</FieldLabel>
										<MultiSelectCombobox
											options={categoryOptions}
											selectedValues={formCategoryIds}
											onSelectedChange={onFormCategoryIdsChange}
											placeholder='Chọn danh mục...'
											searchPlaceholder='Tìm danh mục...'
											emptyText='Không tìm thấy danh mục.'
											disabled={formBusy}
										/>
									</Field>
								) : null}
							</section>

							<section className='space-y-4'>
								<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
									Hiển thị
								</p>
								<div className='grid gap-4 lg:grid-cols-2'>
									<Field>
										<FieldLabel htmlFor='pd-sort'>Thứ tự hiển thị</FieldLabel>
										<Input
											id='pd-sort'
											inputMode='numeric'
											pattern='[0-9]*'
											value={formSortOrder}
											onChange={e => onFormSortOrderChange(digitsOnly(e.target.value))}
											disabled={formBusy}
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor='pd-status'>Trạng thái</FieldLabel>
										<Select
											value={formStatus}
											onValueChange={v =>
												onFormStatusChange(v as AdminPromotionDiscountRow['status'])
											}
											disabled={formBusy}
										>
											<SelectTrigger id='pd-status'>
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
								<div className='grid gap-4 lg:grid-cols-2'>
									<Field>
										<FieldLabel htmlFor='pd-cta-label'>CTA Label (tuỳ chọn)</FieldLabel>
										<Input
											id='pd-cta-label'
											value={formCtaLabel}
											onChange={e => onFormCtaLabelChange(e.target.value)}
											disabled={formBusy}
											placeholder='VD: Mua ngay'
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor='pd-cta-url'>CTA URL (tuỳ chọn)</FieldLabel>
										<Input
											id='pd-cta-url'
											value={formCtaUrl}
											onChange={e => onFormCtaUrlChange(e.target.value)}
											disabled={formBusy}
											placeholder='VD: /products'
										/>
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
