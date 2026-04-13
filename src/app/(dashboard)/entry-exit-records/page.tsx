"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { RecordFilterBar } from "@/components/entry-exit-records/record-filter-bar";
import { ExceptionAlert } from "@/components/entry-exit-records/exception-alert";
import { RecordDetailModal } from "@/components/entry-exit-records/record-detail-modal";
import { ExceptionHandleModal } from "@/components/entry-exit-records/exception-handle-modal";
import { getRecordColumns } from "@/components/entry-exit-records/record-columns";
import { recordService } from "@/lib/api/records";
import { parkingLotService } from "@/lib/api/parking-lots";
import type { EntryExitRecord, RecordSummary, RecordFilters, ParkingLot } from "@/types";

export default function EntryExitRecordsPage() {
  const [filters, setFilters] = useState<RecordFilters>({ page: 1, pageSize: 10 });
  const [records, setRecords] = useState<EntryExitRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<RecordSummary | null>(null);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EntryExitRecord | null>(null);
  const [exceptionOpen, setExceptionOpen] = useState(false);
  const [selectedException, setSelectedException] = useState<EntryExitRecord | null>(null);
  const [exceptionLoading, setExceptionLoading] = useState(false);

  const fetchRecords = useCallback(async (f: RecordFilters) => {
    setLoading(true);
    try {
      const res = await recordService.list(f);
      setRecords(res.data);
      setTotal(res.total);
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await recordService.getSummary();
      setSummary(res);
    } catch {
      // error handled silently
    }
  }, []);

  useEffect(() => {
    parkingLotService.list({ pageSize: 100 }).then((res) => setParkingLots(res.data));
  }, []);

  useEffect(() => {
    fetchRecords(filters);
  }, [filters, fetchRecords]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleFilter = (newFilters: RecordFilters) => {
    setFilters({ ...newFilters, page: 1, pageSize: filters.pageSize });
  };

  const handleReset = () => {
    setFilters({ page: 1, pageSize: 10 });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleViewDetail = (record: EntryExitRecord) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const handleOpenException = (record: EntryExitRecord) => {
    setSelectedException(record);
    setExceptionOpen(true);
  };

  const handleExceptionSubmit = async (plateNumber: string, remark: string) => {
    if (!selectedException) return;
    setExceptionLoading(true);
    try {
      await recordService.handleException(selectedException.id, { plateNumber, remark });
      setExceptionOpen(false);
      setSelectedException(null);
      fetchRecords(filters);
      fetchSummary();
    } catch {
      // error handled silently
    } finally {
      setExceptionLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await recordService.export(filters);
    } catch {
      // error handled silently
    } finally {
      setExporting(false);
    }
  };

  const handleViewExceptions = () => {
    setFilters({ page: 1, pageSize: 10, status: "exception" });
  };

  const columns = useMemo(
    () =>
      getRecordColumns({
        onViewDetail: handleViewDetail,
        onHandleException: handleOpenException,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="出入记录"
        actions={
          <button
            onClick={handleExport}
            disabled={exporting}
            className="h-9 px-4 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exporting ? "导出中..." : "导出"}
          </button>
        }
      />

      <RecordFilterBar
        filters={filters}
        parkingLots={parkingLots}
        onFilter={handleFilter}
        onReset={handleReset}
      />

      {summary && <ExceptionAlert summary={summary} onViewExceptions={handleViewExceptions} />}

      {loading && records.length === 0 ? (
        <LoadingSkeleton variant="table" count={5} />
      ) : (
        <DataTable
          columns={columns}
          data={records}
          loading={loading}
          pagination={{
            page: filters.page ?? 1,
            pageSize: filters.pageSize ?? 10,
            total,
            onPageChange: handlePageChange,
          }}
          getRowClassName={(row) =>
            ["entry_no_exit", "exit_no_entry", "recognition_failed"].includes(row.status)
              ? "bg-amber-50/50"
              : ""
          }
        />
      )}

      <RecordDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        record={selectedRecord}
      />

      <ExceptionHandleModal
        open={exceptionOpen}
        onClose={() => {
          setExceptionOpen(false);
          setSelectedException(null);
        }}
        record={selectedException}
        onSubmit={handleExceptionSubmit}
        loading={exceptionLoading}
      />
    </div>
  );
}
