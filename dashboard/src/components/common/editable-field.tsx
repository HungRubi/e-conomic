import * as React from 'react';
import { Loader2Icon, PencilIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type SelectOption = { value: string; label: string };

type CommonProps<T> = {
	label?: string;
	value: T;
	onSave: (next: T) => Promise<void> | void;
	disabled?: boolean;
	placeholder?: string;
	displayClassName?: string;
	containerClassName?: string;
	/** Hiển thị khi value rỗng (read-mode). */
	emptyHint?: string;
	/** Hiển thị "đã sửa" toast tự động sau khi save thành công. Mặc định: true. */
	successToast?: boolean | string;
	/** Validate trước khi save. Trả về null nếu hợp lệ, string là message lỗi. */
	validate?: (next: T) => string | null;
};

type TextEditableProps = CommonProps<string> & {
	type: 'text';
	maxLength?: number;
};

type TextareaEditableProps = CommonProps<string> & {
	type: 'textarea';
	rows?: number;
	maxLength?: number;
};

type NumberEditableProps = CommonProps<number | null> & {
	type: 'number';
	min?: number;
	max?: number;
	step?: number;
	suffix?: string;
};

type SelectEditableProps = CommonProps<string> & {
	type: 'select';
	options: SelectOption[];
};

export type EditableFieldProps = TextEditableProps | TextareaEditableProps | NumberEditableProps | SelectEditableProps;

export function EditableField(props: EditableFieldProps) {
	const [editing, setEditing] = React.useState(false);
	const [busy, setBusy] = React.useState(false);
	const [draft, setDraft] = React.useState<string>(() => toRawString(props));
	const [error, setError] = React.useState<string | null>(null);
	// Tránh trigger commit hai lần (vd: Enter -> blur).
	const committedRef = React.useRef(false);
	// Đánh dấu user chủ động hủy bằng Esc — bỏ qua commit ở blur.
	const cancelledRef = React.useRef(false);

	const isDisabled = props.disabled || busy;

	function startEditing() {
		if (isDisabled) return;
		setError(null);
		setDraft(toRawString(props));
		committedRef.current = false;
		cancelledRef.current = false;
		setEditing(true);
	}

	function cancel() {
		cancelledRef.current = true;
		setEditing(false);
		setError(null);
		setDraft(toRawString(props));
	}

	const commit = React.useCallback(
		async (rawDraft: string) => {
			if (busy || committedRef.current) return;
			const parsed = parseDraft(props, rawDraft);
			if (parsed.kind === 'error') {
				setError(parsed.message);
				toast.error(parsed.message);
				// Khôi phục về giá trị cũ để không kẹt edit.
				setDraft(toRawString(props));
				setEditing(false);
				return;
			}
			const validation = props.validate?.(parsed.value as never);
			if (validation) {
				setError(validation);
				toast.error(validation);
				setDraft(toRawString(props));
				setEditing(false);
				return;
			}
			if (sameValue(props, parsed.value)) {
				setEditing(false);
				setError(null);
				return;
			}
			committedRef.current = true;
			setBusy(true);
			setError(null);
			try {
				await props.onSave(parsed.value as never);
				setEditing(false);
				if (props.successToast !== false) {
					const label = typeof props.successToast === 'string' ? props.successToast : 'đã cập nhật';
					toast.success(label);
				}
			} catch (e) {
				const msg = e instanceof Error ? e.message : 'Không lưu được';
				setError(msg);
				toast.error(msg);
				// Lỗi -> giữ lại edit để user sửa tiếp.
				committedRef.current = false;
			} finally {
				setBusy(false);
			}
		},
		[busy, props]
	);

	function onKey(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
		if (e.key === 'Escape') {
			e.preventDefault();
			cancel();
			(e.currentTarget as HTMLElement).blur();
			return;
		}
		if (e.key === 'Enter' && props.type !== 'textarea') {
			e.preventDefault();
			(e.currentTarget as HTMLElement).blur(); // blur sẽ trigger commit
			return;
		}
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && props.type === 'textarea') {
			e.preventDefault();
			(e.currentTarget as HTMLElement).blur();
		}
	}

	function onBlur() {
		if (cancelledRef.current) {
			cancelledRef.current = false;
			return;
		}
		void commit(draft);
	}

	if (!editing) {
		return (
			<div
				className={cn(
					'group/editable relative -mx-2 rounded-md px-2 py-1.5 transition-colors',
					!isDisabled && 'cursor-text hover:bg-muted/50 focus-within:bg-muted/50',
					props.containerClassName
				)}
				role={isDisabled ? undefined : 'button'}
				tabIndex={isDisabled ? -1 : 0}
				onClick={startEditing}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						startEditing();
					}
				}}
			>
				{props.label ? (
					<p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
						{props.label}
					</p>
				) : null}
				<div className={cn('mt-0.5 flex min-h-6 items-center gap-1.5 text-sm', props.displayClassName)}>
					<DisplayValue {...props} />
					{busy ? (
						<Loader2Icon
							className='ml-auto size-3.5 shrink-0 animate-spin text-muted-foreground'
							aria-hidden
						/>
					) : !isDisabled ? (
						<PencilIcon
							className='ml-auto size-3.5 shrink-0 text-muted-foreground/0 transition-colors group-hover/editable:text-muted-foreground/70 group-focus-within/editable:text-muted-foreground/70'
							aria-hidden
						/>
					) : null}
				</div>
			</div>
		);
	}

	return (
		<div className={cn('-mx-2 space-y-1.5 rounded-md px-2 py-1.5', props.containerClassName)}>
			{props.label ? (
				<p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>{props.label}</p>
			) : null}
			<EditInput
				props={props}
				draft={draft}
				setDraft={setDraft}
				onKeyDown={onKey}
				onBlur={onBlur}
				onSelectCommit={v => {
					setDraft(v);
					void commit(v);
				}}
				onSelectOpenChange={open => {
					if (!open) {
						// Đóng dropdown mà không đổi -> thoát edit.
						if (!committedRef.current) {
							setEditing(false);
						}
					}
				}}
				hasError={Boolean(error)}
			/>
			{error ? <p className='text-xs text-destructive'>{error}</p> : null}
		</div>
	);
}

