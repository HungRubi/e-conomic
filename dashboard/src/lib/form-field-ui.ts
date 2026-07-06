import type { Dispatch, SetStateAction } from 'react';

/** Chỉ giữ ký tự số (dùng cho giá, thứ tự). */
export function digitsOnly(raw: string): string {
	return raw.replace(/\D/g, '');
}

export type FieldErrorMap = Record<string, string>;

export function scrollToFormFieldById(elementId: string): void {
	requestAnimationFrame(() => {
		const el = document.getElementById(elementId);
		if (!el) return;
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		const selfFocus =
			el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
		if (selfFocus) {
			el.focus({ preventScroll: true });
			return;
		}
		const trigger = el.querySelector<HTMLElement>('[data-slot="select-trigger"]');
		if (trigger) {
			trigger.focus({ preventScroll: true });
			return;
		}
		const inner = el.querySelector<HTMLElement>('input, textarea, select, button');
		inner?.focus({ preventScroll: true });
	});
}

export function scrollToFirstFieldError(fieldIdsInOrder: readonly string[], errors: FieldErrorMap): void {
	const id = fieldIdsInOrder.find(fid => Boolean(errors[fid]));
	if (id) scrollToFormFieldById(id);
}

export function stripFieldError(setErrors: Dispatch<SetStateAction<FieldErrorMap>>, fieldId: string): void {
	setErrors(prev => {
		if (!(fieldId in prev)) return prev;
		const next = { ...prev };
		delete next[fieldId];
		return next;
	});
}
