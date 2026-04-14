interface FeeBreakdownCardProps {
  duration: string;
  freeDuration: string;
  billableDuration: string;
  unitPrice: number;
  totalFee: number;
  onViewRule?: () => void;
}

export function FeeBreakdownCard({
  duration,
  freeDuration,
  billableDuration,
  unitPrice,
  totalFee,
  onViewRule,
}: FeeBreakdownCardProps) {
  const [intPart, decPart] = totalFee.toFixed(2).split(".");

  return (
    <div
      className="bg-white rounded-2xl card-shadow p-5 mb-4 animate-fade-in"
      style={{ animationDelay: "0.2s" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">费用明细</span>
        {onViewRule && (
          <button
            onClick={onViewRule}
            className="text-xs text-brand-600 hover:text-brand-700 transition-colors"
          >
            计费规则
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">停车时长</span>
          <span className="text-gray-900">{duration}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">免费时长</span>
          <span className="text-emerald-600">-{freeDuration}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">计费时长</span>
          <span className="text-gray-900">{billableDuration}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">计费单价</span>
          <span className="text-gray-900">&yen;{unitPrice.toFixed(2)}/小时</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-gray-700">应付金额</span>
          <div className="text-right">
            <span className="text-3xl font-bold text-brand-600">&yen;{intPart}</span>
            <span className="text-lg font-bold text-brand-600">.{decPart}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
