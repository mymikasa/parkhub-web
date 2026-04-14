import type { PaymentMethod } from "@/types";

interface PaymentButtonsProps {
  loading: boolean;
  onPay: (method: PaymentMethod) => void;
}

export function PaymentButtons({ loading, onPay }: PaymentButtonsProps) {
  return (
    <div
      className="space-y-3 pb-8 animate-fade-in"
      style={{ animationDelay: "0.3s" }}
    >
      <button
        onClick={() => onPay("wechat")}
        disabled={loading}
        className="btn-wechat w-full h-14 rounded-xl text-white text-base font-medium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zM14.87 13.13c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
        </svg>
        微信支付
      </button>
      <button
        onClick={() => onPay("alipay")}
        disabled={loading}
        className="btn-alipay w-full h-14 rounded-xl text-white text-base font-medium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21.422 15.358c-3.32-1.326-6.092-2.786-6.092-2.786s1.378-3.316 1.732-5.234H13.02V5.684h5.194V4.478H13.02V1.632h-2.578s-.036.018 0 .048v2.798H5.214v1.206h5.228v1.654H6.9v1.208h8.868c-.262 1.042-.846 2.612-.846 2.612s-4.392-1.746-7.092-1.746c-2.7 0-5.83 1.402-5.83 4.332 0 2.928 2.874 4.414 5.928 4.414 3.054 0 5.796-1.432 7.758-3.564 2.348 1.39 7.094 3.164 7.094 3.164l.508-1.4zM8.368 17.49c-2.552 0-4.116-1.294-4.116-3.054 0-1.76 1.658-3.096 4.284-3.096 2.27 0 4.542.942 6.168 1.896-1.714 2.388-3.918 4.254-6.336 4.254z" />
        </svg>
        支付宝
      </button>
    </div>
  );
}
