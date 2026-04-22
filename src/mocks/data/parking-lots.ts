export interface BackendParkingLot {
  id: string;
  tenant_id: string;
  name: string;
  address: string;
  total_spaces: number;
  available_spaces: number;
  lot_type: string;
  status: string;
  created_at: { seconds: string; nanos: number };
  updated_at: { seconds: string; nanos: number };
}

export const mockParkingLots: BackendParkingLot[] = [
  {
    id: "lot_001",
    tenant_id: "tenant_001",
    name: "万科翡翠滨江地下停车场",
    address: "上海市浦东新区陆家嘴环路1000号",
    total_spaces: 800,
    available_spaces: 156,
    lot_type: "LOT_TYPE_UNDERGROUND",
    status: "PARKING_LOT_STATUS_ACTIVE",
    created_at: { seconds: "1705305600", nanos: 0 },
    updated_at: { seconds: "1734703800", nanos: 0 },
  },
  {
    id: "lot_002",
    tenant_id: "tenant_001",
    name: "万科广场商业停车场",
    address: "上海市闵行区七莘路3655号",
    total_spaces: 1200,
    available_spaces: 89,
    lot_type: "LOT_TYPE_GROUND",
    status: "PARKING_LOT_STATUS_ACTIVE",
    created_at: { seconds: "1708384800", nanos: 0 },
    updated_at: { seconds: "1734620700", nanos: 0 },
  },
  {
    id: "lot_003",
    tenant_id: "tenant_002",
    name: "万科城市花园停车场",
    address: "上海市宝山区共康路555号",
    total_spaces: 450,
    available_spaces: 203,
    lot_type: "LOT_TYPE_GROUND",
    status: "PARKING_LOT_STATUS_ACTIVE",
    created_at: { seconds: "1710032400", nanos: 0 },
    updated_at: { seconds: "1734505200", nanos: 0 },
  },
  {
    id: "lot_004",
    tenant_id: "tenant_002",
    name: "万科翡翠别墅区停车场",
    address: "上海市松江区泗泾镇古楼路888号",
    total_spaces: 320,
    available_spaces: 320,
    lot_type: "LOT_TYPE_UNDERGROUND",
    status: "PARKING_LOT_STATUS_INACTIVE",
    created_at: { seconds: "1712284800", nanos: 0 },
    updated_at: { seconds: "1734243600", nanos: 0 },
  },
  {
    id: "lot_005",
    tenant_id: "tenant_003",
    name: "万科星城立体车库",
    address: "上海市嘉定区南翔镇银翔路66号",
    total_spaces: 500,
    available_spaces: 210,
    lot_type: "LOT_TYPE_STEREO",
    status: "PARKING_LOT_STATUS_ACTIVE",
    created_at: { seconds: "1716160800", nanos: 0 },
    updated_at: { seconds: "1734760500", nanos: 0 },
  },
  {
    id: "lot_006",
    tenant_id: "tenant_003",
    name: "万科金域华府停车场",
    address: "上海市青浦区盈港东路168号",
    total_spaces: 680,
    available_spaces: 102,
    lot_type: "LOT_TYPE_UNDERGROUND",
    status: "PARKING_LOT_STATUS_ACTIVE",
    created_at: { seconds: "1717200000", nanos: 0 },
    updated_at: { seconds: "1734716400", nanos: 0 },
  },
];

export interface MockLaneDevice {
  id: string;
  name: string;
  status: "online" | "offline";
  lastHeartbeat: string;
}

export interface MockLane {
  id: string;
  parkingLotId: string;
  name: string;
  type: "entry" | "exit";
  device?: MockLaneDevice;
}

export const mockLaneDevices: MockLaneDevice[] = [
  { id: "dev_001", name: "PH-DEV-2024-001", status: "online", lastHeartbeat: "2024-12-21T10:00:00Z" },
  { id: "dev_002", name: "PH-DEV-2024-002", status: "online", lastHeartbeat: "2024-12-21T10:00:00Z" },
  { id: "dev_003", name: "PH-DEV-2024-003", status: "online", lastHeartbeat: "2024-12-21T10:00:00Z" },
  { id: "dev_004", name: "PH-DEV-2024-004", status: "offline", lastHeartbeat: "2024-12-21T09:45:00Z" },
  { id: "dev_005", name: "PH-DEV-2024-005", status: "online", lastHeartbeat: "2024-12-21T10:00:00Z" },
  { id: "dev_006", name: "PH-DEV-2024-006", status: "online", lastHeartbeat: "2024-12-21T10:00:00Z" },
  { id: "dev_007", name: "PH-DEV-2024-007", status: "offline", lastHeartbeat: "2024-12-21T09:30:00Z" },
  { id: "dev_008", name: "PH-DEV-2024-008", status: "online", lastHeartbeat: "2024-12-21T10:00:00Z" },
  { id: "dev_009", name: "PH-DEV-2024-009", status: "online", lastHeartbeat: "2024-12-21T10:00:00Z" },
  { id: "dev_010", name: "PH-DEV-2024-010", status: "online", lastHeartbeat: "2024-12-21T10:00:00Z" },
  { id: "dev_011", name: "PH-DEV-2024-011", status: "online", lastHeartbeat: "2024-12-21T10:00:00Z" },
  { id: "dev_012", name: "PH-DEV-2024-012", status: "online", lastHeartbeat: "2024-12-21T10:00:00Z" },
  { id: "dev_013", name: "PH-DEV-2024-013", status: "offline", lastHeartbeat: "2024-12-20T22:00:00Z" },
  { id: "dev_014", name: "PH-DEV-2024-014", status: "online", lastHeartbeat: "2024-12-21T10:00:00Z" },
  { id: "dev_015", name: "PH-DEV-2024-015", status: "online", lastHeartbeat: "2024-12-21T10:00:00Z" },
];

