import { createContext, useContext, useCallback, useState, type ReactNode } from "react";
import type { AuthUser } from "./auth-types";

interface AuthContextValue {
  user: AuthUser;
  isLoading: boolean;
  ready: boolean;
  signOut: () => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  completeTotpLogin: (code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const mockUser: AuthUser = {
  id: "mock-admin-id",
  email: "admin@miuehealing.com",
  name: "Admin",
  role: "admin",
  permissions: ["*"],
  avatarUrl: "/avatars/shadcn.jpg",
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<AuthUser>(mockUser);
  const signOut = useCallback(() => { /* mock */ }, []);
  const login = useCallback(async (_email: string, _password: string) => { /* mock */ }, []);
  const completeTotpLogin = useCallback(async (_code: string) => { /* mock */ }, []);
  const value: AuthContextValue = {
    user,
    isLoading: false,
    ready: true,
    signOut,
    logout: signOut,
    login,
    completeTotpLogin,
    refreshUser: async () => { /* mock */ },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
