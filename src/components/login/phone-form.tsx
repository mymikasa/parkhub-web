"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { authService } from "@/lib/api/auth";
import { smsLoginSchema, type SmsLoginFormData } from "@/lib/api/contracts";
import { ApiClientError } from "@/lib/api/client";

export function PhoneForm() {
  const { loginBySms } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SmsLoginFormData>({
    resolver: zodResolver(smsLoginSchema),
    defaultValues: {
      phone: "",
      code: "",
      rememberMe: true,
    },
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const sendSmsCode = useCallback(async () => {
    const phone = getValues("phone");
    if (!/^1[3-9]\d{9}$/.test(phone)) return;

    try {
      await authService.sendSmsCode(phone);
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
      setServerError("发送验证码失败，请稍后重试");
    }
  }, [getValues]);

  const onSubmit = async (data: SmsLoginFormData) => {
    setServerError("");
    try {
      await loginBySms({
        phone: data.phone,
        code: data.code,
        rememberMe: data.rememberMe,
      });
      router.push(ROUTES.DASHBOARD_HOME);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message);
      } else {
        setServerError("登录失败，请稍后重试");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
          手机号
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="请输入手机号…"
            {...register("phone")}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:border-brand-500 focus:outline-none focus:ring-[3px] focus:ring-brand-500/15 transition-shadow"
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="sms-code" className="block text-sm font-medium text-gray-700 mb-1.5">
          验证码
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <input
              id="sms-code"
              type="text"
              autoComplete="one-time-code"
              inputMode="numeric"
              placeholder="请输入验证码…"
              spellCheck={false}
              {...register("code")}
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:border-brand-500 focus:outline-none focus:ring-[3px] focus:ring-brand-500/15 transition-shadow"
            />
          </div>
          <button
            type="button"
            onClick={sendSmsCode}
            disabled={countdown > 0}
            className={cn(
              "h-11 px-5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              countdown > 0
                ? "border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                : "border border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100"
            )}
          >
            {countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}
          </button>
        </div>
        {errors.code && (
          <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>
        )}
      </div>

      {serverError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-8"
        style={{
          background: isSubmitting
            ? "#2563eb"
            : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        }}
      >
        {isSubmitting ? (
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

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
