interface RuleInfoModalProps {
  open: boolean;
  onClose: () => void;
  freeDurationMinutes: number;
  unitPrice: number;
  dailyCap: number | null;
  billingCycle: string;
}

export function RuleInfoModal({
  open,
  onClose,
  freeDurationMinutes,
  unitPrice,
  dailyCap,
  billingCycle,
}: RuleInfoModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm mx-auto p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">计费规则</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">免费时长</span>
              <span className="text-gray-900">{freeDurationMinutes}分钟</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">计费单价</span>
              <span className="text-gray-900">¥{unitPrice.toFixed(2)}/{billingCycle === "hourly" ? "小时" : "半小时"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">每日封顶</span>
              <span className="text-gray-900">
                {dailyCap !== null ? `¥${dailyCap.toFixed(2)}` : "不设封顶"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">计费周期</span>
              <span className="text-gray-900">{billingCycle === "hourly" ? "按小时" : "按半小时"}</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-400">
            <p>1. 免费时长内不收取费用</p>
            <p>2. 超出免费时长后按计费周期向上取整</p>
            <p>3. 每日封顶金额为单日最高收费</p>
            <p>4. 跨日停车将重新计算每日费用</p>
          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full h-10 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