function DisplayValue(props: EditableFieldProps) {
	switch (props.type) {
		case 'text':
		case 'textarea': {
			const v = (props.value ?? '').toString().trim();
			if (!v) return <EmptyHint hint={props.emptyHint} />;
			return <span className={cn(props.type === 'textarea' && 'whitespace-pre-wrap leading-relaxed')}>{v}</span>;
		}
		case 'number': {
			if (props.value == null) return <EmptyHint hint={props.emptyHint} />;
			const formatted = new Intl.NumberFormat('vi-VN').format(props.value);
			return (
				<span className='tabular-nums'>
					{formatted}
					{props.suffix ? <span className='ml-1 text-muted-foreground'>{props.suffix}</span> : null}
				</span>
			);
		}
		case 'select': {
			const opt = props.options.find(o => o.value === props.value);
			if (!opt) return <EmptyHint hint={props.emptyHint} />;
			return <span>{opt.label}</span>;
		}
	}
}

function EmptyHint({ hint }: { hint?: string }) {
	return <span className='italic text-muted-foreground'>{hint ?? 'Chưa thiết lập'}</span>;
}

function EditInput({
	props,
	draft,
	setDraft,
	onKeyDown,
	onBlur,
	onSelectCommit,
	onSelectOpenChange,
	hasError,
}: {
	props: EditableFieldProps;
	draft: string;
	setDraft: (v: string) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	onBlur: () => void;
	onSelectCommit: (v: string) => void;
	onSelectOpenChange: (open: boolean) => void;
	hasError: boolean;
}) {
	const errorClass = hasError ? 'border-destructive' : '';
	switch (props.type) {
		case 'text':
			return (
				<Input
					autoFocus
					value={draft}
					onChange={e => setDraft(e.target.value)}
					onKeyDown={onKeyDown}
					onBlur={onBlur}
					placeholder={props.placeholder}
					maxLength={props.maxLength}
					className={cn('h-8 w-full', errorClass)}
				/>
			);
		case 'textarea':
			return (
				<Textarea
					autoFocus
					value={draft}
					onChange={e => setDraft(e.target.value)}
					onKeyDown={onKeyDown}
					onBlur={onBlur}
					placeholder={props.placeholder}
					maxLength={props.maxLength}
					rows={props.rows ?? 4}
					className={cn('w-full resize-none', errorClass)}
				/>
			);
		case 'number':
			return (
				<Input
					autoFocus
					inputMode='numeric'
					value={draft}
					onChange={e => setDraft(e.target.value.replace(/[^\d-]/g, ''))}
					onKeyDown={onKeyDown}
					onBlur={onBlur}
					placeholder={props.placeholder}
					className={cn('h-8 w-full tabular-nums', errorClass)}
				/>
			);
		case 'select':
			return (
				<Select defaultOpen value={draft} onValueChange={onSelectCommit} onOpenChange={onSelectOpenChange}>
					<SelectTrigger className={cn('h-8 w-full', errorClass)}>
						<SelectValue placeholder={props.placeholder} />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{props.options.map(o => (
								<SelectItem key={o.value} value={o.value}>
									{o.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			);
	}
}

function toRawString(props: EditableFieldProps): string {
	switch (props.type) {
		case 'text':
		case 'textarea':
			return props.value ?? '';
		case 'number':
			return props.value == null ? '' : String(props.value);
		case 'select':
			return props.value ?? '';
	}
}

type Parsed = { kind: 'ok'; value: string | number | null } | { kind: 'error'; message: string };

function parseDraft(props: EditableFieldProps, draft: string): Parsed {
	switch (props.type) {
		case 'text':
		case 'textarea':
			return { kind: 'ok', value: draft.trim() };
		case 'number': {
			const t = draft.trim();
			if (!t) return { kind: 'ok', value: null };
			const n = Number(t);
			if (!Number.isFinite(n)) return { kind: 'error', message: 'Phải là số hợp lệ' };
			const intVal = Math.trunc(n);
			if (props.min != null && intVal < props.min) return { kind: 'error', message: `Tối thiểu ${props.min}` };
			if (props.max != null && intVal > props.max) return { kind: 'error', message: `Tối đa ${props.max}` };
			return { kind: 'ok', value: intVal };
		}
		case 'select':
			return { kind: 'ok', value: draft };
	}
}

function sameValue(props: EditableFieldProps, next: string | number | null): boolean {
	switch (props.type) {
		case 'text':
		case 'textarea':
			return (props.value ?? '').trim() === (next as string);
		case 'number':
			return props.value === next;
		case 'select':
			return props.value === next;
	}
}
