"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { paymentService } from "@/lib/api/payment";
import type { PaymentOrder, PaymentMethod, PaymentResult } from "@/types";
import { HeroHeader } from "@/components/payment/hero-header";
import { VehicleInfoCard } from "@/components/payment/vehicle-info-card";
import { DurationCard } from "@/components/payment/duration-card";
import { FeeBreakdownCard } from "@/components/payment/fee-breakdown-card";
import { PaymentButtons } from "@/components/payment/payment-buttons";
import { PaymentLoadingModal } from "@/components/payment/payment-loading-modal";
import { PaymentSuccessModal } from "@/components/payment/payment-success-modal";
import { RuleInfoModal } from "@/components/payment/rule-info-modal";

export default function PayPage() {
  const searchParams = useSearchParams();
  const plate = searchParams.get("plate") || "";

  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(15 * 60);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!plate) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getOrder(plate);
      setOrder(data);
    } catch {
      setError("未找到该车牌的缴费订单");
    } finally {
      setLoading(false);
    }
  }, [plate]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!showSuccess) return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showSuccess]);

  const handlePay = async (method: PaymentMethod) => {
    if (!order) return;
    try {
      setPaying(true);
      const result = await paymentService.pay({ orderId: order.id, method });
      setPaymentResult(result);
      setShowSuccess(true);
      setCountdown(15 * 60);
    } catch {
      setError("支付失败，请重试");
    } finally {
      setPaying(false);
    }
  };

  const handleComplete = () => {
    setShowSuccess(false);
    setPaymentResult(null);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  if (loading) {
    return (
      <>
        <HeroHeader parkingLotName="加载中..." />
        <div className="px-5 -mt-4 relative z-10">
          <div className="bg-white rounded-2xl card-shadow p-8 text-center animate-pulse">
            <div className="h-6 bg-gray-100 rounded w-1/2 mx-auto mb-4" />
            <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto" />
          </div>
        </div>
      </>
    );
  }

  if (!plate) {
    return (
      <>
        <HeroHeader parkingLotName="ParkHub" />
        <div className="px-5 -mt-4 relative z-10">
          <div className="bg-white rounded-2xl card-shadow p-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500 text-sm">请扫描停车场二维码进入缴费页面</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <HeroHeader parkingLotName="ParkHub" />
        <div className="px-5 -mt-4 relative z-10">
          <div className="bg-white rounded-2xl card-shadow p-8 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-gray-500 text-sm mb-4">{error || "订单不存在"}</p>
            <button
              onClick={fetchOrder}
              className="text-brand-600 text-sm hover:text-brand-700 transition-colors"
            >
              重新查询
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeroHeader parkingLotName={order.parkingLotName} />

      <div className="px-5 -mt-4 relative z-10">
        <VehicleInfoCard
          plateNumber={order.plateNumber}
          entryLane={order.entryLane}
          vehicleImage={order.vehicleImage}
          vehicleType={order.vehicleType}
        />

        <DurationCard
          entryTime={order.entryTime}
          currentTime={order.currentTime}
          duration={order.duration}
        />

        <FeeBreakdownCard
          duration={order.duration}
          freeDuration={order.freeDuration}
          billableDuration={order.billableDuration}
          unitPrice={order.unitPrice}
          totalFee={order.totalFee}
          onViewRule={() => setRuleModalOpen(true)}
        />

        <PaymentButtons loading={paying} onPay={handlePay} />

        <div className="text-center pb-8">
          <p className="text-xs text-gray-400">支付成功后，请在15分钟内离场</p>
          <p className="text-xs text-gray-400 mt-1">如有疑问请联系现场工作人员</p>
        </div>
      </div>

      {paying && <PaymentLoadingModal />}

      {showSuccess && paymentResult && (
        <PaymentSuccessModal
          result={paymentResult}
          countdown={countdown}
          onComplete={handleComplete}
        />
      )}

      <RuleInfoModal
        open={ruleModalOpen}
        onClose={() => setRuleModalOpen(false)}
        freeDurationMinutes={parseInt(order.freeDuration) || 15}
        unitPrice={order.unitPrice}
        dailyCap={order.unitPrice * 8}
        billingCycle="hourly"
      />
    </>
  );
}
