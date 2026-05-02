"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/modal";
import { useChangePassword } from "@/hooks/use-profile";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/api/contracts";
import { ApiClientError } from "@/lib/api/client";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const changePassword = useChangePassword();
  const [form, setForm] = useState<ChangePasswordFormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof ChangePasswordFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg("");

    const result = changePasswordSchema.safeParse(form);
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
      await changePassword.mutateAsync(result.data);
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("修改失败，请稍后重试");
      }
    }
  };

  const handleClose = () => {
    setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
    setErrorMsg("");
    setSuccess(false);
    onClose();
  };

  if (success) {
    return (
      <Modal open={open} onClose={handleClose} title="修改密码">
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium">密码修改成功</p>
          <p className="text-sm text-gray-500 mt-1">请使用新密码重新登录</p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="h-10 px-6 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            我知道了
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="修改密码" subtitle="请输入当前密码和新密码">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            当前密码
          </label>
          <input
            type="password"
            value={form.oldPassword}
            onChange={(e) => handleChange("oldPassword", e.target.value)}
            className={inputClass(errors.oldPassword)}
            placeholder="请输入当前密码"
          />
          {errors.oldPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.oldPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            新密码
          </label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => handleChange("newPassword", e.target.value)}
            className={inputClass(errors.newPassword)}
            placeholder="至少8位，需含大小写字母和数字"
          />
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            确认新密码
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            className={inputClass(errors.confirmPassword)}
            placeholder="请再次输入新密码"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="h-10 px-4 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="h-10 px-6 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {changePassword.isPending ? "修改中..." : "确认修改"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function inputClass(error?: string) {
  return `w-full h-10 px-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
    error ? "border-red-300 bg-red-50/50" : "border-gray-300 bg-white hover:border-gray-400"
  }`;
}
