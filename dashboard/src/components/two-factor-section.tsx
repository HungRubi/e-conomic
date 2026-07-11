import * as React from 'react';
import { toast } from 'sonner';
import { RefreshCwIcon, ShieldCheckIcon, ShieldOffIcon } from 'lucide-react';

import {
	confirmTotpEnrollment,
	disableTotp,
	regenerateBackupCodes,
	startTotpEnrollment,
	type TotpEnrollResponse,
} from '@/api/account';
import { AuthApiError } from '@/auth/auth-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type Props = {
	totpEnabled: boolean;
	backupCodesRemaining?: number;
	onChanged: () => void;
};

/**
 * Bật/tắt 2FA TOTP. Đọc trạng thái hiện tại từ prop (lấy từ /auth/me).
 * Bật: gọi enroll/start → quét QR → enroll/verify với mã 6 chữ số.
 * Tắt: yêu cầu mật khẩu hiện tại + mã 6 chữ số.
 */
export function TwoFactorSection({ totpEnabled, backupCodesRemaining, onChanged }: Props) {
	const [enrollOpen, setEnrollOpen] = React.useState(false);
	const [enrollData, setEnrollData] = React.useState<TotpEnrollResponse | null>(null);
	const [enrollCode, setEnrollCode] = React.useState('');
	const [enrollPending, setEnrollPending] = React.useState(false);
	const [enrollError, setEnrollError] = React.useState<string | null>(null);
	const [backupCodes, setBackupCodes] = React.useState<string[] | null>(null);

	const [regenOpen, setRegenOpen] = React.useState(false);
	const [regenPw, setRegenPw] = React.useState('');
	const [regenCode, setRegenCode] = React.useState('');
	const [regenPending, setRegenPending] = React.useState(false);
	const [regenError, setRegenError] = React.useState<string | null>(null);

	const [disableOpen, setDisableOpen] = React.useState(false);
	const [disableCurrentPw, setDisableCurrentPw] = React.useState('');
	const [disableCode, setDisableCode] = React.useState('');
	const [disablePending, setDisablePending] = React.useState(false);
	const [disableError, setDisableError] = React.useState<string | null>(null);

	async function submitRegen() {
		setRegenError(null);
		if (!regenPw) {
			setRegenError('Nhập mật khẩu hiện tại');
			return;
		}
		if (!/^\d{6}$/.test(regenCode)) {
			setRegenError('Mã phải gồm 6 chữ số');
			return;
		}
		setRegenPending(true);
		try {
			const result = await regenerateBackupCodes(regenPw, regenCode);
			setBackupCodes(result.backupCodes);
			setRegenOpen(false);
			setEnrollOpen(true);
			setRegenPw('');
			setRegenCode('');
			toast.success('đã sinh lại 10 backup codes — codes cũ không còn hợp lệ');
			onChanged();
		} catch (e) {
			setRegenError(e instanceof AuthApiError ? e.message : 'Sinh lại codes thất bại');
		} finally {
			setRegenPending(false);
		}
	}

	async function submitEnroll() {
		setEnrollError(null);
		if (!/^\d{6}$/.test(enrollCode)) {
			setEnrollError('Mã phải gồm 6 chữ số');
			return;
		}
		setEnrollPending(true);
		try {
			const result = await confirmTotpEnrollment(enrollCode);
			setBackupCodes(result.backupCodes);
			toast.success('đã bật xác thực 2 bước');
			onChanged();
		} catch (e) {
			setEnrollError(e instanceof AuthApiError ? e.message : 'Mã 2FA không đúng');
		} finally {
			setEnrollPending(false);
		}
	}

	function closeEnrollDialog() {
		setEnrollOpen(false);
		setEnrollData(null);
		setEnrollCode('');
		setBackupCodes(null);
	}

	function downloadBackupCodes(codes: string[]) {
		const content = [
			'# Miue Healing Dashboard — 2FA Backup Codes',
			'# Mỗi mã chỉ dùng được 1 lần khi mất quyền truy cập app authenticator.',
			'',
			...codes,
			'',
			`# Sinh lúc: ${new Date().toISOString()}`,
		].join('\n');
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `miue-2fa-backup-codes-${Date.now()}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function openEnroll() {
		setEnrollError(null);
		setEnrollCode('');
		setEnrollPending(true);
		try {
			const data = await startTotpEnrollment();
			setEnrollData(data);
			setEnrollOpen(true);
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không khởi tạo được 2FA');
		} finally {
			setEnrollPending(false);
		}
	}

	async function submitDisable() {
		setDisableError(null);
		if (!disableCurrentPw) {
			setDisableError('Nhập mật khẩu hiện tại');
			return;
		}
		if (!/^\d{6}$/.test(disableCode)) {
			setDisableError('Mã phải gồm 6 chữ số');
			return;
		}
		setDisablePending(true);
		try {
			await disableTotp(disableCurrentPw, disableCode);
			toast.success('đã tắt xác thực 2 bước');
			setDisableOpen(false);
			setDisableCurrentPw('');
			setDisableCode('');
			onChanged();
		} catch (e) {
			setDisableError(e instanceof AuthApiError ? e.message : 'Tắt 2FA thất bại');
		} finally {
			setDisablePending(false);
		}
	}

	return (
		<Card className='gap-4 p-5'>
			<div className='flex items-start gap-3'>
				<ShieldCheckIcon className='mt-0.5 size-5 text-muted-foreground' aria-hidden />
				<div className='flex-1'>
					<div className='flex items-center gap-2'>
						<p className='text-sm font-semibold'>Xác thực 2 bước (TOTP)</p>
						{totpEnabled ? (
							<Badge variant='success'>đã bật</Badge>
						) : (
							<Badge variant='muted'>Chưa bật</Badge>
						)}
						{totpEnabled && typeof backupCodesRemaining === 'number' ? (
							<Badge variant={backupCodesRemaining <= 3 ? 'warning' : 'info'}>
								Còn {backupCodesRemaining} backup codes
							</Badge>
						) : null}
					</div>
					<p className='text-xs text-muted-foreground'>
						Yêu cầu mã 6 chữ số từ ứng dụng (Google Authenticator, 1Password…) mỗi lần đăng nhập.
						{totpEnabled && typeof backupCodesRemaining === 'number' && backupCodesRemaining <= 3
							? ' Backup codes sắp hết — sinh lại để đảm bảo không bị lock-out.'
							: ''}
					</p>
				</div>
				{totpEnabled ? (
					<div className='flex flex-col gap-2 sm:flex-row'>
						<Button type='button' variant='outline' size='sm' onClick={() => setRegenOpen(true)}>
							<RefreshCwIcon className='mr-1.5 size-3.5' aria-hidden /> Sinh lại codes
						</Button>
						<Button type='button' variant='outline' size='sm' onClick={() => setDisableOpen(true)}>
							<ShieldOffIcon className='mr-1.5 size-4' aria-hidden /> Tắt
						</Button>
					</div>
				) : (
					<Button type='button' onClick={() => void openEnroll()} disabled={enrollPending}>
						{enrollPending ? 'Đang tạo…' : 'Bật 2FA'}
					</Button>
				)}
			</div>

			<Dialog open={enrollOpen} onOpenChange={open => !open && closeEnrollDialog()}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>{backupCodes ? 'Lưu lại 10 backup codes' : 'Bật xác thực 2 bước'}</DialogTitle>
						<DialogDescription>
							{backupCodes
								? 'Mỗi mã chỉ dùng 1 lần khi bạn mất quyền truy cập app authenticator. Lưu ngay — chúng tôi sẽ không hiển thị lại.'
								: 'Quét mã QR bằng ứng dụng xác thực rồi nhập mã 6 chữ số để hoàn tất.'}
						</DialogDescription>
					</DialogHeader>
					{backupCodes ? (
						<div className='space-y-3'>
							<div className='grid grid-cols-2 gap-2 rounded-md border bg-muted/30 p-3 font-mono text-sm'>
								{backupCodes.map(code => (
									<code key={code} className='select-all rounded bg-background px-2 py-1 text-center'>
										{code}
									</code>
								))}
							</div>
							<Button
								type='button'
								variant='outline'
								className='w-full'
								onClick={() => downloadBackupCodes(backupCodes)}
							>
								Tải file .txt
							</Button>
						</div>
					) : enrollData ? (
						<div className='space-y-4'>
							<div className='flex justify-center rounded-lg border bg-white p-3'>
								<img
									src={enrollData.qrDataUrl}
									alt='QR enrollment'
									className='size-48 object-contain'
								/>
							</div>
							<details className='text-xs text-muted-foreground'>
								<summary className='cursor-pointer'>Không quét được? Nhập secret thủ công</summary>
								<code className='mt-2 block break-all rounded-md bg-muted/50 p-2'>
									{enrollData.secret}
								</code>
							</details>
							<Field>
								<FieldLabel htmlFor='totp-enroll-code'>Mã 6 chữ số</FieldLabel>
								<Input
									id='totp-enroll-code'
									inputMode='numeric'
									maxLength={6}
									autoComplete='one-time-code'
									value={enrollCode}
									onChange={e => setEnrollCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
									disabled={enrollPending}
								/>
							</Field>
							{enrollError ? <p className='text-sm text-destructive'>{enrollError}</p> : null}
						</div>
					) : null}
					<DialogFooter>
						{backupCodes ? (
							<Button type='button' onClick={closeEnrollDialog}>
								đã lưu, đóng
							</Button>
						) : (
							<>
								<Button
									type='button'
									variant='outline'
									onClick={closeEnrollDialog}
									disabled={enrollPending}
								>
									Hủy
								</Button>
								<Button
									type='button'
									onClick={() => void submitEnroll()}
									disabled={enrollPending || enrollCode.length !== 6}
								>
									{enrollPending ? 'Đang xác nhận…' : 'Xác nhận'}
								</Button>
							</>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={regenOpen} onOpenChange={open => !open && setRegenOpen(false)}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>Sinh lại 10 backup codes</DialogTitle>
						<DialogDescription>
							Codes cũ sẽ bị huỷ ngay sau khi sinh codes mới. Yêu cầu mật khẩu hiện tại + mã 2FA để tránh
							nhầm.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup className='gap-4'>
						<Field>
							<FieldLabel htmlFor='totp-regen-pw'>Mật khẩu hiện tại</FieldLabel>
							<Input
								id='totp-regen-pw'
								type='password'
								autoComplete='current-password'
								value={regenPw}
								onChange={e => setRegenPw(e.target.value)}
								disabled={regenPending}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor='totp-regen-code'>Mã 2FA hiện tại</FieldLabel>
							<Input
								id='totp-regen-code'
								inputMode='numeric'
								maxLength={6}
								autoComplete='one-time-code'
								value={regenCode}
								onChange={e => setRegenCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
								disabled={regenPending}
							/>
						</Field>
						{regenError ? <p className='text-sm text-destructive'>{regenError}</p> : null}
					</FieldGroup>
					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => setRegenOpen(false)}
							disabled={regenPending}
						>
							Hủy
						</Button>
						<Button type='button' onClick={() => void submitRegen()} disabled={regenPending}>
							{regenPending ? 'Đang sinh…' : 'Sinh lại'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={disableOpen} onOpenChange={setDisableOpen}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>Tắt xác thực 2 bước</DialogTitle>
						<DialogDescription>
							Cần xác thực bằng mật khẩu hiện tại + mã 2FA để chống bị tắt nhầm.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup className='gap-4'>
						<Field>
							<FieldLabel htmlFor='totp-disable-pw'>Mật khẩu hiện tại</FieldLabel>
							<Input
								id='totp-disable-pw'
								type='password'
								autoComplete='current-password'
								value={disableCurrentPw}
								onChange={e => setDisableCurrentPw(e.target.value)}
								disabled={disablePending}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor='totp-disable-code'>Mã 2FA hiện tại</FieldLabel>
							<Input
								id='totp-disable-code'
								inputMode='numeric'
								maxLength={6}
								autoComplete='one-time-code'
								value={disableCode}
								onChange={e => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
								disabled={disablePending}
							/>
						</Field>
						{disableError ? <p className='text-sm text-destructive'>{disableError}</p> : null}
					</FieldGroup>
					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => setDisableOpen(false)}
							disabled={disablePending}
						>
							Hủy
						</Button>
						<Button
							type='button'
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
							onClick={() => void submitDisable()}
							disabled={disablePending}
						>
							{disablePending ? 'Đang tắt…' : 'Tắt 2FA'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
