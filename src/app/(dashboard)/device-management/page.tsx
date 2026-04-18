"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { type RowSelectionState } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { DeviceAlert } from "@/components/device-management/offline-alert";
import { CreateDeviceModal } from "@/components/device-management/create-device-modal";
import { UpdateDeviceNameModal } from "@/components/device-management/update-device-name-modal";
import { BindDeviceModal } from "@/components/device-management/bind-device-modal";
import { DeleteConfirmModal } from "@/components/device-management/delete-confirm-modal";
import { RemoteControlModal } from "@/components/device-management/remote-control-modal";
import { BatchActionBar } from "@/components/device-management/batch-action-bar";
import { getDeviceColumns } from "@/components/device-management/device-columns";
import { deviceService } from "@/lib/api/devices";
import { parkingLotService } from "@/lib/api/parking-lots";
import { cn } from "@/lib/utils";
import type { Device, DeviceStats, DeviceFilters, DeviceStatus, ParkingLot } from "@/types";

type StatusTab = "all" | "pending" | "active" | "offline" | "disabled";

const statusTabMap: Record<StatusTab, DeviceStatus | undefined> = {
  all: undefined,
  pending: "pending",
  active: "active",
  offline: "offline",
  disabled: "disabled",
};

export default function DeviceManagementPage() {
  const [filters, setFilters] = useState<DeviceFilters>({ page: 1, pageSize: 10 });
  const [devices, setDevices] = useState<Device[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [bindDevice, setBindDevice] = useState<Device | null>(null);
  const [bindLoading, setBindLoading] = useState(false);
  const [deleteDevice, setDeleteDevice] = useState<Device | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [controlOpen, setControlOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchBindOpen, setBatchBindOpen] = useState(false);

  const fetchDevices = useCallback(async (f: DeviceFilters) => {
    setLoading(true);
    try {
      const res = await deviceService.list(f);
      setDevices(res.data);
      setTotal(res.total);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await deviceService.getStats();
      setStats(res);
    } catch {
    }
  }, []);

  useEffect(() => {
    parkingLotService.list({ pageSize: 100 }).then((res) => setParkingLots(res.data));
  }, []);

  useEffect(() => {
    fetchDevices(filters);
  }, [filters, fetchDevices]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setRowSelection({});
  }, [filters]);

  const refresh = useCallback(() => {
    fetchDevices(filters);
    fetchStats();
  }, [filters, fetchDevices, fetchStats]);

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    setFilters((prev) => ({ ...prev, status: statusTabMap[tab], page: 1 }));
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

  const handleCreate = async (data: { id: string; name?: string; type: string; firmwareVersion?: string }) => {
    setCreateLoading(true);
    try {
      await deviceService.create(data as any);
      setCreateOpen(false);
      refresh();
    } catch {
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateName = async (name: string) => {
    if (!editDevice) return;
    setEditLoading(true);
    try {
      await deviceService.updateName(editDevice.id, { name });
      setEditDevice(null);
      refresh();
    } catch {
    } finally {
      setEditLoading(false);
    }
  };

  const handleBind = async (data: { parkingLotId: string; gateId: string }) => {
    if (!bindDevice) return;
    setBindLoading(true);
    try {
      await deviceService.bind(bindDevice.id, data);
      setBindDevice(null);
      refresh();
    } catch {
    } finally {
      setBindLoading(false);
    }
  };

  const handleUnbind = async (device: Device) => {
    try {
      await deviceService.unbind(device.id);
      refresh();
    } catch {
    }
  };

  const handleDisable = async (device: Device) => {
    try {
      await deviceService.disable(device.id);
      refresh();
    } catch {
    }
  };

  const handleEnable = async (device: Device) => {
    try {
      await deviceService.enable(device.id);
      refresh();
    } catch {
    }
  };

  const handleDelete = async () => {
    if (!deleteDevice) return;
    setDeleteLoading(true);
    try {
      await deviceService.delete(deleteDevice.id);
      setDeleteDevice(null);
      refresh();
    } catch {
    } finally {
      setDeleteLoading(false);
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

  const selectedDevices = useMemo(() => {
    const ids = Object.keys(rowSelection).filter((k) => rowSelection[k]);
    return devices.filter((d) => ids.includes(d.id));
  }, [rowSelection, devices]);

  const clearSelection = useCallback(() => setRowSelection({}), []);

  const handleBatchDisable = async (ids: string[]) => {
    setBatchLoading(true);
    try {
      await deviceService.batchDisable({ ids });
      clearSelection();
      refresh();
    } catch {
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchEnable = async (ids: string[]) => {
    setBatchLoading(true);
    try {
      await deviceService.batchEnable({ ids });
      clearSelection();
      refresh();
    } catch {
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchDelete = async (ids: string[]) => {
    setBatchLoading(true);
    try {
      await deviceService.batchDelete({ ids });
      clearSelection();
      refresh();
    } catch {
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchBindSubmit = async (data: { parkingLotId: string; gateId: string }) => {
    const pendingSelected = selectedDevices.filter((d) => d.status === "pending");
    if (pendingSelected.length === 0) return;
    setBatchLoading(true);
    try {
      await deviceService.batchBind({
        bindings: pendingSelected.map((d) => ({
          id: d.id,
          parkingLotId: data.parkingLotId,
          gateId: data.gateId,
        })),
      });
      setBatchBindOpen(false);
      clearSelection();
      refresh();
    } catch {
    } finally {
      setBatchLoading(false);
    }
  };

  const columns = useMemo(
    () =>
      getDeviceColumns({
        onEdit: (d) => setEditDevice(d),
        onBind: (d) => setBindDevice(d),
        onUnbind: handleUnbind,
        onDisable: handleDisable,
        onEnable: handleEnable,
        onDelete: (d) => setDeleteDevice(d),
        onRemoteControl: handleRemoteControl,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const tabs: { key: StatusTab; label: string }[] = [
    { key: "all", label: `全部 (${stats?.total ?? 0})` },
    { key: "pending", label: `待激活 (${stats?.pending ?? 0})` },
    { key: "active", label: `在线 (${stats?.active ?? 0})` },
    { key: "offline", label: `离线 (${stats?.offline ?? 0})` },
    { key: "disabled", label: `已停用 (${stats?.disabled ?? 0})` },
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
              onClick={() => setCreateOpen(true)}
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

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="设备总数"
            value={stats.total}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>}
          />
          <StatCard
            label="待激活"
            value={stats.pending}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            iconBgClass="bg-gray-50"
            iconTextClass="text-gray-600"
            valueColorClass="text-gray-600"
          />
          <StatCard
            label="在线"
            value={stats.active}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>}
            iconBgClass="bg-emerald-50"
            iconTextClass="text-emerald-600"
            valueColorClass="text-emerald-600"
          />
          <StatCard
            label="离线"
            value={stats.offline}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            iconBgClass="bg-red-50"
            iconTextClass="text-red-600"
            valueColorClass="text-red-600"
          />
          <StatCard
            label="已停用"
            value={stats.disabled}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
            iconBgClass="bg-orange-50"
            iconTextClass="text-orange-600"
            valueColorClass="text-orange-600"
          />
        </div>
      )}

      {stats && (stats.offline > 0 || stats.disabled > 0) && (
        <DeviceAlert offlineCount={stats.offline} disabledCount={stats.disabled} />
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
                    : "text-gray-600 hover:bg-gray-100",
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
            enableRowSelection
            getRowId={(d: Device) => d.id}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
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

      <CreateDeviceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        loading={createLoading}
      />

      {editDevice && (
        <UpdateDeviceNameModal
          open={!!editDevice}
          onClose={() => setEditDevice(null)}
          onSubmit={handleUpdateName}
          deviceName={editDevice.name}
          loading={editLoading}
        />
      )}

      {bindDevice && (
        <BindDeviceModal
          open={!!bindDevice}
          onClose={() => setBindDevice(null)}
          onSubmit={handleBind}
          parkingLots={parkingLots}
          loading={bindLoading}
        />
      )}

      {deleteDevice && (
        <DeleteConfirmModal
          open={!!deleteDevice}
          onClose={() => setDeleteDevice(null)}
          onConfirm={handleDelete}
          deviceId={deleteDevice.id}
          loading={deleteLoading}
        />
      )}

      <RemoteControlModal
        open={controlOpen}
        onClose={() => {
          setControlOpen(false);
          setSelectedDevice(null);
        }}
        device={selectedDevice}
        onCommand={handleCommand}
      />

      <BatchActionBar
        selectedDevices={selectedDevices}
        onBatchDisable={handleBatchDisable}
        onBatchEnable={handleBatchEnable}
        onBatchDelete={handleBatchDelete}
        onBatchBind={() => setBatchBindOpen(true)}
        onClearSelection={clearSelection}
        loading={batchLoading}
      />

      <BindDeviceModal
        open={batchBindOpen}
        onClose={() => setBatchBindOpen(false)}
        onSubmit={handleBatchBindSubmit}
        parkingLots={parkingLots}
        loading={batchLoading}
      />
    </div>
  );
}
