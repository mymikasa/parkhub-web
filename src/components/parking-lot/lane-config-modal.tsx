"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/shared/modal";
import { parkingLotService } from "@/lib/api/parking-lots";
import { cn } from "@/lib/utils";
import type { ParkingLot, Lane, DeviceOption } from "@/types";

interface LaneConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parkingLot: ParkingLot | null;
}

interface LaneEditItem {
  id?: string;
  name: string;
  type: "entry" | "exit";
  deviceId?: string;
  device?: {
    id: string;
    name: string;
    status: string;
    lastHeartbeat?: string;
  };
}

export function LaneConfigModal({
  open,
  onClose,
  onSuccess,
  parkingLot,
}: LaneConfigModalProps) {
  const [lanes, setLanes] = useState<LaneEditItem[]>([]);
  const [availableDevices, setAvailableDevices] = useState<DeviceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDeviceId, setEditDeviceId] = useState("");

  const loadData = useCallback(async () => {
    if (!parkingLot) return;
    setLoading(true);
    setError("");
    try {
      const config = await parkingLotService.getLaneConfig(parkingLot.id);
      setLanes(
        config.lanes.map((lane: Lane) => ({
          id: lane.id,
          name: lane.name,
          type: lane.type,
          deviceId: lane.device?.id,
          device: lane.device
            ? {
                id: lane.device.id,
                name: lane.device.name,
                status: lane.device.status,
                lastHeartbeat: lane.device.lastHeartbeat,
              }
            : undefined,
        }))
      );
      setAvailableDevices(config.availableDevices);
    } catch {
      setError("加载车道配置失败");
    } finally {
      setLoading(false);
    }
  }, [parkingLot]);

  useEffect(() => {
    if (open) {
      loadData();
      setEditingIndex(null);
    }
  }, [open, loadData]);

  const handleAddLane = () => {
    const entryCount = lanes.filter((l) => l.type === "entry").length;
    const exitCount = lanes.filter((l) => l.type === "exit").length;
    const newLane: LaneEditItem = {
      name: `${entryCount + exitCount + 1}号入口`,
      type: "entry",
    };
    setLanes([...lanes, newLane]);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditName(lanes[index].name);
    setEditDeviceId(lanes[index].deviceId || "");
  };

  const handleSaveEdit = (index: number) => {
    const updated = [...lanes];
    updated[index] = {
      ...updated[index],
      name: editName,
      deviceId: editDeviceId || undefined,
    };
    setLanes(updated);
    setEditingIndex(null);
  };

  const handleRemoveLane = (index: number) => {
    setLanes(lanes.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleSave = async () => {
    if (!parkingLot) return;
    setSaving(true);
    setError("");
    try {
      await parkingLotService.updateLanes(parkingLot.id, {
        lanes: lanes.map((lane) => ({
          id: lane.id,
          name: lane.name,
          type: lane.type,
          deviceId: lane.deviceId,
        })),
      });
      onSuccess();
      onClose();
    } catch {
      setError("保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="出入口配置"
      subtitle={parkingLot?.name}
      maxWidth="max-w-2xl"
      footer={
        <>
          {error && (
            <span className="text-red-500 text-sm mr-auto">{error}</span>
          )}
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            完成
          </button>
        </>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <svg className="w-6 h-6 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              出入口列表
            </span>
            <button
              onClick={handleAddLane}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加出入口
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {lanes.map((lane, index) => {
              const isOffline =
                lane.device?.status === "offline";
              const isEditing = editingIndex === index;

              return (
                <div
                  key={lane.id || `new-${index}`}
                  className={cn(
                    "flex items-center justify-between p-4 bg-gray-50 rounded-xl",
                    isOffline && "border border-red-200"
                  )}
                >
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          lane.type === "entry"
                            ? "bg-emerald-100"
                            : "bg-blue-100"
                        )}
                      >
                        {lane.type === "entry" ? (
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full h-8 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500"
                        />
                        <select
                          value={editDeviceId}
                          onChange={(e) => setEditDeviceId(e.target.value)}
                          className="w-full h-8 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 bg-white"
                        >
                          <option value="">不绑定设备</option>
                          {availableDevices.map((dev) => (
                            <option key={dev.id} value={dev.id}>
                              {dev.name}
                              {dev.status === "offline" ? " (离线)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => handleSaveEdit(index)}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            lane.type === "entry"
                              ? "bg-emerald-100"
                              : "bg-blue-100"
                          )}
                        >
                          {lane.type === "entry" ? (
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {lane.name}
                          </div>
                          <div
                            className={cn(
                              "text-xs mt-0.5",
                              isOffline ? "text-red-500" : "text-gray-500"
                            )}
                          >
                            {lane.device
                              ? `绑定设备: ${lane.device.name}`
                              : "未绑定设备"}
                            {isOffline && lane.device?.lastHeartbeat
                              ? ` · 最后心跳: ${lane.device.lastHeartbeat}`
                              : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {lane.device && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                              isOffline
                                ? "bg-red-50 text-red-600"
                                : "bg-emerald-50 text-emerald-600"
                            )}
                          >
                            <span
                              className={cn(
                                "w-1 h-1 rounded-full",
                                isOffline ? "bg-red-500" : "bg-emerald-500"
                              )}
                            />
                            {isOffline ? "离线" : "在线"}
                          </span>
                        )}
                        <button
                          onClick={() => handleStartEdit(index)}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          编辑
                        </button>
                        {!lane.id && (
                          <button
                            onClick={() => handleRemoveLane(index)}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {lanes.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无出入口配置
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
