import * as React from 'react';
import { AlertTriangleIcon, RotateCcwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { reportError } from '@/lib/sentry';

type Props = {
	children: React.ReactNode;
	fallback?: (error: Error, reset: () => void) => React.ReactNode;
	onError?: (error: Error, info: React.ErrorInfo) => void;
};

type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
	state: State = { error: null };

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo): void {
		this.props.onError?.(error, info);
		console.error('[ErrorBoundary]', error, info.componentStack);
		reportError(error, { componentStack: info.componentStack });
	}

	reset = () => {
		this.setState({ error: null });
	};

	render(): React.ReactNode {
		if (this.state.error) {
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, this.reset);
			}
			return <DefaultErrorFallback error={this.state.error} onReset={this.reset} />;
		}
		return this.props.children;
	}
}

function DefaultErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
	return (
		<div
			role='alert'
			className='m-4 flex flex-col items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-6'
		>
			<div className='flex items-center gap-2 text-destructive'>
				<AlertTriangleIcon className='size-5' aria-hidden />
				<h2 className='text-base font-semibold'>đã có lỗi xảy ra</h2>
			</div>
			<p className='text-sm text-muted-foreground'>
				Trang không thể hiển thị do một lỗi không mong muốn. Bạn có thể thử lại hoặc tải lại toàn bộ.
			</p>
			<pre className='max-h-40 w-full overflow-auto rounded-md bg-muted/50 p-3 text-xs'>
				{error.message}
			</pre>
			<div className='flex gap-2'>
				<Button type='button' variant='outline' onClick={onReset}>
					<RotateCcwIcon className='mr-1.5 size-4' aria-hidden />
					Thử lại
				</Button>
				<Button type='button' onClick={() => window.location.reload()}>
					Tải lại trang
				</Button>
			</div>
		</div>
	);
}

export function RouteErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
	return <DefaultErrorFallback error={error} onReset={onReset} />;
}
