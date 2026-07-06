export class AuthApiError extends Error {
  status: number | undefined;
  code: string | undefined;
  constructor(
    message: string,
    status?: number,
    code?: string,
  ) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.code = code;
  }
}
export function readStoredAccessToken(): string | null { return "mock-token"; }
export function clearSession(): void { /* mock */ }
export async function refreshSession(): Promise<string | null> { return "mock-token"; }
export async function requestForgotPassword(_email: string): Promise<{ token?: string }> { return { token: 'mock-token' }; }
export async function resetPassword(_token: string, _password: string): Promise<void> { /* mock */ }
export async function changeMyPassword(_old: string, _new: string): Promise<void> { /* mock */ }
export async function updateMyProfile(_data: { name?: string; phone?: string }): Promise<void> { /* mock */ }
