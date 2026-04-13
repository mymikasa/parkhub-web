"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/shared/modal";
import { updateParkingLotSchema } from "@/lib/api/contracts";
import { parkingLotService } from "@/lib/api/parking-lots";
import type { ParkingLot } from "@/types";
import type { UpdateParkingLotFormData } from "@/lib/api/contracts";

interface EditParkingLotModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parkingLot: ParkingLot | null;
}

export function EditParkingLotModal({
  open,
  onClose,
  onSuccess,
  parkingLot,
}: EditParkingLotModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateParkingLotFormData>({
    resolver: zodResolver(updateParkingLotSchema),
  });

  useEffect(() => {
    if (open && parkingLot) {
      reset({
        name: parkingLot.name,
        address: parkingLot.address,
        totalSpots: parkingLot.totalSpots,
        type: parkingLot.type,
        status: parkingLot.status,
      });
    }
  }, [open, parkingLot, reset]);

  const handleClose = () => {
    reset();
    setError("");
    onClose();
  };

  const onSubmit = async (data: UpdateParkingLotFormData) => {
    if (!parkingLot) return;
    setSubmitting(true);
    setError("");
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined && v !== "")
      );
      await parkingLotService.update(parkingLot.id, cleanData);
      onSuccess();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="编辑停车场"
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
            保存修改
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
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-colors"
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            运营状态
          </label>
          <select
            {...register("status")}
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 bg-white transition-colors"
          >
            <option value="operating">运营中</option>
            <option value="suspended">暂停运营</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