export const mockLanes: MockLane[] = [
  { id: "lane_001", parkingLotId: "lot_001", name: "1号入口", type: "entry", device: mockLaneDevices[0] },
  { id: "lane_002", parkingLotId: "lot_001", name: "2号入口", type: "entry", device: mockLaneDevices[1] },
  { id: "lane_003", parkingLotId: "lot_001", name: "3号入口", type: "entry", device: mockLaneDevices[2] },
  { id: "lane_004", parkingLotId: "lot_001", name: "1号出口", type: "exit", device: mockLaneDevices[3] },
  { id: "lane_005", parkingLotId: "lot_001", name: "2号出口", type: "exit", device: mockLaneDevices[4] },
  { id: "lane_006", parkingLotId: "lot_001", name: "3号出口", type: "exit", device: mockLaneDevices[5] },

  { id: "lane_007", parkingLotId: "lot_002", name: "1号入口", type: "entry", device: mockLaneDevices[6] },
  { id: "lane_008", parkingLotId: "lot_002", name: "2号入口", type: "entry", device: mockLaneDevices[7] },
  { id: "lane_009", parkingLotId: "lot_002", name: "3号入口", type: "entry", device: mockLaneDevices[8] },
  { id: "lane_010", parkingLotId: "lot_002", name: "4号入口", type: "entry", device: mockLaneDevices[9] },
  { id: "lane_011", parkingLotId: "lot_002", name: "1号出口", type: "exit", device: mockLaneDevices[10] },
  { id: "lane_012", parkingLotId: "lot_002", name: "2号出口", type: "exit", device: mockLaneDevices[11] },
  { id: "lane_013", parkingLotId: "lot_002", name: "3号出口", type: "exit", device: mockLaneDevices[12] },
  { id: "lane_014", parkingLotId: "lot_002", name: "4号出口", type: "exit", device: mockLaneDevices[13] },

  { id: "lane_015", parkingLotId: "lot_003", name: "1号入口", type: "entry", device: mockLaneDevices[4] },
  { id: "lane_016", parkingLotId: "lot_003", name: "2号入口", type: "entry", device: mockLaneDevices[5] },
  { id: "lane_017", parkingLotId: "lot_003", name: "1号出口", type: "exit", device: mockLaneDevices[6] },
  { id: "lane_018", parkingLotId: "lot_003", name: "2号出口", type: "exit", device: mockLaneDevices[7] },

  { id: "lane_019", parkingLotId: "lot_004", name: "1号入口", type: "entry", device: mockLaneDevices[8] },
  { id: "lane_020", parkingLotId: "lot_004", name: "1号出口", type: "exit", device: mockLaneDevices[9] },

  { id: "lane_021", parkingLotId: "lot_005", name: "1号入口", type: "entry", device: mockLaneDevices[10] },
  { id: "lane_022", parkingLotId: "lot_005", name: "2号入口", type: "entry", device: mockLaneDevices[11] },
  { id: "lane_023", parkingLotId: "lot_005", name: "1号出口", type: "exit", device: mockLaneDevices[12] },
  { id: "lane_024", parkingLotId: "lot_005", name: "2号出口", type: "exit", device: mockLaneDevices[13] },

  { id: "lane_025", parkingLotId: "lot_006", name: "1号入口", type: "entry", device: mockLaneDevices[0] },
  { id: "lane_026", parkingLotId: "lot_006", name: "2号入口", type: "entry", device: mockLaneDevices[1] },
  { id: "lane_027", parkingLotId: "lot_006", name: "3号入口", type: "entry", device: mockLaneDevices[2] },
  { id: "lane_028", parkingLotId: "lot_006", name: "1号出口", type: "exit", device: mockLaneDevices[3] },
  { id: "lane_029", parkingLotId: "lot_006", name: "2号出口", type: "exit", device: mockLaneDevices[14] },
];

export function getParkingLotById(id: string): BackendParkingLot | undefined {
  return mockParkingLots.find((lot) => lot.id === id);
}

export function getParkingLotStats() {
  const active = mockParkingLots.filter(
    (lot) => lot.status === "PARKING_LOT_STATUS_ACTIVE"
  );
  const totalSpaces = mockParkingLots.reduce((s, l) => s + l.total_spaces, 0);
  const availableSpaces = active.reduce((s, l) => s + l.available_spaces, 0);
  const occupiedVehicles = active.reduce(
    (s, l) => s + (l.total_spaces - l.available_spaces),
    0
  );
  return {
    total_spaces: totalSpaces,
    available_spaces: availableSpaces,
    occupied_vehicles: occupiedVehicles,
    total_gates: mockLanes.length,
  };
}

export function getLaneConfigByParkingLotId(lotId: string) {
  const lanes = mockLanes.filter((lane) => lane.parkingLotId === lotId);
  const boundDeviceIds = new Set(
    lanes.map((lane) => lane.device?.id).filter(Boolean) as string[]
  );
  const availableDevices = mockLaneDevices
    .filter((dev) => !boundDeviceIds.has(dev.id))
    .map((dev) => ({
      id: dev.id,
      name: dev.name,
      status: dev.status,
    }));
  return { lanes, availableDevices };
}
