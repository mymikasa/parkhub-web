export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
}

export interface Session {
  token: string;
  user: User;
  expiresAt: number;
  rememberMe: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type ParkingLotStatus = "operating" | "suspended";
export type ParkingLotType = "underground" | "ground" | "mechanical";
export type LaneType = "entry" | "exit";
export type DeviceOnlineStatus = "online" | "offline";

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  type: ParkingLotType;
  status: ParkingLotStatus;
  totalSpots: number;
  availableSpots: number;
  occupiedSpots: number;
  usageRate: number;
  entryCount: number;
  exitCount: number;
  laneCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingLotSummary {
  totalSpots: number;
  availableSpots: number;
  occupiedSpots: number;
  laneCount: number;
}

export interface Lane {
  id: string;
  parkingLotId: string;
  name: string;
  type: LaneType;
  device?: LaneDevice;
}

export interface LaneDevice {
  id: string;
  name: string;
  status: DeviceOnlineStatus;
  lastHeartbeat?: string;
}

export interface DeviceOption {
  id: string;
  name: string;
  status: DeviceOnlineStatus;
  laneType?: LaneType;
}

export interface LaneConfigResponse {
  lanes: Lane[];
  availableDevices: DeviceOption[];
}

export interface CreateParkingLotRequest {
  name: string;
  address: string;
  totalSpots: number;
  type?: ParkingLotType;
}

export interface UpdateParkingLotRequest {
  name?: string;
  address?: string;
  totalSpots?: number;
  type?: ParkingLotType;
  status?: ParkingLotStatus;
}

export interface UpdateLanesRequest {
  lanes: Array<{
    id?: string;
    name: string;
    type: LaneType;
    deviceId?: string;
  }>;
}

// === Entry-Exit Records ===

export type RecordType = "entry" | "exit";
export type RecordStatus = "normal" | "paid" | "entry_no_exit" | "exit_no_entry" | "recognition_failed";
export type ExceptionType = "entry_no_exit" | "exit_no_entry" | "recognition_failed";

export interface EntryExitRecord {
  id: string;
  plateNumber: string;
  parkingLotId: string;
  parkingLotName: string;
  laneName: string;
  type: RecordType;
  status: RecordStatus;
  fee: number | null;
  time: string;
  imageUrl?: string;
  deviceSerialNumber?: string;
}

export interface RecordSummary {
  totalExceptions: number;
  entryNoExit: number;
  exitNoEntry: number;
  recognitionFailed: number;
}

export interface RecordFilters {
  dateFrom?: string;
  dateTo?: string;
  plateNumber?: string;
  parkingLotId?: string;
  type?: RecordType;
  status?: RecordStatus | "exception";
  page?: number;
  pageSize?: number;
}

export interface ExceptionHandleRequest {
  plateNumber: string;
  remark?: string;
}

// === Device Management ===

export type DeviceType = "integrated" | "camera_only" | "barrier_only";

export interface Device {
  id: string;
  serialNumber: string;
  name: string;
  type: DeviceType;
  status: DeviceOnlineStatus;
  parkingLotId: string;
  parkingLotName: string;
  laneName: string;
  laneType: LaneType;
  lastHeartbeat: string | null;
  todayTraffic: number | null;
}

export interface DeviceSummary {
  total: number;
  online: number;
  offline: number;
  todayTraffic: number;
  onlineRate: number;
}

export interface DeviceFilters {
  page?: number;
  pageSize?: number;
  status?: DeviceOnlineStatus;
  parkingLotId?: string;
  keyword?: string;
}

export interface RegisterDeviceRequest {
  serialNumber: string;
  parkingLotId: string;
  laneId: string;
  type: DeviceType;
}

export interface DeviceCommandRequest {
  action: "up" | "down";
}

// === Tenant Management ===

export type TenantStatus = "active" | "frozen";

export interface Tenant {
  id: string;
  companyName: string;
  description?: string;
  creditCode?: string;
  contactPerson: string;
  contactPhone: string;
  adminEmail?: string;
  remark?: string;
  parkingLotCount: number;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSummary {
  total: number;
  active: number;
  frozen: number;
  totalParkingLots: number;
  avgParkingLotsPerTenant: number;
}

export interface TenantFilters {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: TenantStatus;
}

export interface CreateTenantRequest {
  companyName: string;
  description?: string;
  creditCode?: string;
  contactPerson: string;
  contactPhone: string;
  adminEmail?: string;
  remark?: string;
}

export interface UpdateTenantRequest {
  companyName?: string;
  description?: string;
  creditCode?: string;
  contactPerson?: string;
  contactPhone?: string;
  adminEmail?: string;
  remark?: string;
}

// === Billing Rules ===

export type BillingCycle = "hourly" | "half_hourly";

export interface BillingRule {
  id: string;
  parkingLotId: string;
  parkingLotName: string;
  freeDurationMinutes: number;
  unitPrice: number;
  dailyCap: number | null;
  billingCycle: BillingCycle;
  enabled: boolean;
  updatedAt: string;
}

export interface BillingLotOption {
  id: string;
  name: string;
  status: ParkingLotStatus;
  hasRule: boolean;
}

export interface BillingRuleListParams {
  parkingLotId?: string;
}

export interface UpdateBillingRuleRequest {
  freeDurationMinutes?: number;
  unitPrice?: number;
  dailyCap?: number | null;
  billingCycle?: BillingCycle;
}

export interface CalculateFeeRequest {
  parkingLotId: string;
  entryTime: string;
  exitTime: string;
}

export interface CalculateFeeResult {
  duration: string;
  freeDuration: string;
  billableDuration: string;
  unitPrice: number;
  totalFee: number;
}
