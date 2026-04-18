import type { Device, DeviceStats, DeviceType, DeviceStatus } from "@/types";

const deviceTypes: DeviceType[] = ["integrated", "camera_only", "barrier_only"];
const statuses: DeviceStatus[] = ["pending", "active", "offline", "disabled"];

export function generateDevices(): Device[] {
  const devices: Device[] = [];
  const names = [
    "入口摄像头A", "入口道闸A", "出口摄像头A", "出口道闸A",
    "入口一体机B", "出口一体机B", "地库入口摄像头", "地库入口道闸",
    "顶层出口摄像头", "顶层出口道闸", "备用一体机1", "备用摄像头1",
    "B2入口一体机", "B2出口一体机", "备用道闸1", "测试设备1",
    "仓库设备1", "仓库设备2", "维修设备1", "新增设备1",
  ];

  for (let i = 0; i < 20; i++) {
    const status = statuses[i % 4];
    const isBound = status === "active" || status === "offline";
    devices.push({
      id: `DEV-${String(i + 1).padStart(4, "0")}`,
      tenantId: "tenant-001",
      name: names[i] || `设备${i + 1}`,
      type: deviceTypes[i % 3],
      status,
      firmwareVersion: `v${Math.floor(i / 5) + 1}.${i % 5}.0`,
      lastHeartbeat: status === "pending" || status === "disabled"
        ? null
        : new Date(Date.now() - (status === "offline" ? 3600000 : i * 60000)).toISOString(),
      parkingLotId: isBound ? `lot_${String((i % 3) + 1).padStart(3, "0")}` : null,
      gateId: isBound ? `gate-${String(i % 6) + 1}` : null,
      createdAt: new Date(Date.now() - (20 - i) * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
    });
  }
  return devices;
}

export const mockDevices: Device[] = generateDevices();

export function getDeviceById(id: string): Device | undefined {
  return mockDevices.find((d) => d.id === id);
}

export function getDeviceStats(): DeviceStats {
  return {
    total: mockDevices.length,
    active: mockDevices.filter((d) => d.status === "active").length,
    offline: mockDevices.filter((d) => d.status === "offline").length,
    pending: mockDevices.filter((d) => d.status === "pending").length,
    disabled: mockDevices.filter((d) => d.status === "disabled").length,
  };
}
