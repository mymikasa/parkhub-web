import type {
  ParkingLot,
  ParkingLotSummary,
  Lane,
  LaneDevice,
  DeviceOption,
  LaneConfigResponse,
} from "@/types";

export const mockParkingLots: ParkingLot[] = [
  {
    id: "lot_001",
    name: "万科翡翠滨江地下停车场",
    address: "上海市浦东新区陆家嘴环路1000号",
    type: "underground",
    status: "operating",
    totalSpots: 800,
    availableSpots: 156,
    occupiedSpots: 644,
    usageRate: 80.5,
    entryCount: 3,
    exitCount: 3,
    laneCount: 6,
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-12-20T14:30:00Z",
  },
  {
    id: "lot_002",
    name: "万科广场商业停车场",
    address: "上海市闵行区七莘路3655号",
    type: "ground",
    status: "operating",
    totalSpots: 1200,
    availableSpots: 89,
    occupiedSpots: 1111,
    usageRate: 92.6,
    entryCount: 4,
    exitCount: 4,
    laneCount: 8,
    createdAt: "2024-02-20T10:00:00Z",
    updatedAt: "2024-12-19T16:45:00Z",
  },
  {
    id: "lot_003",
    name: "万科城市花园停车场",
    address: "上海市宝山区共康路555号",
    type: "ground",
    status: "operating",
    totalSpots: 450,
    availableSpots: 203,
    occupiedSpots: 247,
    usageRate: 54.9,
    entryCount: 2,
    exitCount: 2,
    laneCount: 4,
    createdAt: "2024-03-10T09:00:00Z",
    updatedAt: "2024-12-18T11:20:00Z",
  },
  {
    id: "lot_004",
    name: "万科翡翠别墅区停车场",
    address: "上海市松江区泗泾镇古楼路888号",
    type: "underground",
    status: "suspended",
    totalSpots: 320,
    availableSpots: 320,
    occupiedSpots: 0,
    usageRate: 0,
    entryCount: 1,
    exitCount: 1,
    laneCount: 2,
    createdAt: "2024-04-05T08:00:00Z",
    updatedAt: "2024-12-15T09:00:00Z",
  },
  {
    id: "lot_005",
    name: "万科星城立体车库",
    address: "上海市嘉定区南翔镇银翔路66号",
    type: "mechanical",
    status: "operating",
    totalSpots: 500,
    availableSpots: 210,
    occupiedSpots: 290,
    usageRate: 58.0,
    entryCount: 2,
    exitCount: 2,
    laneCount: 4,
    createdAt: "2024-05-20T10:00:00Z",
    updatedAt: "2024-12-21T08:15:00Z",
  },
  {
    id: "lot_006",
    name: "万科金域华府停车场",
    address: "上海市青浦区盈港东路168号",
    type: "underground",
    status: "operating",
    totalSpots: 680,
    availableSpots: 102,
    occupiedSpots: 578,
    usageRate: 85.0,
    entryCount: 3,
    exitCount: 2,
    laneCount: 5,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-12-20T17:00:00Z",
  },
];

export const mockLaneDevices: LaneDevice[] = [
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

export const mockLanes: Lane[] = [
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

export function getParkingLotById(id: string): ParkingLot | undefined {
  return mockParkingLots.find((lot) => lot.id === id);
}

export function getParkingLotSummary(): ParkingLotSummary {
  const active = mockParkingLots.filter((lot) => lot.status === "operating");
  return {
    totalSpots: mockParkingLots.reduce((sum, lot) => sum + lot.totalSpots, 0),
    availableSpots: active.reduce((sum, lot) => sum + lot.availableSpots, 0),
    occupiedSpots: active.reduce((sum, lot) => sum + lot.occupiedSpots, 0),
    laneCount: mockLanes.length,
  };
}

export function getLaneConfigByParkingLotId(lotId: string): LaneConfigResponse {
  const lanes = mockLanes.filter((lane) => lane.parkingLotId === lotId);
  const boundDeviceIds = new Set(
    lanes.map((lane) => lane.device?.id).filter(Boolean) as string[]
  );
  const availableDevices: DeviceOption[] = mockLaneDevices
    .filter((dev) => !boundDeviceIds.has(dev.id))
    .map((dev) => ({
      id: dev.id,
      name: dev.name,
      status: dev.status,
    }));
  return { lanes, availableDevices };
}
