"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { Tenant } from "@/types";

const avatarGradients = [
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-violet-500 to-violet-600",
  "from-rose-500 to-rose-600",
  "from-cyan-500 to-cyan-600",
  "from-orange-500 to-orange-600",
  "from-teal-500 to-teal-600",
];

export const tenantColumns = (
  onEdit: (tenant: Tenant) => void,
  onViewLots: (tenant: Tenant) => void,
  onToggleFreeze: (tenant: Tenant) => void
): ColumnDef<Tenant, unknown>[] => [
  {
    accessorKey: "companyName",
    header: "租户信息",
    size: 260,
    cell: ({ row }) => {
      const t = row.original;
      const gradient = avatarGradients[t.id.charCodeAt(t.id.length - 1) % avatarGradients.length];
      const firstChar = t.companyName.charAt(0);
      return (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-medium text-sm shrink-0`}>
            {firstChar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{t.companyName}</p>
            {t.description && (
              <p className="text-xs text-gray-500 truncate">{t.description}</p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "contactPerson",
    header: "联系人",
    size: 160,
    cell: ({ row }) => {
      const t = row.original;
      return (
        <div>
          <p className="text-sm text-gray-900">{t.contactPerson}</p>
          <p className="text-xs text-gray-500">{t.contactPhone.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3")}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "parkingLotCount",
    header: "车场数",
    size: 80,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="w-8 h-8 rounded-full bg-blue-50 text-brand-600 text-sm font-medium flex items-center justify-center">
          {row.original.parkingLotCount}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "状态",
    size: 100,
    cell: ({ row }) => {
      const isActive = row.original.status === "active";
      return (
        <div className="flex justify-center">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? "bg-emerald-50 text-emerald-700 glow-normal" : "bg-red-50 text-red-700 glow-danger"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
            {isActive ? "正常" : "冻结"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    size: 120,
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">
        {row.original.createdAt.slice(0, 10)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "操作",
    size: 140,
    cell: ({ row }) => {
      const t = row.original;
      const isActive = t.status === "active";
      return (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onEdit(t)}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            title="编辑"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onViewLots(t)}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            title="查看车场"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </button>
          <button
            onClick={() => onToggleFreeze(t)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? "hover:bg-red-50 text-gray-400 hover:text-red-500" : "hover:bg-emerald-50 text-gray-400 hover:text-emerald-500"}`}
            title={isActive ? "冻结" : "解冻"}
          >
            {isActive ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>
      );
    },
  },
];
