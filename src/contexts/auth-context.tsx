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
import { authService, mapBackendUser } from "@/lib/api/auth";
import {
  saveSession,
  loadSession,
  clearSession,
  createSession,
} from "@/lib/session/storage";
import type { SmsLoginRequest } from "@/lib/api/contracts";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface PasswordLoginInput {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface AuthActions {
  login: (req: PasswordLoginInput) => Promise<void>;
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
    if (!session) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    // 乐观先用缓存 user 渲染，再通过 /me 校验 token 有效性
    setState({
      user: session.user,
      isLoading: false,
      isAuthenticated: true,
    });
    authService
      .getCurrentUser()
      .then(({ user }) => {
        const mapped = mapBackendUser(user);
        saveSession({ ...session, user: mapped });
        setState({ user: mapped, isLoading: false, isAuthenticated: true });
      })
      .catch(() => {
        clearSession();
        setState({ user: null, isLoading: false, isAuthenticated: false });
      });
  }, []);

  const applyLoginResponse = useCallback(
    (
      res: {
        accessToken: string;
        refreshToken: string;
        accessExpiresIn: number;
        user: import("@/lib/api/contracts").BackendUser;
      },
      rememberMe: boolean
    ) => {
      const user = mapBackendUser(res.user);
      const session = createSession(res.accessToken, user, rememberMe, {
        refreshToken: res.refreshToken,
        expiresInSeconds: res.accessExpiresIn,
      });
      saveSession(session);
      setState({ user, isLoading: false, isAuthenticated: true });
    },
    []
  );

  const login = useCallback(
    async (req: PasswordLoginInput) => {
      const res = await authService.loginByPassword({
        username: req.username,
        password: req.password,
      });
      applyLoginResponse(res, req.rememberMe);
    },
    [applyLoginResponse]
  );

  const loginBySms = useCallback(
    async (req: SmsLoginRequest) => {
      const res = await authService.loginBySms({
        phone: req.phone,
        code: req.code,
      });
      applyLoginResponse(res, req.rememberMe);
    },
    [applyLoginResponse]
  );

  const oauthLogin = useCallback(async (provider: string, code: string) => {
    const res = await authService.oauthCallback({ provider, code });
    const session = createSession(res.token, res.user, true);
    saveSession(session);
    setState({ user: res.user, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    const session = loadSession();
    try {
      if (session?.refreshToken) {
        await authService.logoutReal(session.refreshToken);
      }
    } catch {
      // 吞掉失败，本地仍需清理
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
