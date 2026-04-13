import type {
  MonitorKPI,
  MonitorEvent,
  ParkingLotOccupancy,
  LongParkAlert,
  MonitorRealtimeData,
} from "@/types";

const plateNumbers = [
  "沪A·88888", "沪B·66666", "苏E·12345", "沪C·99999",
  "沪D·77777", "沪E·?????", "苏A·55555", "沪F·33333",
  "京A·12345", "浙C·24680",
];

const parkingLots = [
  { id: "lot_001", name: "万科翡翠滨江" },
  { id: "lot_002", name: "万科广场" },
  { id: "lot_003", name: "万科城市花园" },
];

const laneNames = ["1号入口", "2号入口", "1号出口", "2号出口", "3号入口", "3号出口"];

function generateEvents(count: number, baseIndex: number): MonitorEvent[] {
  return Array.from({ length: count }, (_, i) => {
    const lot = parkingLots[i % 3];
    const isEntry = i % 3 === 0;
    const isException = i % 7 === 6;
    const minutesAgo = baseIndex * count + i;
    const time = new Date(Date.now() - minutesAgo * 60 * 1000);

    let type: MonitorEvent["type"] = isEntry ? "entry" : "exit";
    let plate = plateNumbers[(i + baseIndex) % plateNumbers.length];
    let fee: number | null = null;
    let exceptionReason: string | undefined;

    if (isException) {
      type = "exception";
      plate = "沪E·?????";
      exceptionReason = "识别失败";
    } else if (!isEntry) {
      fee = Math.round((Math.random() * 40 + 5) * 100) / 100;
    }

    return {
      id: `mon_evt_${baseIndex}_${i}`,
      plateNumber: plate,
      parkingLotId: lot.id,
      parkingLotName: lot.name,
      laneName: laneNames[i % laneNames.length],
      type,
      fee,
      time: time.toISOString(),
      exceptionReason,
    };
  });
}

export function getMonitorRealtimeData(): MonitorRealtimeData {
  const kpi: MonitorKPI = {
    todayEntries: 4215,
    todayExits: 3892,
    currentVehicles: 2156,
    todayRevenue: 28456,
    entryChangeRate: 12.3,
    exitChangeRate: 8.7,
    revenueChangeRate: 15.2,
    totalSpots: 8640,
    usageRate: 24.9,
  };

  const events = generateEvents(8, 0);

  const occupancies: ParkingLotOccupancy[] = [
    {
      parkingLotId: "lot_001",
      parkingLotName: "万科翡翠滨江",
      totalSpots: 800,
      availableSpots: 156,
      occupiedSpots: 644,
      usageRate: 80.5,
    },
    {
      parkingLotId: "lot_002",
      parkingLotName: "万科广场",
      totalSpots: 1200,
      availableSpots: 89,
      occupiedSpots: 1111,
      usageRate: 92.6,
    },
    {
      parkingLotId: "lot_003",
      parkingLotName: "万科城市花园",
      totalSpots: 450,
      availableSpots: 203,
      occupiedSpots: 247,
      usageRate: 54.9,
    },
  ];

  const longParkAlerts: LongParkAlert[] = [
    {
      id: "alert_001",
      plateNumber: "沪A·12345",
      parkingLotId: "lot_001",
      parkingLotName: "万科翡翠滨江",
      entryTime: "2026-03-10T08:23:00Z",
      duration: "3天 6小时",
      level: "critical",
    },
    {
      id: "alert_002",
      plateNumber: "苏B·67890",
      parkingLotId: "lot_002",
      parkingLotName: "万科广场",
      entryTime: "2026-03-11T15:42:00Z",
      duration: "1天 23小时",
      level: "warning",
    },
    {
      id: "alert_003",
      plateNumber: "沪C·24680",
      parkingLotId: "lot_003",
      parkingLotName: "万科城市花园",
      entryTime: "2026-03-12T09:15:00Z",
      duration: "1天 5小时",
      level: "warning",
    },
  ];

  return { kpi, events, occupancies, longParkAlerts };
}

export function getMonitorEvents(): MonitorEvent[] {
  return generateEvents(10, Math.floor(Date.now() / 60000));
}
