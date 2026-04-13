"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { OfflineAlert } from "@/components/device-management/offline-alert";
import { RegisterDeviceModal } from "@/components/device-management/register-device-modal";
import { RemoteControlModal } from "@/components/device-management/remote-control-modal";
import { getDeviceColumns } from "@/components/device-management/device-columns";
import { deviceService } from "@/lib/api/devices";
import { parkingLotService } from "@/lib/api/parking-lots";
import { cn } from "@/lib/utils";
import type { Device, DeviceSummary, DeviceFilters, DeviceOnlineStatus, DeviceType, ParkingLot } from "@/types";

type StatusTab = "all" | "online" | "offline";

export default function DeviceManagementPage() {
  const [filters, setFilters] = useState<DeviceFilters>({ page: 1, pageSize: 10 });
  const [devices, setDevices] = useState<Device[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<DeviceSummary | null>(null);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");

  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [controlOpen, setControlOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const fetchDevices = useCallback(async (f: DeviceFilters) => {
    setLoading(true);
    try {
      const res = await deviceService.list(f);
      setDevices(res.data);
      setTotal(res.total);
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await deviceService.getSummary();
      setSummary(res);
    } catch {
      // error handled silently
    }
  }, []);

  useEffect(() => {
    parkingLotService.list({ pageSize: 100 }).then((res) => setParkingLots(res.data));
  }, []);

  useEffect(() => {
    fetchDevices(filters);
  }, [filters, fetchDevices]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    const status: DeviceOnlineStatus | undefined = tab === "all" ? undefined : tab;
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handleParkingLotChange = (lotId: string) => {
    setFilters((prev) => ({ ...prev, parkingLotId: lotId || undefined, page: 1 }));
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    setFilters((prev) => ({ ...prev, keyword: value || undefined, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRegister = async (data: { serialNumber: string; parkingLotId: string; laneId: string; type: DeviceType }) => {
    setRegisterLoading(true);
    try {
      await deviceService.register(data);
      setRegisterOpen(false);
      fetchDevices(filters);
      fetchSummary();
    } catch {
      // error handled silently
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRemoteControl = (device: Device) => {
    setSelectedDevice(device);
    setControlOpen(true);
  };

  const handleCommand = async (action: "up" | "down") => {
    if (!selectedDevice) return;
    await deviceService.sendCommand(selectedDevice.id, { action });
  };

  const columns = useMemo(
    () => getDeviceColumns({ onRemoteControl: handleRemoteControl }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const tabs: { key: StatusTab; label: string }[] = [
    { key: "all", label: `全部 (${summary?.total ?? 0})` },
    { key: "online", label: `在线 (${summary?.online ?? 0})` },
    { key: "offline", label: `离线 (${summary?.offline ?? 0})` },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="设备管理"
        actions={
          <div className="flex items-center gap-3">
            <SearchInput
              placeholder="搜索设备..."
              value={keyword}
              onChange={handleSearch}
            />
            <button
              onClick={() => setRegisterOpen(true)}
              className="h-10 px-4 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              注册设备
            </button>
          </div>
        }
      />

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="设备总数"
            value={summary.total}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            }
          />
          <StatCard
            label="在线设备"
            value={summary.online}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            }
            iconBgClass="bg-emerald-50"
            iconTextClass="text-emerald-600"
            valueColorClass="text-emerald-600"
          />
          <StatCard
            label="离线设备"
            value={summary.offline}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBgClass="bg-red-50"
            iconTextClass="text-red-600"
            valueColorClass="text-red-600"
          />
          <StatCard
            label="今日通行"
            value={summary.todayTraffic}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            iconBgClass="bg-blue-50"
            iconTextClass="text-blue-600"
          />
        </div>
      )}

      {summary && summary.offline > 0 && (
        <OfflineAlert offlineCount={summary.offline} />
      )}

      <div className="bg-white rounded-xl border border-surface-border">
        <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  activeTab === tab.key
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <select
            value={filters.parkingLotId ?? ""}
            onChange={(e) => handleParkingLotChange(e.target.value)}
            className="h-9 px-3 pr-8 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          >
            <option value="">全部车场</option>
            {parkingLots.map((lot) => (
              <option key={lot.id} value={lot.id}>{lot.name}</option>
            ))}
          </select>
        </div>

        {loading && devices.length === 0 ? (
          <LoadingSkeleton variant="table" count={5} />
        ) : (
          <DataTable
            columns={columns}
            data={devices}
            loading={loading}
            pagination={{
              page: filters.page ?? 1,
              pageSize: filters.pageSize ?? 10,
              total,
              onPageChange: handlePageChange,
            }}
            emptyMessage="暂无设备"
            className="border-0 rounded-none"
          />
        )}
      </div>

      <RegisterDeviceModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSubmit={handleRegister}
        loading={registerLoading}
      />

      <RemoteControlModal
        open={controlOpen}
        onClose={() => {
          setControlOpen(false);
          setSelectedDevice(null);
        }}
        device={selectedDevice}
        onCommand={handleCommand}
      />
    </div>
  );
}
