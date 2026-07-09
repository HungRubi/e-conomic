import { apiUrl } from '@/lib/api-url';

const ACCESS_TOKEN_KEY = 'e-conomic-access-token';
const REFRESH_TOKEN_KEY = 'e-conomic-refresh-token';

export class AuthApiError extends Error {
  status: number | undefined;
  code: string | undefined;
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.code = code;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: any;
    try {
      body = await res.json();
    } catch {
      throw new AuthApiError(`HTTP ${res.status}`, res.status);
    }
    throw new AuthApiError(
      body.message || body.error || 'Request failed',
      res.status,
      body.code,
    );
  }
  return res.json();
}

function apiHeader(): Record<string, string> {
  const token = readStoredAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ── Token management ──────────────────────────────────────

export function readStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

function readStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveSession(token: string, refreshToken: string): void {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch { /* storage full */ }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch { /* ignore */ }
}

// ── Auth response types (mirrors NestJS DTO) ──────────────

export interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUserResponse;
}

// ── API calls ─────────────────────────────────────────────

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(apiUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function registerApi(data: {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthResponse> {
  const res = await fetch(apiUrl('/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(res);
}

export async function refreshSession(): Promise<string | null> {
  const refreshToken = readStoredRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(apiUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await handleResponse<AuthResponse>(res);
    saveSession(data.token, data.refreshToken);
    return data.token;
  } catch {
    clearSession();
    return null;
  }
}

export async function getMe(): Promise<AuthUserResponse> {
  const res = await fetch(apiUrl('/auth/me'), {
    headers: apiHeader(),
  });
  return handleResponse<AuthUserResponse>(res);
}

export async function updateMyProfile(data: {
  name?: string;
  email?: string;
}): Promise<AuthUserResponse> {
  const res = await fetch(apiUrl('/auth/profile'), {
    method: 'PATCH',
    headers: apiHeader(),
    body: JSON.stringify(data),
  });
  return handleResponse<AuthUserResponse>(res);
}

export async function changeMyPassword(
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(apiUrl('/auth/password'), {
    method: 'PATCH',
    headers: apiHeader(),
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  await handleResponse(res);
}

export async function requestForgotPassword(
  email: string,
): Promise<{ token?: string }> {
  const res = await fetch(apiUrl('/auth/forgot-password'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse<{ message: string; token?: string }>(res);
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  const res = await fetch(apiUrl('/auth/reset-password'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  await handleResponse(res);
}

// ── TOTP stubs (server doesn't support yet) ──────────────

export interface TotpEnrollResponse {
  secret: string;
  qrDataUrl: string;
}

export async function startTotpEnrollment(): Promise<TotpEnrollResponse> {
  throw new AuthApiError('TOTP not implemented on server yet', 501);
}

export async function confirmTotpEnrollment(
  _code: string,
): Promise<{ backupCodes: string[] }> {
  throw new AuthApiError('TOTP not implemented on server yet', 501);
}

export async function disableTotp(
  _password: string,
  _code: string,
): Promise<void> {
  throw new AuthApiError('TOTP not implemented on server yet', 501);
}

export async function regenerateBackupCodes(
  _password: string,
  _code: string,
): Promise<{ backupCodes: string[] }> {
  throw new AuthApiError('TOTP not implemented on server yet', 501);
}
