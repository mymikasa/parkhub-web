"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable } from "@/components/shared/data-table";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { tenantColumns } from "@/components/tenant-management/tenant-columns";
import { CreateTenantModal } from "@/components/tenant-management/create-tenant-modal";
import { ViewParkingLotsModal } from "@/components/tenant-management/view-parking-lots-modal";
import { tenantService } from "@/lib/api/tenants";
import { cn } from "@/lib/utils";
import type { Tenant, TenantSummary, TenantStatus } from "@/types";

export default function TenantManagementPage() {
  const [summary, setSummary] = useState<TenantSummary | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewLotsOpen, setViewLotsOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const pageSize = 10;
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await tenantService.getSummary();
      setSummary(data);
    } catch {}
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await tenantService.list({
        page,
        pageSize,
        keyword: keyword || undefined,
        status: statusFilter,
      });
      setTenants(res.data);
      setTotal(res.total);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, statusFilter]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleSearchChange = (value: string) => {
    setKeyword(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {}, 300);
  };

  const handleStatusFilter = (status: TenantStatus | undefined) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchSummary();
    fetchList();
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setEditOpen(true);
  };

  const handleViewLots = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setViewLotsOpen(true);
  };

  const handleToggleFreeze = async (tenant: Tenant) => {
    try {
      if (tenant.status === "active") {
        await tenantService.freeze(tenant.id);
      } else {
        await tenantService.unfreeze(tenant.id);
      }
      handleRefresh();
    } catch {}
  };

  const totalPages = Math.ceil(total / pageSize);

  const columns = tenantColumns(handleEdit, handleViewLots, handleToggleFreeze);

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="租户管理"
        description="管理平台所有租户及其停车场配置"
        actions={
          <>
            <SearchInput
              placeholder="搜索租户..."
              value={keyword}
              onChange={handleSearchChange}
            />
            <button
              onClick={() => {
                setSelectedTenant(null);
                setCreateOpen(true);
              }}
              className="h-10 px-5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium flex items-center gap-2 hover:from-brand-700 hover:to-brand-800 transition-all hover:shadow-lg hover:shadow-brand-500/25"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建租户
            </button>
          </>
        }
      />

      {summary && (
        <section className="grid grid-cols-4 gap-5">
          <StatCard
            label="总租户数"
            value={summary.total}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            iconBgClass="bg-blue-50"
            iconTextClass="text-brand-600"
          />
          <StatCard
            label="正常运营"
            value={summary.active}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBgClass="bg-emerald-50"
            iconTextClass="text-emerald-600"
            valueColorClass="text-emerald-600"
          />
          <StatCard
            label="已冻结"
            value={summary.frozen}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            iconBgClass="bg-red-50"
            iconTextClass="text-red-500"
            valueColorClass="text-red-500"
          />
          <StatCard
            label="接入车场"
            value={summary.totalParkingLots}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            }
            iconBgClass="bg-violet-50"
            iconTextClass="text-violet-600"
            valueColorClass="text-violet-600"
          />
        </section>
      )}

      {loading && !tenants.length ? (
        <LoadingSkeleton variant="table" count={5} />
      ) : error ? (
        <ErrorState onRetry={handleRefresh} />
      ) : (
        <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900">租户列表</span>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {([undefined, "active", "frozen"] as const).map((status) => {
                  const label = status === undefined ? "全部" : status === "active" ? "正常" : "冻结";
                  const isActive = statusFilter === status;
                  return (
                    <button
                      key={label}
                      onClick={() => handleStatusFilter(status)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-white shadow-sm text-gray-900"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <span className="text-sm text-gray-500">共 {total} 条记录</span>
          </div>

          <DataTable
            columns={columns}
            data={tenants}
            loading={loading}
            pagination={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
            }}
            emptyMessage="暂无租户数据"
          />
        </div>
      )}

      <CreateTenantModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setSelectedTenant(null);
        }}
        onSuccess={handleRefresh}
      />

      <CreateTenantModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedTenant(null);
        }}
        onSuccess={handleRefresh}
        tenant={selectedTenant}
      />

      <ViewParkingLotsModal
        open={viewLotsOpen}
        onClose={() => {
          setViewLotsOpen(false);
          setSelectedTenant(null);
        }}
        tenant={selectedTenant}
      />
    </div>
  );
}
