import { apiClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  BackendUser,
  RefreshTokenResponse,
  OAuthUrlResponse,
  OAuthCallbackRequest,
  MockedAuthResponse,
} from "./contracts";
import type { User } from "@/types";

export function mapBackendUser(b: BackendUser): User {
  return {
    id: b.userId,
    name: b.realName || b.username,
    email: b.email,
    phone: b.phone,
    role: b.role,
  };
}

export interface SmsSendRequest {
  phone: string;
  purpose?: "SMS_PURPOSE_LOGIN" | "SMS_PURPOSE_REGISTER" | "SMS_PURPOSE_RESET_PASSWORD";
}

export interface SmsLoginApiRequest {
  phone: string;
  code: string;
}

export const authService = {
  loginByPassword(req: LoginRequest): Promise<LoginResponse> {
    return apiClient.post("/identity/v1/auth/login", req);
  },

  refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return apiClient.post("/identity/v1/auth/refresh", { refreshToken });
  },

  logoutReal(refreshToken: string): Promise<void> {
    return apiClient.post("/identity/v1/auth/logout", { refreshToken });
  },

  sendSmsCode(phone: string, purpose: SmsSendRequest["purpose"] = "SMS_PURPOSE_LOGIN"): Promise<void> {
    return apiClient.post("/identity/v1/auth/sms/send", { phone, purpose });
  },

  loginBySms(req: SmsLoginApiRequest): Promise<LoginResponse> {
    return apiClient.post("/identity/v1/auth/sms/login", req);
  },

  getCurrentUser(): Promise<{ user: BackendUser }> {
    return apiClient.get("/identity/v1/users/me");
  },

  // OAuth 暂时从 UI 隐藏，代码保留
  getOAuthUrl(provider: string): Promise<OAuthUrlResponse> {
    return apiClient.get(`/api/auth/oauth/${provider}`);
  },

  oauthCallback(req: OAuthCallbackRequest): Promise<MockedAuthResponse> {
    return apiClient.post(`/api/auth/oauth/${req.provider}/callback`, {
      code: req.code,
    });
  },
};
