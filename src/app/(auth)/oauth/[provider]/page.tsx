"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES } from "@/lib/constants";

const providerInfo: Record<string, { name: string; color: string; icon: string }> = {
  wechat: { name: "微信", color: "#07C160", icon: "W" },
  qq: { name: "QQ", color: "#1296DB", icon: "Q" },
};

export default function OAuthPage() {
  const params = useParams();
  const router = useRouter();
  const { oauthLogin } = useAuth();
  const provider = params.provider as string;
  const info = providerInfo[provider] ?? { name: provider, color: "#666", icon: "?" };

  const handleConfirm = async () => {
    try {
      await oauthLogin(provider, `mock_${provider}_code`);
      router.push(ROUTES.DASHBOARD_HOME);
    } catch {
      router.push(ROUTES.LOGIN);
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 text-center" style={{ background: `linear-gradient(135deg, ${info.color}dd 0%, ${info.color} 100%)` }}>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <span className="text-white text-2xl font-bold">{info.icon}</span>
          </div>
          <h2 className="text-white text-xl font-semibold">{info.name} 授权登录</h2>
          <p className="text-white/70 text-sm mt-2">ParkHub 智慧停车管理平台</p>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">P</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">ParkHub 管理后台</p>
              <p className="text-xs text-gray-500 mt-0.5">将获取您的 {info.name} 基本信息用于登录</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleConfirm}
              className="w-full h-11 rounded-lg text-white text-sm font-medium transition-colors"
              style={{ background: info.color }}
            >
              确认授权
            </button>
            <button
              onClick={handleCancel}
              className="w-full h-11 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              拒绝并返回
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
