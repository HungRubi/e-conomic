import * as React from 'react';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type ConfirmOptions = {
	title: string;
	description?: React.ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	destructive?: boolean;
};

type Resolver = (confirmed: boolean) => void;

type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmContextValue | null>(null);

type DialogState = ConfirmOptions & { resolver: Resolver };

/**
 * Provider cung cấp `useConfirm()` — mỗi lần gọi mở 1 AlertDialog đồng nhất.
 * Tránh `window.confirm()` (không theme, không tiếng Việt) và copy-paste AlertDialog
 * boilerplate khắp panels.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = React.useState<DialogState | null>(null);

	const confirm = React.useCallback<ConfirmContextValue>(options => {
		return new Promise<boolean>(resolve => {
			setState({ ...options, resolver: resolve });
		});
	}, []);

	const close = (result: boolean) => {
		state?.resolver(result);
		setState(null);
	};

	return (
		<ConfirmContext.Provider value={confirm}>
			{children}
			<AlertDialog open={state !== null} onOpenChange={open => !open && close(false)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{state?.title}</AlertDialogTitle>
						{state?.description ? (
							<AlertDialogDescription asChild>
								<div>{state.description}</div>
							</AlertDialogDescription>
						) : null}
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => close(false)}>
							{state?.cancelLabel ?? 'Hủy'}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => close(true)}
							className={
								state?.destructive
									? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
									: undefined
							}
						>
							{state?.confirmLabel ?? 'Xác nhận'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</ConfirmContext.Provider>
	);
}

export function useConfirm(): ConfirmContextValue {
	const ctx = React.useContext(ConfirmContext);
	if (!ctx) {
		throw new Error('useConfirm phải dùng bên trong ConfirmProvider');
	}
	return ctx;
}
