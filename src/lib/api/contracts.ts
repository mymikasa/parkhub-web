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

export const registerDeviceSchema = z.object({
  serialNumber: z.string().min(1, "请输入设备序列号"),
  parkingLotId: z.string().min(1, "请选择停车场"),
  laneId: z.string().min(1, "请选择出入口"),
  type: z.enum(["integrated", "camera_only", "barrier_only"], {
    required_error: "请选择设备类型",
  }),
});

export type RegisterDeviceFormData = z.infer<typeof registerDeviceSchema>;

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
