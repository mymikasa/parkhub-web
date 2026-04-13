"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/modal";

interface ManualChargeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { plateNumber: string; amount: number; paymentMethod: "wechat" | "alipay" | "cash"; remark: string }) => void;
  loading: boolean;
}

export function ManualChargeModal({ open, onClose, onSubmit, loading }: ManualChargeModalProps) {
  const [plateNumber, setPlateNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"wechat" | "alipay" | "cash">("wechat");
  const [remark, setRemark] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ plateNumber, amount: parseFloat(amount), paymentMethod, remark });
  };

  const handleClose = () => {
    setPlateNumber("");
    setAmount("");
    setPaymentMethod("wechat");
    setRemark("");
    onClose();
  };

  const paymentOptions: Array<{ value: "wechat" | "alipay" | "cash"; label: string; activeBorder: string; activeBg: string; activeText: string }> = [
    { value: "wechat", label: "微信", activeBorder: "border-brand-500", activeBg: "bg-brand-50", activeText: "text-brand-700" },
    { value: "alipay", label: "支付宝", activeBorder: "border-brand-500", activeBg: "bg-brand-50", activeText: "text-brand-700" },
    { value: "cash", label: "现金", activeBorder: "border-brand-500", activeBg: "bg-brand-50", activeText: "text-brand-700" },
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="手动收费"
      footer={
        <>
          <button onClick={handleClose} className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">取消</button>
          <button
            onClick={handleSubmit}
            disabled={loading || !plateNumber || !amount}
            className="h-10 px-5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium disabled:opacity-50 transition-all"
          >
            {loading ? "处理中..." : "确认收费"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">车牌号 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            placeholder="请输入车牌号"
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">收费金额 <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-11 pl-8 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">支付方式</label>
          <div className="grid grid-cols-3 gap-3">
            {paymentOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPaymentMethod(opt.value)}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  paymentMethod === opt.value
                    ? `${opt.activeBorder} ${opt.activeBg}`
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className={`text-sm ${paymentMethod === opt.value ? opt.activeText : "text-gray-600"}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={2}
            placeholder="选填"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
