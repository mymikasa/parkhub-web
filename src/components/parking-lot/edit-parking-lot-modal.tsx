"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { Check, ChevronDown } from "lucide-react";
import { Modal } from "@/components/shared/modal";
import { updateParkingLotSchema } from "@/lib/api/contracts";
import { getFormErrorMessage } from "@/lib/form-errors";
import { parkingLotService } from "@/lib/api/parking-lots";
import type { ParkingLot, ParkingLotStatus, ParkingLotType, UpdateParkingLotRequest } from "@/types";

interface EditParkingLotModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parkingLot: ParkingLot | null;
}

interface SelectOption {
  value: string;
  label: string;
}

function validateUpdateParkingLot({ value }: { value: unknown }) {
  const result = updateParkingLotSchema.safeParse(value);
  return result.success ? undefined : result.error;
}

function StyledSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-left text-sm font-medium text-gray-800 shadow-sm transition-colors hover:border-gray-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
      >
        <span>{selected?.label}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex h-10 w-full items-center justify-between px-4 text-left text-sm transition-colors ${
                  active ? "bg-brand-50 font-medium text-brand-700" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{option.label}</span>
                {active && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EditParkingLotModal({ open, onClose, onSuccess, parkingLot }: EditParkingLotModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      name: "",
      address: "",
      totalSpots: 0 as number,
      type: "ground" as ParkingLotType,
      status: "operating" as ParkingLotStatus,
    },
    validators: {
      onChange: validateUpdateParkingLot,
    },
    onSubmit: async ({ value }) => {
      if (!parkingLot) return;
      setSubmitting(true);
      setError("");
      try {
        const cleanData: UpdateParkingLotRequest = {};
        if (value.name) cleanData.name = value.name;
        if (value.address) cleanData.address = value.address;
        if (value.totalSpots !== undefined) cleanData.totalSpots = value.totalSpots;
        if (value.type) cleanData.type = value.type;
        if (value.status) cleanData.status = value.status;
        await parkingLotService.update(parkingLot.id, cleanData);
        onSuccess();
        handleClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "更新失败");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (open && parkingLot) {
      form.reset({
        name: parkingLot.name,
        address: parkingLot.address,
        totalSpots: parkingLot.totalSpots,
        type: parkingLot.type,
        status: parkingLot.status,
      });
    }
  }, [form, open, parkingLot]);

  const handleClose = () => {
    form.reset();
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="编辑停车场"
      footer={
        <>
          <button
            onClick={handleClose}
            className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => form.handleSubmit()}
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
        {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            车场名称 <span className="text-red-500">*</span>
          </label>
          <form.Field name="name">
            {(field) => (
              <>
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-colors"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-500 text-xs mt-1">{getFormErrorMessage(field.state.meta.errors[0])}</p>
                )}
              </>
            )}
          </form.Field>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            车场地址 <span className="text-red-500">*</span>
          </label>
          <form.Field name="address">
            {(field) => (
              <>
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-colors"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-500 text-xs mt-1">{getFormErrorMessage(field.state.meta.errors[0])}</p>
                )}
              </>
            )}
          </form.Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              总车位数 <span className="text-red-500">*</span>
            </label>
            <form.Field name="totalSpots">
              {(field) => (
                <>
                  <input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                    className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-colors"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-red-500 text-xs mt-1">{getFormErrorMessage(field.state.meta.errors[0])}</p>
                  )}
                </>
              )}
            </form.Field>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              车场类型
            </label>
            <form.Field name="type">
              {(field) => (
                <StyledSelect
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value as ParkingLotType)}
                  options={[
                    { value: "underground", label: "地下停车场" },
                    { value: "ground", label: "地面停车场" },
                    { value: "mechanical", label: "立体车库" },
                  ]}
                />
              )}
            </form.Field>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            运营状态
          </label>
          <form.Field name="status">
            {(field) => (
              <StyledSelect
                value={field.state.value}
                onChange={(value) => field.handleChange(value as ParkingLotStatus)}
                options={[
                  { value: "operating", label: "运营中" },
                  { value: "suspended", label: "暂停运营" },
                ]}
              />
            )}
          </form.Field>
        </div>
      </div>
    </Modal>
  );
}
