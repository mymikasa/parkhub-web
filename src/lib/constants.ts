export const APP_NAME = "ParkHub";

export const ROUTES = {
  LOGIN: "/login",
  OAUTH_PROVIDER: (provider: string) => `/oauth/${provider}`,
  DASHBOARD_HOME: "/tenant-management",
  TENANT_MANAGEMENT: "/tenant-management",
  PARKING_LOT: "/parking-lot",
  DEVICE_MANAGEMENT: "/device-management",
  BILLING_RULES: "/billing-rules",
  REALTIME_MONITOR: "/realtime-monitor",
  ENTRY_EXIT_RECORDS: "/entry-exit-records",
  OPERATOR_WORKSPACE: "/operator-workspace",
  PAYMENT: "/pay",
} as const;

export const DEMO_CREDENTIALS = {
  EMAIL: "admin@parkhub.test",
  PASSWORD: "ParkHub123",
  PHONE: "13800000000",
  SMS_CODE: "123456",
} as const;

export const AUTH_STORAGE_KEY = "parkhub_session";
export const AUTH_TOKEN_KEY = "parkhub_token";
