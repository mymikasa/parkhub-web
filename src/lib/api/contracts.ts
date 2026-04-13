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
