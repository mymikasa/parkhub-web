"use client";

import { useState, useCallback, useMemo } from "react";
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
import { useDevices, useDeviceStats, useCreateDevice, useUpdateDeviceName, useDeleteDevice, useBindDevice, useUnbindDevice, useDisableDevice, useEnableDevice, useBatchDisableDevices, useBatchEnableDevices, useBatchDeleteDevices, useBatchBindDevices, useSendDeviceCommand } from "@/hooks/use-devices";
import { useParkingLots } from "@/hooks/use-parking-lots";
import { cn } from "@/lib/utils";
import type { Device, DeviceFilters, DeviceStatus } from "@/types";

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
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");

  const { data: deviceData, isLoading: loading } = useDevices(filters);
  const { data: stats } = useDeviceStats();
  const { data: parkingLotsData } = useParkingLots({ pageSize: 100 });

  const devices = deviceData?.data ?? [];
  const total = deviceData?.total ?? 0;
  const parkingLots = parkingLotsData?.data ?? [];

  const createDevice = useCreateDevice();
  const updateDeviceName = useUpdateDeviceName();
  const deleteDevice = useDeleteDevice();
  const bindDevice = useBindDevice();
  const unbindDevice = useUnbindDevice();
  const disableDevice = useDisableDevice();
  const enableDevice = useEnableDevice();
  const batchDisable = useBatchDisableDevices();
  const batchEnable = useBatchEnableDevices();
  const batchDelete = useBatchDeleteDevices();
  const batchBind = useBatchBindDevices();
  const sendCommand = useSendDeviceCommand();

  const [createOpen, setCreateOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [bindDeviceState, setBindDeviceState] = useState<Device | null>(null);
  const [deleteDeviceState, setDeleteDeviceState] = useState<Device | null>(null);
  const [controlOpen, setControlOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [batchBindOpen, setBatchBindOpen] = useState(false);

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
    await createDevice.mutateAsync(data as any);
    setCreateOpen(false);
  };

  const handleUpdateName = async (name: string) => {
    if (!editDevice) return;
    await updateDeviceName.mutateAsync({ id: editDevice.id, data: { name } });
    setEditDevice(null);
  };

  const handleBind = async (data: { parkingLotId: string; gateId: string }) => {
    if (!bindDeviceState) return;
    await bindDevice.mutateAsync({ id: bindDeviceState.id, data });
    setBindDeviceState(null);
  };

  const handleUnbind = async (device: Device) => {
    await unbindDevice.mutateAsync(device.id);
  };

  const handleDisable = async (device: Device) => {
    await disableDevice.mutateAsync(device.id);
  };

  const handleEnable = async (device: Device) => {
    await enableDevice.mutateAsync(device.id);
  };

  const handleDelete = async () => {
    if (!deleteDeviceState) return;
    await deleteDevice.mutateAsync(deleteDeviceState.id);
    setDeleteDeviceState(null);
  };

  const handleRemoteControl = (device: Device) => {
    setSelectedDevice(device);
    setControlOpen(true);
  };

  const handleCommand = async (action: "up" | "down") => {
    if (!selectedDevice) return;
    await sendCommand.mutateAsync({ id: selectedDevice.id, data: { action } });
  };

  const selectedDevices = useMemo(() => {
    const ids = Object.keys(rowSelection).filter((k) => rowSelection[k]);
    return devices.filter((d) => ids.includes(d.id));
  }, [rowSelection, devices]);

  const clearSelection = useCallback(() => setRowSelection({}), []);

  const handleBatchDisable = async (ids: string[]) => {
    await batchDisable.mutateAsync({ ids });
    clearSelection();
  };

  const handleBatchEnable = async (ids: string[]) => {
    await batchEnable.mutateAsync({ ids });
    clearSelection();
  };

  const handleBatchDelete = async (ids: string[]) => {
    await batchDelete.mutateAsync({ ids });
    clearSelection();
  };

  const handleBatchBindSubmit = async (data: { parkingLotId: string; gateId: string }) => {
    const pendingSelected = selectedDevices.filter((d) => d.status === "pending");
    if (pendingSelected.length === 0) return;
    await batchBind.mutateAsync({
      bindings: pendingSelected.map((d) => ({
        id: d.id,
        parkingLotId: data.parkingLotId,
        gateId: data.gateId,
      })),
    });
    setBatchBindOpen(false);
    clearSelection();
  };

  const columns = useMemo(
    () =>
      getDeviceColumns({
        onEdit: (d) => setEditDevice(d),
        onBind: (d) => setBindDeviceState(d),
        onUnbind: handleUnbind,
        onDisable: handleDisable,
        onEnable: handleEnable,
        onDelete: (d) => setDeleteDeviceState(d),
        onRemoteControl: handleRemoteControl,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const tabs: { key: StatusTab; label: string }[] = [
    { key: "all", label: `全部 (${stats?.total ?? 0})` },
    { key: "pending", label: `待激活 (${stats?.pending ?? 0})` },
    { key: "active", label: `在线 (${stats?.active ?? 0})` },
    { key: "offline", label: `离线 (${stats?.offline ?? 0})` },
    { key: "disabled", label: `已停用 (${stats?.disabled ?? 0})` },
  ];

  const mutationLoading = createDevice.isPending || updateDeviceName.isPending || deleteDevice.isPending || bindDevice.isPending || batchDisable.isPending || batchEnable.isPending || batchDelete.isPending || batchBind.isPending;

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
          <StatCard label="设备总数" value={stats.total} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>} />
          <StatCard label="待激活" value={stats.pending} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} iconBgClass="bg-gray-50" iconTextClass="text-gray-600" valueColorClass="text-gray-600" />
          <StatCard label="在线" value={stats.active} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>} iconBgClass="bg-emerald-50" iconTextClass="text-emerald-600" valueColorClass="text-emerald-600" />
          <StatCard label="离线" value={stats.offline} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} iconBgClass="bg-red-50" iconTextClass="text-red-600" valueColorClass="text-red-600" />
          <StatCard label="已停用" value={stats.disabled} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>} iconBgClass="bg-orange-50" iconTextClass="text-orange-600" valueColorClass="text-orange-600" />
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
                  activeTab === tab.key ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100",
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

      <CreateDeviceModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} loading={createDevice.isPending} />
      {editDevice && <UpdateDeviceNameModal open={!!editDevice} onClose={() => setEditDevice(null)} onSubmit={handleUpdateName} deviceName={editDevice.name} loading={updateDeviceName.isPending} />}
      {bindDeviceState && <BindDeviceModal open={!!bindDeviceState} onClose={() => setBindDeviceState(null)} onSubmit={handleBind} parkingLots={parkingLots} loading={bindDevice.isPending} />}
      {deleteDeviceState && <DeleteConfirmModal open={!!deleteDeviceState} onClose={() => setDeleteDeviceState(null)} onConfirm={handleDelete} deviceId={deleteDeviceState.id} loading={deleteDevice.isPending} />}
      <RemoteControlModal open={controlOpen} onClose={() => { setControlOpen(false); setSelectedDevice(null); }} device={selectedDevice} onCommand={handleCommand} />
      <BatchActionBar selectedDevices={selectedDevices} onBatchDisable={handleBatchDisable} onBatchEnable={handleBatchEnable} onBatchDelete={handleBatchDelete} onBatchBind={() => setBatchBindOpen(true)} onClearSelection={clearSelection} loading={mutationLoading} />
      <BindDeviceModal open={batchBindOpen} onClose={() => setBatchBindOpen(false)} onSubmit={handleBatchBindSubmit} parkingLots={parkingLots} loading={batchBind.isPending} />
    </div>
  );
}
