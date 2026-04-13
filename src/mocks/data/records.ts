import type { EntryExitRecord, RecordSummary, RecordStatus } from "@/types";

const plateNumbers = [
  "沪A12345", "沪B67890", "沪C24680", "沪D13579", "沪E86420",
  "沪F11223", "沪G44556", "沪H77889", "沪A99001", "沪B55667",
  "京A88234", "浙C33445", "苏E22110", "粤B99876", "川A55432",
];

const parkingLots = [
  { id: "lot_001", name: "万科翡翠滨江地下停车场" },
  { id: "lot_002", name: "万科广场商业停车场" },
  { id: "lot_003", name: "万科城市花园停车场" },
];

const laneNames = ["1号入口", "2号入口", "3号入口", "1号出口", "2号出口", "3号出口"];

function randomDate(daysAgo: number): string {
  const now = new Date("2024-12-21T12:00:00Z");
  const offset = Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString();
}

export const mockRecords: EntryExitRecord[] = [
  // Normal entry records
  ...Array.from({ length: 10 }, (_, i) => {
    const lot = parkingLots[i % 3];
    return {
      id: `rec_${String(i + 1).padStart(3, "0")}`,
      plateNumber: plateNumbers[i % plateNumbers.length],
      parkingLotId: lot.id,
      parkingLotName: lot.name,
      laneName: laneNames[i % 3],
      type: "entry" as const,
      status: "normal" as const,
      fee: null,
      time: randomDate(3),
      imageUrl: `/mock/capture_${i + 1}.jpg`,
      deviceSerialNumber: `PH-DEV-2024-${String((i % 15) + 1).padStart(3, "0")}`,
    };
  }),
  // Normal exit records with fees (paid)
  ...Array.from({ length: 10 }, (_, i) => {
    const lot = parkingLots[i % 3];
    return {
      id: `rec_${String(i + 11).padStart(3, "0")}`,
      plateNumber: plateNumbers[(i + 5) % plateNumbers.length],
      parkingLotId: lot.id,
      parkingLotName: lot.name,
      laneName: laneNames[(i % 3) + 3],
      type: "exit" as const,
      status: "paid" as const,
      fee: Math.round((Math.random() * 50 + 5) * 100) / 100,
      time: randomDate(3),
      imageUrl: `/mock/capture_${i + 11}.jpg`,
      deviceSerialNumber: `PH-DEV-2024-${String((i % 15) + 1).padStart(3, "0")}`,
    };
  }),
  // Normal exit records
  ...Array.from({ length: 5 }, (_, i) => {
    const lot = parkingLots[i % 3];
    return {
      id: `rec_${String(i + 21).padStart(3, "0")}`,
      plateNumber: plateNumbers[(i + 10) % plateNumbers.length],
      parkingLotId: lot.id,
      parkingLotName: lot.name,
      laneName: laneNames[(i % 3) + 3],
      type: "exit" as const,
      status: "normal" as const,
      fee: Math.round((Math.random() * 30 + 3) * 100) / 100,
      time: randomDate(2),
      imageUrl: `/mock/capture_${i + 21}.jpg`,
      deviceSerialNumber: `PH-DEV-2024-${String((i % 15) + 1).padStart(3, "0")}`,
    };
  }),
  // Exception: entry_no_exit (3 records)
  {
    id: "rec_026",
    plateNumber: "沪A12345",
    parkingLotId: "lot_001",
    parkingLotName: "万科翡翠滨江地下停车场",
    laneName: "1号入口",
    type: "entry",
    status: "entry_no_exit",
    fee: null,
    time: "2024-12-19T08:30:00Z",
    imageUrl: "/mock/capture_26.jpg",
    deviceSerialNumber: "PH-DEV-2024-001",
  },
  {
    id: "rec_027",
    plateNumber: "沪C24680",
    parkingLotId: "lot_002",
    parkingLotName: "万科广场商业停车场",
    laneName: "2号入口",
    type: "entry",
    status: "entry_no_exit",
    fee: null,
    time: "2024-12-19T14:20:00Z",
    imageUrl: "/mock/capture_27.jpg",
    deviceSerialNumber: "PH-DEV-2024-008",
  },
  {
    id: "rec_028",
    plateNumber: "沪F11223",
    parkingLotId: "lot_003",
    parkingLotName: "万科城市花园停车场",
    laneName: "1号入口",
    type: "entry",
    status: "entry_no_exit",
    fee: null,
    time: "2024-12-20T09:15:00Z",
    imageUrl: "/mock/capture_28.jpg",
    deviceSerialNumber: "PH-DEV-2024-005",
  },
  // Exception: exit_no_entry (1 record)
  {
    id: "rec_029",
    plateNumber: "京A88234",
    parkingLotId: "lot_001",
    parkingLotName: "万科翡翠滨江地下停车场",
    laneName: "2号出口",
    type: "exit",
    status: "exit_no_entry",
    fee: null,
    time: "2024-12-20T16:45:00Z",
    imageUrl: "/mock/capture_29.jpg",
    deviceSerialNumber: "PH-DEV-2024-005",
  },
  // Exception: recognition_failed (1 record)
  {
    id: "rec_030",
    plateNumber: "???",
    parkingLotId: "lot_002",
    parkingLotName: "万科广场商业停车场",
    laneName: "3号入口",
    type: "entry",
    status: "recognition_failed",
    fee: null,
    time: "2024-12-21T07:00:00Z",
    imageUrl: "/mock/capture_30.jpg",
    deviceSerialNumber: "PH-DEV-2024-009",
  },
];

export function getRecordById(id: string): EntryExitRecord | undefined {
  return mockRecords.find((r) => r.id === id);
}

const exceptionStatuses: RecordStatus[] = ["entry_no_exit", "exit_no_entry", "recognition_failed"];

export function getRecordSummary(): RecordSummary {
  const exceptions = mockRecords.filter((r) => exceptionStatuses.includes(r.status));
  return {
    totalExceptions: exceptions.length,
    entryNoExit: exceptions.filter((r) => r.status === "entry_no_exit").length,
    exitNoEntry: exceptions.filter((r) => r.status === "exit_no_entry").length,
    recognitionFailed: exceptions.filter((r) => r.status === "recognition_failed").length,
  };
}
