"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/shared/modal";
import { createParkingLotSchema } from "@/lib/api/contracts";
import { parkingLotService } from "@/lib/api/parking-lots";
import type { CreateParkingLotFormData } from "@/lib/api/contracts";

interface CreateParkingLotModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateParkingLotModal({
  open,
  onClose,
  onSuccess,
}: CreateParkingLotModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateParkingLotFormData>({
    resolver: zodResolver(createParkingLotSchema),
    defaultValues: { name: "", address: "", totalSpots: 0 },
  });

  const handleClose = () => {
    reset();
    setError("");
    onClose();
  };

  const onSubmit = async (data: CreateParkingLotFormData) => {
    setSubmitting(true);
    setError("");
    try {
      await parkingLotService.create(data);
      onSuccess();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="新建停车场"
      footer={
        <>
          <button
            onClick={handleClose}
            className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={submitting}
            className="h-10 px-5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {submitting && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            确认创建
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            车场名称 <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name")}
            placeholder="如：万科翡翠滨江地下停车场"
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-colors"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            车场地址 <span className="text-red-500">*</span>
          </label>
          <input
            {...register("address")}
            placeholder="省/市/区/街道/门牌号"
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-colors"
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">
              {errors.address.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              总车位数 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register("totalSpots")}
              placeholder="0"
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-colors"
            />
            {errors.totalSpots && (
              <p className="text-red-500 text-xs mt-1">
                {errors.totalSpots.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              车场类型
            </label>
            <select
              {...register("type")}
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 bg-white transition-colors"
            >
              <option value="underground">地下停车场</option>
              <option value="ground">地面停车场</option>
              <option value="mechanical">立体车库</option>
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
