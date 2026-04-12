"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BrandPanel } from "./brand-panel";
import { AccountForm } from "./account-form";
import { PhoneForm } from "./phone-form";
import { OAuthButtons } from "./oauth-buttons";

type Tab = "account" | "phone";

export function LoginForm() {
  const [tab, setTab] = useState<Tab>("account");

  return (
    <div className="flex min-h-screen">
      <BrandPanel />

      <div className="w-full lg:w-[45%] flex flex-col bg-white">
        <div className="lg:hidden flex items-center gap-3 p-6">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
          <span className="text-gray-900 text-lg font-semibold">ParkHub</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
          <div className="w-full max-w-[400px]">
            <div className="mb-8">
              <h2 className="text-gray-900 text-2xl font-bold mb-2">
                欢迎回来
              </h2>
              <p className="text-gray-500 text-sm">
                登录您的账号以继续管理停车场
              </p>
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
              <button
                type="button"
                onClick={() => setTab("account")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors",
                  tab === "account"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <svg className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                账号登录
              </button>
              <button
                type="button"
                onClick={() => setTab("phone")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors",
                  tab === "phone"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <svg className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                手机号登录
              </button>
            </div>

            {tab === "account" ? <AccountForm /> : <PhoneForm />}

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">其他方式</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <OAuthButtons />
          </div>
        </div>

        <div className="px-6 py-6 text-center lg:hidden">
          <p className="text-gray-400 text-xs">
            &copy; 2026 ParkHub. 让每一次停车都更智能。
          </p>
        </div>
      </div>
    </div>
  );
}
