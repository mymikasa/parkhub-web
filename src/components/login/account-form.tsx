"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { loginSchema } from "@/lib/api/contracts";
import { ApiClientError } from "@/lib/api/client";
import { getFormErrorMessage } from "@/lib/form-errors";

export function AccountForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      rememberMe: true as boolean,
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError("");
      try {
        await login({
          username: value.username,
          password: value.password,
          rememberMe: value.rememberMe,
        });
        router.push(ROUTES.DASHBOARD_HOME);
      } catch (err) {
        if (err instanceof ApiClientError) {
          setServerError(err.message);
        } else {
          setServerError("登录失败，请稍后重试");
        }
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-5"
    >
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
          账号
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <form.Field name="username">
            {(field) => (
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="请输入账号…"
                spellCheck={false}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:border-brand-500 focus:outline-none focus:ring-[3px] focus:ring-brand-500/15 transition-shadow"
              />
            )}
          </form.Field>
        </div>
        <form.Field name="username">
          {(field) =>
            field.state.meta.errors.length > 0 ? (
              <p className="mt-1 text-xs text-red-500">{getFormErrorMessage(field.state.meta.errors[0])}</p>
            ) : null
          }
        </form.Field>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
          密码
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <form.Field name="password">
            {(field) => (
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="请输入密码…"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="w-full h-11 pl-10 pr-11 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:border-brand-500 focus:outline-none focus:ring-[3px] focus:ring-brand-500/15 transition-shadow"
              />
            )}
          </form.Field>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="切换密码可见性"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
          >
            {showPassword ? (
              <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        </div>
        <form.Field name="password">
          {(field) =>
            field.state.meta.errors.length > 0 ? (
              <p className="mt-1 text-xs text-red-500">{getFormErrorMessage(field.state.meta.errors[0])}</p>
            ) : null
          }
        </form.Field>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <form.Field name="rememberMe">
            {(field) => (
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
              />
            )}
          </form.Field>
          <span className="text-sm text-gray-600">记住登录状态</span>
        </label>
        <Link href={ROUTES.RESET_PASSWORD} className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
          忘记密码？
        </Link>
      </div>

      {serverError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={form.state.isSubmitting}
        className="w-full h-11 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: form.state.isSubmitting
            ? "#2563eb"
            : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        }}
      >
        {form.state.isSubmitting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            登录中…
          </>
        ) : (
          "登录"
        )}
      </button>
    </form>
  );
}
