import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from '@/auth/auth-context';
import { ConfirmProvider } from '@/components/confirm-dialog';
import { ErrorBoundary } from '@/components/error-boundary';
import { initSentry } from '@/lib/sentry';
import { PendingOrdersProvider } from './providers/pending-orders-provider';
import { AppQueryClientProvider } from './providers/query-client-provider';
import { ThemeProvider } from './providers/theme-provider';

initSentry();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ErrorBoundary>
			<ThemeProvider>
				<AppQueryClientProvider>
					<BrowserRouter>
						<AuthProvider>
							<PendingOrdersProvider>
								<ConfirmProvider>
									<App />
								</ConfirmProvider>
							</PendingOrdersProvider>
						</AuthProvider>
					</BrowserRouter>
				</AppQueryClientProvider>
			</ThemeProvider>
		</ErrorBoundary>
	</StrictMode>
);
