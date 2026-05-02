import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "请输入账号"),
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
  username: string;
  password: string;
}

export interface SmsLoginRequest {
  phone: string;
  code: string;
  rememberMe: boolean;
}

export interface BackendUser {
  userId: string;
  tenantId?: string;
  username: string;
  email: string;
  phone: string;
  realName: string;
  role: string;
  status?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  tokenType: string;
  user: BackendUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  tokenType: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// 以下 SMS / OAuth 仍走 MSW mock，保留旧形态
export interface MockedAuthResponse {
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

export const createParkingLotSchema = z.object({
  name: z.string().min(1, "请输入车场名称"),
  address: z.string().min(1, "请输入车场地址"),
  totalSpots: z.coerce.number().int().positive("总车位数必须大于0"),
  type: z.enum(["underground", "ground", "mechanical"]).optional(),
});

export const updateParkingLotSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  totalSpots: z.coerce.number().int().positive().optional(),
  type: z.enum(["underground", "ground", "mechanical"]).optional(),
  status: z.enum(["operating", "suspended"]).optional(),
});

export type CreateParkingLotFormData = z.infer<typeof createParkingLotSchema>;
export type UpdateParkingLotFormData = z.infer<typeof updateParkingLotSchema>;

export const exceptionHandleSchema = z.object({
  plateNumber: z.string().min(1, "请输入车牌号"),
  remark: z.string().optional(),
});

export type ExceptionHandleFormData = z.infer<typeof exceptionHandleSchema>;

export const createDeviceSchema = z.object({
  id: z.string().min(1, "请输入设备ID"),
  name: z.string().optional(),
  type: z.enum(["integrated", "camera_only", "barrier_only"], {
    required_error: "请选择设备类型",
  }),
  firmwareVersion: z.string().optional(),
});

export type CreateDeviceFormData = z.infer<typeof createDeviceSchema>;

export const updateDeviceNameSchema = z.object({
  name: z.string().min(1, "请输入设备名称"),
});

export type UpdateDeviceNameFormData = z.infer<typeof updateDeviceNameSchema>;

export const bindDeviceSchema = z.object({
  parkingLotId: z.string().min(1, "请选择停车场"),
  gateId: z.string().min(1, "请选择道闸"),
});

export type BindDeviceFormData = z.infer<typeof bindDeviceSchema>;

export const createTenantSchema = z.object({
  companyName: z.string().min(1, "请输入公司名称"),
  description: z.string().optional(),
  creditCode: z.string().optional(),
  contactPerson: z.string().min(1, "请输入联系人"),
  contactPhone: z
    .string()
    .min(1, "请输入联系电话")
    .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号"),
  adminEmail: z.string().email("请输入有效的邮箱地址").optional().or(z.literal("")),
  remark: z.string().optional(),
});

export const updateTenantSchema = z.object({
  companyName: z.string().min(1).optional(),
  description: z.string().optional(),
  creditCode: z.string().optional(),
  contactPerson: z.string().min(1).optional(),
  contactPhone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号")
    .optional()
    .or(z.literal("")),
  adminEmail: z.string().email("请输入有效的邮箱地址").optional().or(z.literal("")),
  remark: z.string().optional(),
});

export type CreateTenantFormData = z.infer<typeof createTenantSchema>;
export type UpdateTenantFormData = z.infer<typeof updateTenantSchema>;

export const updateBillingRuleSchema = z.object({
  freeDurationMinutes: z.coerce.number().int().min(0).max(120).optional(),
  unitPrice: z.coerce.number().min(0.5).max(50).optional(),
  dailyCap: z.union([z.coerce.number().min(0).max(500), z.null()]).optional(),
  billingCycle: z.enum(["hourly", "half_hourly"]).optional(),
});

export type UpdateBillingRuleFormData = z.infer<typeof updateBillingRuleSchema>;

export const calculateFeeSchema = z.object({
  parkingLotId: z.string().min(1, "请选择停车场"),
  entryTime: z.string().min(1, "请选择入场时间"),
  exitTime: z.string().min(1, "请选择出场时间"),
});

export type CalculateFeeFormData = z.infer<typeof calculateFeeSchema>;

export const paymentSchema = z.object({
  orderId: z.string().min(1, "缺少订单号"),
  method: z.enum(["wechat", "alipay"], { required_error: "请选择支付方式" }),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// === Profile ===

export const updateProfileSchema = z.object({
  realName: z.string().min(1, "请输入姓名").max(50, "姓名不能超过50个字符"),
  email: z.string().email("请输入有效的邮箱地址").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "请输入当前密码"),
    newPassword: z
      .string()
      .min(8, "新密码至少8个字符")
      .regex(/[A-Z]/, "新密码需包含大写字母")
      .regex(/[a-z]/, "新密码需包含小写字母")
      .regex(/[0-9]/, "新密码需包含数字"),
    confirmPassword: z.string().min(1, "请确认新密码"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const resetPasswordSchema = z
  .object({
    phone: z
      .string()
      .min(1, "请输入手机号")
      .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号"),
    code: z
      .string()
      .min(1, "请输入验证码")
      .regex(/^\d{6}$/, "验证码为6位数字"),
    newPassword: z
      .string()
      .min(8, "新密码至少8个字符")
      .regex(/[A-Z]/, "新密码需包含大写字母")
      .regex(/[a-z]/, "新密码需包含小写字母")
      .regex(/[0-9]/, "新密码需包含数字"),
    confirmPassword: z.string().min(1, "请确认新密码"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
