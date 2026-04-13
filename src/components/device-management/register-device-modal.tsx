"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/shared/modal";
import { parkingLotService } from "@/lib/api/parking-lots";
import type { ParkingLot, Lane, DeviceType } from "@/types";

interface RegisterDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    serialNumber: string;
    parkingLotId: string;
    laneId: string;
    type: DeviceType;
  }) => void;
  loading?: boolean;
}

const deviceTypeOptions: { value: DeviceType; label: string }[] = [
  { value: "integrated", label: "一体机" },
  { value: "camera_only", label: "仅摄像头" },
  { value: "barrier_only", label: "仅道闸" },
];

export function RegisterDeviceModal({ open, onClose, onSubmit, loading = false }: RegisterDeviceModalProps) {
  const [serialNumber, setSerialNumber] = useState("");
  const [parkingLotId, setParkingLotId] = useState("");
  const [laneId, setLaneId] = useState("");
  const [deviceType, setDeviceType] = useState<DeviceType>("integrated");
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [lanes, setLanes] = useState<Lane[]>([]);

  useEffect(() => {
    if (open) {
      parkingLotService.list({ pageSize: 100 }).then((res) => setParkingLots(res.data));
    }
  }, [open]);

  useEffect(() => {
    if (parkingLotId) {
      parkingLotService.getLaneConfig(parkingLotId).then((res) => {
        setLanes(res.lanes);
        setLaneId("");
      });
    } else {
      setLanes([]);
      setLaneId("");
    }
  }, [parkingLotId]);

  const handleSubmit = () => {
    if (!serialNumber.trim() || !parkingLotId || !laneId) return;
    onSubmit({ serialNumber: serialNumber.trim(), parkingLotId, laneId, type: deviceType });
  };

  const handleClose = () => {
    setSerialNumber("");
    setParkingLotId("");
    setLaneId("");
    setDeviceType("integrated");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="注册新设备"
      footer={
        <>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!serialNumber.trim() || !parkingLotId || !laneId || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "注册中..." : "确认注册"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            设备序列号 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="请输入设备序列号"
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            停车场 <span className="text-red-500">*</span>
          </label>
          <select
            value={parkingLotId}
            onChange={(e) => setParkingLotId(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          >
            <option value="">请选择停车场</option>
            {parkingLots.map((lot) => (
              <option key={lot.id} value={lot.id}>{lot.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            出入口 <span className="text-red-500">*</span>
          </label>
          <select
            value={laneId}
            onChange={(e) => setLaneId(e.target.value)}
            disabled={!parkingLotId}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">请选择出入口</option>
            {lanes.map((lane) => (
              <option key={lane.id} value={lane.id}>
                {lane.name} ({lane.type === "entry" ? "入口" : "出口"})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            设备类型 <span className="text-red-500">*</span>
          </label>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value as DeviceType)}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          >
            {deviceTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
