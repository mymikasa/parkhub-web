export function PaymentLoadingModal() {
  return (
    <div className="fixed inset-0 z-50" role="alert" aria-live="assertive">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg
              className="w-16 h-16 text-brand-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-sm">正在支付中...</p>
        </div>
      </div>
    </div>
  );
}
