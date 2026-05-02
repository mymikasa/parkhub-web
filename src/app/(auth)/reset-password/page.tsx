"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { authService } from "@/lib/api/auth";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/api/contracts";
import { ApiClientError } from "@/lib/api/client";

export default function ResetPasswordPage() {
  const [form, setForm] = useState<ResetPasswordFormData>({
    phone: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const sendCode = useCallback(async () => {
    if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      setErrors((prev) => ({ ...prev, phone: "请输入有效的手机号" }));
      return;
    }
    try {
      await authService.sendSmsCode(form.phone, "SMS_PURPOSE_RESET_PASSWORD");
      setCountdown(60);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setErrorMsg("发送验证码失败，请稍后重试");
    }
  }, [form.phone]);

  const handleChange = (field: keyof ResetPasswordFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg("");

    const result = resetPasswordSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        phone: result.data.phone,
        code: result.data.code,
        newPassword: result.data.newPassword,
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("重置失败，请稍后重试");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">重置密码</h1>
          <p className="text-sm text-gray-500 mt-1">
            通过手机验证码重置您的密码
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {success ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">密码重置成功</h2>
              <p className="text-sm text-gray-500 mt-2">请使用新密码登录</p>
              <Link
                href="/login"
                className="mt-6 inline-flex h-10 px-6 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                返回登录
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  手机号
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={inputClass(errors.phone)}
                  placeholder="请输入注册手机号"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  验证码
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => handleChange("code", e.target.value)}
                    className={inputClass(errors.code, "flex-1")}
                    placeholder="6位数字验证码"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={countdown > 0}
                    className={`h-10 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                      countdown > 0
                        ? "border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        : "border border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100"
                    }`}
                  >
                    {countdown > 0 ? `${countdown}s` : "获取验证码"}
                  </button>
                </div>
                {errors.code && (
                  <p className="mt-1 text-xs text-red-500">{errors.code}</p>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{
                  background: loading
                    ? "#2563eb"
                    : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                }}
              >
                {loading ? "重置中..." : "重置密码"}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  返回登录
                </Link>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          &copy; 2026 ParkHub. 让每一次停车都更智能。
        </p>
      </div>
    </div>
  );
}

function inputClass(error?: string, extra?: string) {
  return `h-10 px-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
    error ? "border-red-300 bg-red-50/50" : "border-gray-300 bg-white hover:border-gray-400"
  } ${extra ?? "w-full"}`;
}
