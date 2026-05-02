"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { ParkingLotSelector } from "@/components/billing-rules/parking-lot-selector";
import { RuleDisplay } from "@/components/billing-rules/rule-display";
import { RuleEditForm } from "@/components/billing-rules/rule-edit-form";
import { CalculatorModal } from "@/components/billing-rules/calculator-modal";
import { useBillingRules, useUpdateBillingRule } from "@/hooks/use-billing";
import { useParkingLots } from "@/hooks/use-parking-lots";
import type { BillingRule, BillingLotOption, BillingCycle } from "@/types";

export default function BillingRulesPage() {
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  const { data: billingRules = [], isLoading: rulesLoading, isError: rulesError, refetch } = useBillingRules();
  const { data: lotsData, isLoading: lotsLoading } = useParkingLots({ page: 1, pageSize: 100 });

  const parkingLots = lotsData?.data ?? [];
  const loading = rulesLoading || lotsLoading;
  const updateRule = useUpdateBillingRule();

  const billingLotOptions: BillingLotOption[] = useMemo(() => {
    const ruleLotIds = new Set(billingRules.map((r: BillingRule) => r.parkingLotId));
    return parkingLots.map((lot) => ({
      id: lot.id,
      name: lot.name,
      status: lot.status,
      hasRule: ruleLotIds.has(lot.id),
    }));
  }, [parkingLots, billingRules]);

  const selectedRule = useMemo(
    () => billingRules.find((r: BillingRule) => r.parkingLotId === selectedLotId) ?? null,
    [billingRules, selectedLotId]
  );

  const handleSave = async (data: {
    freeDurationMinutes: number;
    unitPrice: number;
    dailyCap: number | null;
    billingCycle: BillingCycle;
  }) => {
    if (!selectedRule) return;
    await updateRule.mutateAsync({ id: selectedRule.id, data });
  };

  if (loading) {
    return <div className="p-8"><LoadingSkeleton variant="card" count={2} /></div>;
  }

  if (rulesError) {
    return <div className="p-8"><ErrorState onRetry={() => refetch()} /></div>;
  }

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="计费规则配置"
        description="设置各停车场的计费规则，支持免费时长、按时计费、每日封顶"
        actions={
          <button onClick={() => setCalculatorOpen(true)} className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            费用计算器
          </button>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <ParkingLotSelector lots={billingLotOptions} selectedId={selectedLotId} onSelect={setSelectedLotId} />
        </div>
        <div className="col-span-8 space-y-6">
          <RuleDisplay rule={selectedRule} hasNoRule={!selectedRule && !!selectedLotId} />
          {selectedRule && <RuleEditForm rule={selectedRule} onSave={handleSave} saving={updateRule.isPending} />}
        </div>
      </div>

      <CalculatorModal open={calculatorOpen} onClose={() => setCalculatorOpen(false)} lots={billingLotOptions} />
    </div>
  );
}
