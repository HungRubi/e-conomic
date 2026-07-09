import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser } from './auth-types';
import {
  loginApi,
  refreshSession,
  getMe,
  clearSession,
  saveSession,
  readStoredAccessToken,
} from './auth-api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  ready: boolean;
  signOut: () => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ready, setReady] = useState(false);

  // ── Initialise: restore session on mount ────────────────
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const token = readStoredAccessToken();
      if (!token) {
        if (!cancelled) {
          setIsLoading(false);
          setReady(true);
        }
        return;
      }
      try {
        const userData = await getMe();
        if (!cancelled) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role as AuthUser['role'],
            permissions: userData.role === 'admin' ? ['*'] : [],
            totpEnabled: (userData as any).totpEnabled ?? false,
            totpBackupCodesRemaining: (userData as any).totpBackupCodesRemaining,
          });
        }
      } catch {
        // Token expired — try refresh
        const newToken = await refreshSession();
        if (newToken && !cancelled) {
          try {
            const userData = await getMe();
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role as AuthUser['role'],
              permissions: userData.role === 'admin' ? ['*'] : [],
              totpEnabled: (userData as any).totpEnabled ?? false,
              totpBackupCodesRemaining: (userData as any).totpBackupCodesRemaining,
            });
          } catch {
            clearSession();
          }
        } else {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setReady(true);
        }
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // ── Login ───────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi(email, password);
    saveSession(res.token, res.refreshToken);
    setUser({
      id: res.user.id,
      email: res.user.email,
      name: res.user.name,
      role: res.user.role as AuthUser['role'],
      permissions: res.user.role === 'admin' ? ['*'] : [],
      totpEnabled: false,
      totpBackupCodesRemaining: undefined,
    });
  }, []);

  // ── Sign out ────────────────────────────────────────────
  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await getMe();
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role as AuthUser['role'],
        permissions: userData.role === 'admin' ? ['*'] : [],
        totpEnabled: (userData as any).totpEnabled ?? false,
        totpBackupCodesRemaining: (userData as any).totpBackupCodesRemaining,
      });
    } catch {
      signOut();
    }
  }, [signOut]);

  const value: AuthContextValue = {
    user,
    isLoading,
    ready,
    signOut,
    logout: signOut,
    login,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
