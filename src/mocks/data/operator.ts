import type { OperatorEvent, OperatorException, VehicleSearchResult } from "@/types";

const parkingLots = [
  { id: "lot_001", name: "万科翡翠滨江" },
  { id: "lot_002", name: "万科广场" },
  { id: "lot_003", name: "万科城市花园" },
];

const laneNames = ["1号入口", "2号入口", "3号入口", "1号出口", "2号出口", "3号出口"];

export function getOperatorEvents(): OperatorEvent[] {
  const plateNumbers = [
    "沪A·88888", "沪B·66666", "沪E·?????", "苏E·12345",
    "沪C·99999", "沪D·77777", "苏A·55555",
  ];

  const types: Array<{
    type: OperatorEvent["type"];
    icon: string;
    getMessage: (plate: string, lot: string, lane: string, fee?: number) => string;
  }> = [
    {
      type: "entry",
      icon: "entry",
      getMessage: (plate, lot, lane) => `${plate} 入场 · ${lot} · ${lane}`,
    },
    {
      type: "exit",
      icon: "exit",
      getMessage: (plate, lot, lane, fee) => `${plate} 出场 · ${lot} · ${lane} · ¥${(fee ?? 0).toFixed(2)}`,
    },
    {
      type: "exception",
      icon: "exception",
      getMessage: (plate, lot, lane) => `${plate} 识别失败 · ${lot} · ${lane}`,
    },
    {
      type: "device_offline",
      icon: "device_offline",
      getMessage: (_, lot, lane) => `设备离线告警 · ${lot} · ${lane}`,
    },
  ];

  return Array.from({ length: 8 }, (_, i) => {
    const lot = parkingLots[i % 3];
    const lane = laneNames[i % laneNames.length];
    const plate = plateNumbers[i % plateNumbers.length];
    const typeInfo = types[i % types.length];
    const minutesAgo = (i + 1) * (i < 2 ? 1 : (i - 1) * 3 + 2);
    const time = new Date(Date.now() - minutesAgo * 60 * 1000);

    const fee = typeInfo.type === "exit" ? Math.round((Math.random() * 30 + 5) * 100) / 100 : undefined;

    return {
      id: `op_evt_${i}`,
      type: typeInfo.type,
      plateNumber: typeInfo.type !== "device_offline" ? plate : undefined,
      parkingLotId: lot.id,
      parkingLotName: lot.name,
      laneName: lane,
      fee,
      time: time.toISOString(),
      message: typeInfo.getMessage(plate, lot.name, lane, fee),
      deviceSerialNumber: typeInfo.type === "device_offline" ? "PH-DEV-2024-008" : undefined,
    };
  });
}

export function getOperatorExceptions(): OperatorException[] {
  return [
    {
      id: "exc_001",
      plateNumber: "沪A·12345",
      parkingLotId: "lot_001",
      parkingLotName: "万科翡翠滨江",
      laneName: "1号入口",
      type: "entry_no_exit",
      entryTime: "2026-03-10T08:23:00Z",
      overtime: "3天6小时",
      time: "2026-03-10T08:23:00Z",
    },
    {
      id: "exc_002",
      plateNumber: "沪E·?????",
      parkingLotId: "lot_001",
      parkingLotName: "万科翡翠滨江",
      laneName: "2号入口",
      type: "recognition_failed",
      time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: "exc_003",
      plateNumber: "沪F·33333",
      parkingLotId: "lot_002",
      parkingLotName: "万科广场",
      laneName: "3号出口",
      type: "exit_no_entry",
      time: new Date(Date.now() - 47 * 60 * 1000).toISOString(),
    },
    {
      id: "exc_004",
      plateNumber: "苏B·67890",
      parkingLotId: "lot_002",
      parkingLotName: "万科广场",
      laneName: "1号入口",
      type: "entry_no_exit",
      entryTime: "2026-03-11T15:42:00Z",
      overtime: "1天23小时",
      time: "2026-03-11T15:42:00Z",
    },
    {
      id: "exc_005",
      plateNumber: "苏C·?????",
      parkingLotId: "lot_003",
      parkingLotName: "万科城市花园",
      laneName: "1号入口",
      type: "recognition_failed",
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export const mockVehicleResult: VehicleSearchResult = {
  plateNumber: "沪A·88888",
  parkingLotId: "lot_001",
  parkingLotName: "万科翡翠滨江",
  laneName: "1号入口",
  entryTime: new Date(Date.now() - 135 * 60 * 1000).toISOString(),
  duration: "2小时 15分钟",
  estimatedFee: 16.0,
  vehicleType: "temporary",
};
