import type { Device, DeviceSummary, DeviceType, LaneType, DeviceOnlineStatus } from "@/types";
import { mockLaneDevices, mockLanes, mockParkingLots } from "./parking-lots";

const deviceTypes: DeviceType[] = ["integrated", "camera_only", "barrier_only"];

// Build full Device objects by joining lane devices with lanes and parking lots
export const mockDevices: Device[] = mockLaneDevices.map((dev, i) => {
  // Find a lane that uses this device
  const lane = mockLanes.find((l) => l.device?.id === dev.id);
  const lot = lane ? mockParkingLots.find((p) => p.id === lane.parkingLotId) : undefined;

  return {
    id: dev.id,
    serialNumber: dev.name,
    name: dev.name,
    type: deviceTypes[i % 3],
    status: dev.status as DeviceOnlineStatus,
    parkingLotId: lot?.id ?? "lot_001",
    parkingLotName: lot?.name ?? "万科翡翠滨江地下停车场",
    laneName: lane?.name ?? "1号入口",
    laneType: (lane?.type ?? "entry") as LaneType,
    lastHeartbeat: dev.lastHeartbeat ?? null,
    todayTraffic: dev.status === "online" ? Math.floor(Math.random() * 200) + 20 : 0,
  };
});

export function getDeviceById(id: string): Device | undefined {
  return mockDevices.find((d) => d.id === id);
}

export function getDeviceSummary(): DeviceSummary {
  const total = mockDevices.length;
  const online = mockDevices.filter((d) => d.status === "online").length;
  const offline = total - online;
  const todayTraffic = mockDevices.reduce((sum, d) => sum + (d.todayTraffic ?? 0), 0);
  return {
    total,
    online,
    offline,
    todayTraffic,
    onlineRate: total > 0 ? Math.round((online / total) * 1000) / 10 : 0,
  };
}
