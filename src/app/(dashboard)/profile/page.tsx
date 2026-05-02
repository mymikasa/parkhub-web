"use client";

import { useState } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { updateProfileSchema, type UpdateProfileFormData } from "@/lib/api/contracts";
import { useAuth } from "@/contexts/auth-context";
import { ApiClientError } from "@/lib/api/client";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const current = profile ?? user;

  const [form, setForm] = useState({
    realName: current?.name ?? "",
    email: current?.email ?? "",
    phone: current?.phone ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg("");
    setSuccessMsg("");

    const result = updateProfileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await updateProfile.mutateAsync(result.data);
      setSuccessMsg("个人资料已更新");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("更新失败，请稍后重试");
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">个人资料</h1>
        <p className="text-sm text-gray-500 mt-0.5">管理您的账户信息</p>
      </div>

      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        {/* Avatar Section */}
        <div className="px-6 py-8 border-b border-surface-border flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white text-2xl font-semibold">
              {current?.name?.[0] ?? "U"}
            </span>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {current?.name ?? "未设置"}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {current?.role === "super_admin" ? "超级管理员" : current?.role ?? "平台运营"}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              姓名
            </label>
            <input
              type="text"
              value={form.realName}
              onChange={(e) => handleChange("realName", e.target.value)}
              className={inputClass(errors.realName)}
              placeholder="请输入姓名"
            />
            {errors.realName && (
              <p className="mt-1 text-xs text-red-500">{errors.realName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              邮箱
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={inputClass(errors.email)}
              placeholder="请输入邮箱地址"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              手机号
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={inputClass(errors.phone)}
              placeholder="请输入手机号"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="h-10 px-6 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium hover:from-brand-700 hover:to-brand-800 transition-all hover:shadow-lg hover:shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateProfile.isPending ? "保存中..." : "保存修改"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function inputClass(error?: string) {
  return `w-full h-10 px-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
    error ? "border-red-300 bg-red-50/50" : "border-gray-300 bg-white hover:border-gray-400"
  }`;
}
