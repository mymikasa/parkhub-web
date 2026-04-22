"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Modal } from "@/components/shared/modal";
import { createTenantSchema } from "@/lib/api/contracts";
import type { Tenant } from "@/types";

interface CreateTenantModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenant?: Tenant | null;
}

export function CreateTenantModal({ open, onClose, onSuccess, tenant }: CreateTenantModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!tenant;

  const form = useForm({
    defaultValues: tenant
      ? { companyName: tenant.companyName, description: tenant.description ?? "", creditCode: tenant.creditCode ?? "", contactPerson: tenant.contactPerson, contactPhone: tenant.contactPhone, adminEmail: tenant.adminEmail ?? "", remark: tenant.remark ?? "" }
      : { companyName: "", description: "", creditCode: "", contactPerson: "", contactPhone: "", adminEmail: "", remark: "" },
    validators: { onChange: createTenantSchema as any },
    onSubmit: async ({ value }) => {
      setLoading(true);
      setError("");
      try {
        const { tenantService } = await import("@/lib/api/tenants");
        if (isEdit && tenant) { await tenantService.update(tenant.id, value); }
        else { await tenantService.create(value); }
        onSuccess();
        onClose();
      } catch (e) { setError(e instanceof Error ? e.message : "操作失败"); }
      finally { setLoading(false); }
    },
  });

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "编辑租户" : "新建租户"}
      footer={
        <>
          <button onClick={onClose} className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">取消</button>
          <button onClick={() => form.handleSubmit()} disabled={loading} className="h-10 px-5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "提交中..." : isEdit ? "确认修改" : "确认创建"}</button>
        </>
      }
    >
      <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">公司名称 <span className="text-red-500">*</span></label>
          <form.Field name="companyName">{(field) => (<><input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="请输入公司全称" className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />{field.state.meta.errors.length > 0 && <p className="mt-1 text-xs text-red-500">{String(field.state.meta.errors[0])}</p>}</>)}</form.Field>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">企业描述</label>
          <form.Field name="description">{(field) => <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="选填，如：母公司或子公司关系" className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />}</form.Field>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">统一社会信用代码</label>
          <form.Field name="creditCode">{(field) => <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="请输入18位信用代码" className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />}</form.Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">联系人 <span className="text-red-500">*</span></label>
            <form.Field name="contactPerson">{(field) => (<><input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="姓名" className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />{field.state.meta.errors.length > 0 && <p className="mt-1 text-xs text-red-500">{String(field.state.meta.errors[0])}</p>}</>)}</form.Field>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">联系电话 <span className="text-red-500">*</span></label>
            <form.Field name="contactPhone">{(field) => (<><input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="手机号" className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />{field.state.meta.errors.length > 0 && <p className="mt-1 text-xs text-red-500">{String(field.state.meta.errors[0])}</p>}</>)}</form.Field>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">管理员邮箱</label>
          <form.Field name="adminEmail">{(field) => (<><input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="用于接收系统通知" className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />{field.state.meta.errors.length > 0 && <p className="mt-1 text-xs text-red-500">{String(field.state.meta.errors[0])}</p>}</>)}</form.Field>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
          <form.Field name="remark">{(field) => <textarea value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} rows={3} placeholder="选填" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 resize-none" />}</form.Field>
        </div>
      </form>
    </Modal>
  );
}
