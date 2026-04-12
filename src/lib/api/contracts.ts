import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "请输入账号").email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
  rememberMe: z.boolean(),
});

export const smsLoginSchema = z.object({
  phone: z
    .string()
    .min(1, "请输入手机号")
    .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号"),
  code: z
    .string()
    .min(1, "请输入验证码")
    .regex(/^\d{6}$/, "验证码为6位数字"),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SmsLoginFormData = z.infer<typeof smsLoginSchema>;

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SmsLoginRequest {
  phone: string;
  code: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar?: string;
  };
}

export interface OAuthUrlResponse {
  url: string;
  provider: string;
}

export interface OAuthCallbackRequest {
  provider: string;
  code: string;
}
