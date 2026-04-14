import type { PaymentResult } from "@/types";

interface PaymentSuccessModalProps {
  result: PaymentResult;
  countdown: number;
  onComplete: () => void;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatAmount(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

function getMethodLabel(method: string): string {
  return method === "wechat" ? "微信支付" : "支付宝";
}

export function PaymentSuccessModal({
  result,
  countdown,
  onComplete,
}: PaymentSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl w-full max-w-sm p-8 text-center animate-success-pop">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-pulse-ring" />
            <div className="relative w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">支付成功</h2>
          <p className="text-gray-500 text-sm mb-6">停车费用已支付，请于15分钟内离场</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">车牌号</span>
              <span className="font-mono font-bold text-gray-900">{result.plateNumber}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">支付金额</span>
              <span className="font-bold text-brand-600">{formatAmount(result.amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">支付方式</span>
              <span className="text-sm text-gray-900">{getMethodLabel(result.method)}</span>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium text-amber-800">
                  请在15分钟内离场（剩余 {formatCountdown(countdown)}）
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  超时将重新计费，从当前时间开始计算
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-full h-12 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
