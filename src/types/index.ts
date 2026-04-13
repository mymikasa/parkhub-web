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
