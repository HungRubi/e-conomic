import * as React from 'react';

import { uploadProductImage } from '@/api/admin-products';
import {
	fetchAdminGlobalConfig,
	patchAdminGlobalConfig,
	type GlobalConfigRow,
	type GlobalConfigPatch,
} from '@/api/admin-global-config';
import { AuthApiError } from '@/auth/auth-api';
import { SingleImageUrlDropzone } from '@/components/common/single-image-url-dropzone';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

function normalizePickerHex(hex: string | null | undefined, fallback: string): string {
	if (!hex || typeof hex !== 'string') return fallback;
	const t = hex.trim();
	const m3 = /^#([0-9A-Fa-f]{3})$/.exec(t);
	if (m3) {
		const [r, g, b] = m3[1].split('');
		return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
	}
	const m6 = /^#([0-9A-Fa-f]{6})$/.exec(t);
	return m6 ? `#${m6[1].toLowerCase()}` : fallback;
}

function isFullHex(v: string): boolean {
	return /^#[0-9A-Fa-f]{6}$/i.test(v.trim()) || /^#[0-9A-Fa-f]{3}$/i.test(v.trim());
}

type UploadSlot = 'logo' | 'favicon' | 'og' | 'footerBg';

export function GlobalConfigAdminPanel() {
	const [loading, setLoading] = React.useState(true);
	const [loadError, setLoadError] = React.useState<string | null>(null);
	const [saving, setSaving] = React.useState(false);
	const [uploadSlot, setUploadSlot] = React.useState<UploadSlot | null>(null);

	const [siteName, setSiteName] = React.useState('');
	const [logoUrl, setLogoUrl] = React.useState('');
	const [faviconUrl, setFaviconUrl] = React.useState('');
	const [facebookUrl, setFacebookUrl] = React.useState('');
	const [instagramUrl, setInstagramUrl] = React.useState('');
	const [shopeeUrl, setShopeeUrl] = React.useState('');
	const [primaryColorHex, setPrimaryColorHex] = React.useState('');
	const [secondaryColorHex, setSecondaryColorHex] = React.useState('');
	const [metaTitle, setMetaTitle] = React.useState('');
	const [metaDescription, setMetaDescription] = React.useState('');
	const [metaKeywords, setMetaKeywords] = React.useState('');
	const [ogImageUrl, setOgImageUrl] = React.useState('');
	const [youtubeUrl, setYoutubeUrl] = React.useState('');
	const [headerBarColorHex, setHeaderBarColorHex] = React.useState('');
	const [contactPhone, setContactPhone] = React.useState('');
	const [contactAddress, setContactAddress] = React.useState('');
	const [contactOpeningHours, setContactOpeningHours] = React.useState('');
	const [footerBackgroundImageUrl, setFooterBackgroundImageUrl] = React.useState('');
	const [shippingFeeEnabled, setShippingFeeEnabled] = React.useState(false);
	const [shippingFeeVnd, setShippingFeeVnd] = React.useState('');

	const uploadBusy = uploadSlot !== null;
	const formDisabled = saving || uploadBusy;

	function applyRow(row: GlobalConfigRow) {
		setSiteName(row.siteName);
		setLogoUrl(row.logoUrl ?? '');
		setFaviconUrl(row.faviconUrl ?? '');
		setFacebookUrl(row.facebookUrl ?? '');
		setInstagramUrl(row.instagramUrl ?? '');
		setShopeeUrl(row.shopeeUrl ?? '');
		setPrimaryColorHex(row.primaryColorHex ?? '');
		setSecondaryColorHex(row.secondaryColorHex ?? '');
		setMetaTitle(row.metaTitle ?? '');
		setMetaDescription(row.metaDescription ?? '');
		setMetaKeywords(row.metaKeywords ?? '');
		setOgImageUrl(row.ogImageUrl ?? '');
		setYoutubeUrl(row.youtubeUrl ?? '');
		setHeaderBarColorHex(row.headerBarColorHex ?? '');
		setContactPhone(row.contactPhone ?? '');
		setContactAddress(row.contactAddress ?? '');
		setContactOpeningHours(row.contactOpeningHours ?? '');
		setFooterBackgroundImageUrl(row.footerBackgroundImageUrl ?? '');
		setShippingFeeEnabled(row.shippingFeeEnabled);
		setShippingFeeVnd(row.shippingFeeVnd != null ? String(row.shippingFeeVnd) : '');
	}

	React.useEffect(() => {
		let cancelled = false;
		void fetchAdminGlobalConfig()
			.then(row => {
				if (cancelled) return;
				React.startTransition(() => {
					applyRow(row);
					setLoadError(null);
					setLoading(false);
				});
			})
			.catch(e => {
				if (cancelled) return;
				React.startTransition(() => {
					setLoadError(e instanceof AuthApiError ? e.message : 'Không tải được cấu hình');
					setLoading(false);
				});
			});
		return () => {
			cancelled = true;
		};
	}, []);

	async function onUpload(slot: UploadSlot, file: File) {
		setUploadSlot(slot);
		try {
			const { url } = await uploadProductImage(file);
			if (slot === 'logo') setLogoUrl(url);
			if (slot === 'favicon') setFaviconUrl(url);
			if (slot === 'og') setOgImageUrl(url);
			if (slot === 'footerBg') setFooterBackgroundImageUrl(url);
			toast.success('đã tải ảnh lên');
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Tải ảnh thất bại');
		} finally {
			setUploadSlot(null);
		}
	}

	function buildPatch(): GlobalConfigPatch {
		const nullIfEmpty = (s: string) => (s.trim() === '' ? null : s.trim());
		return {
			siteName: siteName.trim(),
			logoUrl: nullIfEmpty(logoUrl),
			faviconUrl: nullIfEmpty(faviconUrl),
			facebookUrl: nullIfEmpty(facebookUrl),
			instagramUrl: nullIfEmpty(instagramUrl),
			shopeeUrl: nullIfEmpty(shopeeUrl),
			primaryColorHex: nullIfEmpty(primaryColorHex),
			secondaryColorHex: nullIfEmpty(secondaryColorHex),
			metaTitle: nullIfEmpty(metaTitle),
			metaDescription: nullIfEmpty(metaDescription),
			metaKeywords: nullIfEmpty(metaKeywords),
			ogImageUrl: nullIfEmpty(ogImageUrl),
			youtubeUrl: nullIfEmpty(youtubeUrl),
			headerBarColorHex: nullIfEmpty(headerBarColorHex),
			contactPhone: nullIfEmpty(contactPhone),
			contactAddress: nullIfEmpty(contactAddress),
			contactOpeningHours: nullIfEmpty(contactOpeningHours),
			footerBackgroundImageUrl: nullIfEmpty(footerBackgroundImageUrl),
			shippingFeeEnabled,
			shippingFeeVnd: shippingFeeEnabled && shippingFeeVnd.trim() ? Number(shippingFeeVnd.trim()) : null,
		};
	}

	async function save() {
		if (!siteName.trim()) {
			toast.error('Nhập tên website');
			return;
		}
		if (primaryColorHex.trim() && !isFullHex(primaryColorHex)) {
			toast.error('Màu chính: dùng #RGB hoặc #RRGGBB');
			return;
		}
		if (secondaryColorHex.trim() && !isFullHex(secondaryColorHex)) {
			toast.error('Màu phụ: dùng #RGB hoặc #RRGGBB');
			return;
		}
		if (headerBarColorHex.trim() && !isFullHex(headerBarColorHex)) {
			toast.error('Màu thanh header: dùng #RGB hoặc #RRGGBB');
			return;
		}
		if (shippingFeeEnabled && shippingFeeVnd.trim()) {
			const fee = Number(shippingFeeVnd.trim());
			if (!Number.isFinite(fee) || fee < 0 || !Number.isInteger(fee)) {
				toast.error('Phí vận chuyển phải là số nguyên dương');
				return;
			}
			if (fee > 10000000) {
				toast.error('Phí vận chuyển tối đa 10 triệu');
				return;
			}
		}
		setSaving(true);
		try {
			const row = await patchAdminGlobalConfig(buildPatch());
			applyRow(row);
			toast.success('đã lưu cấu hình');
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Lưu thất bại');
		} finally {
			setSaving(false);
		}
	}

	const primaryPicker = normalizePickerHex(primaryColorHex, '#1f3424');
	const secondaryPicker = normalizePickerHex(secondaryColorHex, '#fbf4e6');
	const headerBarPicker = normalizePickerHex(headerBarColorHex, '#f5f0e6');

	if (loading) {
		return <p className='text-muted-foreground text-sm'>Đang tải cấu hình...</p>;
	}
	if (loadError) {
		return (
			<div className='rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
				{loadError}
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-6'>
			<div>
				<h2 className='text-lg font-semibold tracking-tight'>Cấu hình website</h2>
				<p className='text-muted-foreground mt-1 text-sm'>
					Một bản ghi duy nhất cho toàn site (tên, logo, SEO, mạng xã hội, ảnh chia sẻ). Không thêm hay xóa bản ghi.
				</p>
			</div>

			<FieldGroup className='flex flex-col gap-8'>
				<section className='space-y-4'>
					<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>Nhận diện</p>
					<Field>
						<FieldLabel htmlFor='gc-site-name'>Tên website</FieldLabel>
						<Input
							id='gc-site-name'
							className='mt-1.5 max-w-xl'
							value={siteName}
							onChange={e => setSiteName(e.target.value)}
							disabled={formDisabled}
						/>
					</Field>
					<div className='grid gap-4 lg:grid-cols-2'>
						<Field>
							<FieldLabel>Logo</FieldLabel>
							<div className='mt-1.5'>
								<SingleImageUrlDropzone
									label={logoUrl.trim() ? 'Kéo thả hoặc bấm để thay logo' : 'Kéo thả hoặc bấm để chọn logo'}
									hint='Đường dẫn lưu sau khi tải lên (dùng trên header web)'
									url={logoUrl}
									disabled={formDisabled}
									uploadBusy={uploadSlot === 'logo'}
									onUploadFile={async file => await onUpload('logo', file)}
								/>
							</div>
						</Field>
						<Field>
							<FieldLabel>Favicon</FieldLabel>
							<div className='mt-1.5'>
								<SingleImageUrlDropzone
									label={faviconUrl.trim() ? 'Kéo thả hoặc bấm để thay favicon' : 'Kéo thả hoặc bấm để chọn favicon'}
									hint='PNG / ICO — hiển thị tab trình duyệt'
									url={faviconUrl}
									disabled={formDisabled}
									uploadBusy={uploadSlot === 'favicon'}
									onUploadFile={async file => await onUpload('favicon', file)}
								/>
							</div>
						</Field>
					</div>

				</section>

				<section className='space-y-4 max-w-[calc(50%-4px)]'>
					<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>Liên hệ (footer)</p>
					<p className='text-muted-foreground text-xs'>
						Số điện thoại, địa chỉ và giờ mở cửa. Nhãn «Đường dây nóng» / «Đang mở cửa» vẫn theo ngôn ngữ trên website.
					</p>
					<Field>
						<FieldLabel htmlFor='gc-phone'>Số hotline</FieldLabel>
						<Input
							id='gc-phone'
							className='mt-1.5'
							value={contactPhone}
							onChange={e => setContactPhone(e.target.value)}
							disabled={formDisabled}
							placeholder='0919 946 962'
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor='gc-address'>Địa chỉ</FieldLabel>
						<Textarea
							id='gc-address'
							className='mt-1.5 min-h-20'
							value={contactAddress}
							onChange={e => setContactAddress(e.target.value)}
							disabled={formDisabled}
							rows={3}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor='gc-hours'>Giờ mở cửa (dòng hiển thị)</FieldLabel>
						<Input
							id='gc-hours'
							className='mt-1.5'
							value={contactOpeningHours}
							onChange={e => setContactOpeningHours(e.target.value)}
							disabled={formDisabled}
							placeholder='08:00 - 22:00'
						/>
					</Field>
				</section>

				<section className='space-y-4'>
					<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>Màu sắc thương hiệu (Brand)</p>
					<p className='text-muted-foreground text-xs'>Màu chính và màu phụ cho logo, text, nền tổng thể website.</p>
					<div className='grid gap-4 lg:grid-cols-3'>
						<Field>
							<FieldLabel htmlFor='gc-color-primary'>Màu chính (Primary)</FieldLabel>
							<div className='mt-1.5 flex flex-wrap items-center gap-2'>
								<input
									id='gc-color-primary'
									type='color'
									className='border-border size-10 cursor-pointer rounded border bg-background p-0.5'
									value={primaryPicker}
									disabled={formDisabled}
									onChange={e => setPrimaryColorHex(e.target.value.toLowerCase())}
									aria-label='Chọn màu chính'
								/>
								<Input
									className='max-w-40 font-mono text-xs'
									value={primaryColorHex}
									onChange={e => setPrimaryColorHex(e.target.value)}
									placeholder='#1f3424'
									disabled={formDisabled}
									spellCheck={false}
								/>
							</div>
						</Field>
						<Field>
							<FieldLabel htmlFor='gc-color-secondary'>Màu phụ (Secondary)</FieldLabel>
							<div className='mt-1.5 flex flex-wrap items-center gap-2'>
								<input
									id='gc-color-secondary'
									type='color'
									className='border-border size-10 cursor-pointer rounded border bg-background p-0.5'
									value={secondaryPicker}
									disabled={formDisabled}
									onChange={e => setSecondaryColorHex(e.target.value.toLowerCase())}
									aria-label='Chọn màu phụ'
								/>
								<Input
									className='max-w-40 font-mono text-xs'
									value={secondaryColorHex}
									onChange={e => setSecondaryColorHex(e.target.value)}
									placeholder='#fbf4e6'
									disabled={formDisabled}
									spellCheck={false}
								/>
							</div>
						</Field>
						<Field>
							<FieldLabel htmlFor='gc-color-header-bar'>Màu thanh header</FieldLabel>
							<div className='mt-1.5 flex flex-wrap items-center gap-2'>
								<input
									id='gc-color-header-bar'
									type='color'
									className='border-border size-10 cursor-pointer rounded border bg-background p-0.5'
									value={headerBarPicker}
									disabled={formDisabled}
									onChange={e => setHeaderBarColorHex(e.target.value.toLowerCase())}
									aria-label='Chọn màu thanh header'
								/>
								<Input
									className='max-w-40 font-mono text-xs'
									value={headerBarColorHex}
									onChange={e => setHeaderBarColorHex(e.target.value)}
									placeholder='#4A9082'
									disabled={formDisabled}
									spellCheck={false}
								/>
							</div>
						</Field>
					</div>
				</section>

				<section className='space-y-4'>
					<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>Mạng xã hội & cửa hàng</p>
					<div className='grid gap-4 lg:grid-cols-2'>
						<Field>
							<FieldLabel htmlFor='gc-fb'>Facebook</FieldLabel>
							<Input
								id='gc-fb'
								className='mt-1.5'
								type='url'
								inputMode='url'
								value={facebookUrl}
								onChange={e => setFacebookUrl(e.target.value)}
								disabled={formDisabled}
								placeholder='https://...'
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor='gc-ig'>Instagram</FieldLabel>
							<Input
								id='gc-ig'
								className='mt-1.5'
								type='url'
								inputMode='url'
								value={instagramUrl}
								onChange={e => setInstagramUrl(e.target.value)}
								disabled={formDisabled}
								placeholder='https://...'
							/>
						</Field>
					</div>
					<div className='grid gap-4 lg:grid-cols-2'>
						<Field>
							<FieldLabel htmlFor='gc-youtube'>YouTube (trang chủ — embed video)</FieldLabel>
							<Input
								id='gc-youtube'
								className='mt-1.5'
								type='url'
								inputMode='url'
								value={youtubeUrl}
								onChange={e => setYoutubeUrl(e.target.value)}
								disabled={formDisabled}
								placeholder='https://www.youtube.com/watch?v=... hoặc youtu.be/...'
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor='gc-shopee'>Shopee</FieldLabel>
							<Input
								id='gc-shopee'
								className='mt-1.5'
								type='url'
								inputMode='url'
								value={shopeeUrl}
								onChange={e => setShopeeUrl(e.target.value)}
								disabled={formDisabled}
								placeholder='https://shopee.vn/...'
							/>
						</Field>
					</div>
				</section>

				<section className='space-y-4'>
					<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>SEO & metadata</p>
					<div className='grid gap-4 lg:grid-cols-2'>
						<Field>
							<FieldLabel htmlFor='gc-meta-title'>Tiêu đề (title)</FieldLabel>
							<Input
								id='gc-meta-title'
								className='mt-1.5'
								value={metaTitle}
								onChange={e => setMetaTitle(e.target.value)}
								disabled={formDisabled}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor='gc-meta-kw'>Từ khóa (keywords)</FieldLabel>
							<Input
								id='gc-meta-kw'
								className='mt-1.5'
								value={metaKeywords}
								onChange={e => setMetaKeywords(e.target.value)}
								disabled={formDisabled}
								placeholder='phân tách bằng dấu phẩy'
							/>
						</Field>
					</div>
					<Field>
						<FieldLabel htmlFor='gc-meta-desc'>Mô tả (meta description)</FieldLabel>
						<Textarea
							id='gc-meta-desc'
							className='mt-1.5 min-h-28'
							value={metaDescription}
							onChange={e => setMetaDescription(e.target.value)}
							disabled={formDisabled}
							rows={5}
						/>
					</Field>
				</section>

				<section className='space-y-4'>
					<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>Chia sẻ mạng xã hội (Open Graph)</p>
					<p className='text-muted-foreground text-xs'>
						Ảnh mặc định khi dán link lên Zalo, Facebook, v.v. (og:image). Nên tỷ lệ ngang, tối thiểu khoảng 1200×630.
					</p>
					<Field>
						<FieldLabel>Ảnh OG</FieldLabel>
						<div className='mt-1.5'>
							<SingleImageUrlDropzone
								label={ogImageUrl.trim() ? 'Kéo thả hoặc bấm để thay ảnh OG' : 'Kéo thả hoặc bấm để chọn ảnh OG'}
								hint='JPEG / PNG — hiển thị khi share link'
								url={ogImageUrl}
								disabled={formDisabled}
								uploadBusy={uploadSlot === 'og'}
								onUploadFile={async file => await onUpload('og', file)}
							/>
						</div>
					</Field>
				</section>

				<section className='space-y-4'>
					<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>NỀN FOOTER</p>
					<p className='text-muted-foreground text-xs'>
						Ảnh nền footer toàn site. Nếu không có ảnh hoặc ảnh lỗi sẽ hiển thị nền trắng. Nên dùng ảnh tối màu vì có overlay đen phủ lên.
						<br />
						Kích thước khuyến nghị: <strong>1920×800px</strong> (tỉ lệ ~12:5). Ảnh quá nhỏ sẽ bị kéo giãn, quá dọc sẽ bị crop nhiều.
					</p>
					<Field>
						<FieldLabel>Ảnh nền footer</FieldLabel>
						<div className='mt-1.5'>
							<SingleImageUrlDropzone
								label={footerBackgroundImageUrl.trim() ? 'Kéo thả hoặc bấm để thay ảnh nền footer' : 'Kéo thả hoặc bấm để chọn ảnh nền footer'}
								hint='PNG / JPEG — hiển thị làm background cho footer'
								url={footerBackgroundImageUrl}
								disabled={formDisabled}
								uploadBusy={uploadSlot === 'footerBg'}
								onUploadFile={async file => await onUpload('footerBg', file)}
							/>
						</div>
					</Field>
				</section>

				<section className='space-y-4'>
					<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>VẬN CHUYỂN</p>
					<p className='text-muted-foreground text-xs'>
						Bật phí vận chuyển và nhập số tiền cố định cho mỗi đơn hàng.
					</p>
					<Field>
						<div className='mt-1.5 flex items-center gap-3'>
							<Switch
								id='gc-shipping-enabled'
								checked={shippingFeeEnabled}
								onCheckedChange={setShippingFeeEnabled}
								disabled={formDisabled}
							/>
							<label htmlFor='gc-shipping-enabled' className='text-sm cursor-pointer'>
								{shippingFeeEnabled ? 'Đang tính phí vận chuyển' : 'Miễn phí vận chuyển'}
							</label>
						</div>
					</Field>
					{shippingFeeEnabled && (
						<Field>
							<FieldLabel htmlFor='gc-shipping-fee'>Phí vận chuyển (VNĐ)</FieldLabel>
							<Input
								id='gc-shipping-fee'
								className='mt-1.5 max-w-xs'
								type='number'
								inputMode='numeric'
								min={0}
								max={10000000}
								step={1000}
								value={shippingFeeVnd}
								onChange={e => setShippingFeeVnd(e.target.value)}
								disabled={formDisabled}
								placeholder='30000'
							/>
							<p className='text-muted-foreground mt-1 text-xs'>
								Số tiền này sẽ được cộng vào tổng đơn hàng khi khách đặt mua.
							</p>
						</Field>
					)}
				</section>
			</FieldGroup>

			<div className='flex flex-wrap gap-2 border-t border-border pt-4'>
				<Button type='button' onClick={() => void save()} disabled={formDisabled}>
					{saving ? 'Đang lưu...' : 'Lưu cấu hình'}
				</Button>
			</div>
		</div>
	);
}
