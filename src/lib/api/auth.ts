import { apiClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  SmsLoginRequest,
  OAuthUrlResponse,
  OAuthCallbackRequest,
} from "./contracts";
import type { User } from "@/types";

export const authService = {
  loginByEmail(req: LoginRequest): Promise<LoginResponse> {
    return apiClient.post("/api/auth/login", req);
  },

  sendSmsCode(phone: string): Promise<void> {
    return apiClient.post("/api/auth/sms/send", { phone });
  },

  loginBySms(req: SmsLoginRequest): Promise<LoginResponse> {
    return apiClient.post("/api/auth/sms/login", req);
  },

  getOAuthUrl(provider: string): Promise<OAuthUrlResponse> {
    return apiClient.get(`/api/auth/oauth/${provider}`);
  },

  oauthCallback(req: OAuthCallbackRequest): Promise<LoginResponse> {
    return apiClient.post(`/api/auth/oauth/${req.provider}/callback`, {
      code: req.code,
    });
  },

  getCurrentUser(): Promise<User> {
    return apiClient.get("/api/auth/me");
  },

  logout(): Promise<void> {
    return apiClient.post("/api/auth/logout");
  },
};
