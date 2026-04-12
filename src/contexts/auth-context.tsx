"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import { authService } from "@/lib/api/auth";
import {
  saveSession,
  loadSession,
  clearSession,
  createSession,
} from "@/lib/session/storage";
import type { LoginRequest, SmsLoginRequest } from "@/lib/api/contracts";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (req: LoginRequest) => Promise<void>;
  loginBySms: (req: SmsLoginRequest) => Promise<void>;
  oauthLogin: (provider: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

type AuthContext = AuthState & AuthActions;

const AuthCtx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const session = loadSession();
    if (session) {
      authService
        .getCurrentUser()
        .then((user) => {
          setState({ user, isLoading: false, isAuthenticated: true });
        })
        .catch(() => {
          clearSession();
          setState({ user: null, isLoading: false, isAuthenticated: false });
        });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (req: LoginRequest) => {
    const res = await authService.loginByEmail(req);
    const session = createSession(res.token, res.user, req.rememberMe);
    saveSession(session);
    setState({ user: res.user, isLoading: false, isAuthenticated: true });
  }, []);

  const loginBySms = useCallback(async (req: SmsLoginRequest) => {
    const res = await authService.loginBySms(req);
    const session = createSession(res.token, res.user, req.rememberMe);
    saveSession(session);
    setState({ user: res.user, isLoading: false, isAuthenticated: true });
  }, []);

  const oauthLogin = useCallback(
    async (provider: string, code: string) => {
      const res = await authService.oauthCallback({ provider, code });
      const session = createSession(res.token, res.user, true);
      saveSession(session);
      setState({ user: res.user, isLoading: false, isAuthenticated: true });
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  return (
    <AuthCtx.Provider
      value={{ ...state, login, loginBySms, oauthLogin, logout }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthContext {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
