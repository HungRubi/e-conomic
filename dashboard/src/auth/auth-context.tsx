import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser } from './auth-types';
import {
  loginApi,
  refreshSession,
  getMe,
  clearSession,
  saveSession,
  readStoredRefreshToken,
} from './auth-api';
import type { AuthUserResponse } from './auth-api';

// ── Helper ──────────────────────────────────────────────────
function parseUser(u: AuthUserResponse): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as AuthUser['role'],
    permissions: u.role === 'admin' ? ['*'] : [],
    totpEnabled: (u as any).totpEnabled ?? false,
    totpBackupCodesRemaining: (u as any).totpBackupCodesRemaining,
  };
}

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
      const refreshToken = readStoredRefreshToken();
      if (!refreshToken) {
        if (!cancelled) { setIsLoading(false); setReady(true); }
        return;
      }
      // Try refresh first — handles expired accessToken in 1 round-trip
      const newToken = await refreshSession();
      if (!newToken || cancelled) {
        if (!cancelled) { setIsLoading(false); setReady(true); }
        return;
      }
      try {
        const userData = await getMe();
        if (!cancelled) {
          setUser(parseUser(userData));
        }
      } catch {
        clearSession();
      } finally {
        if (!cancelled) { setIsLoading(false); setReady(true); }
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // ── Login ───────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi(email, password);
    saveSession(res.token, res.refreshToken);
    setUser(parseUser(res.user));
  }, []);

  // ── Sign out ────────────────────────────────────────────
  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await getMe();
      setUser(parseUser(userData));
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
