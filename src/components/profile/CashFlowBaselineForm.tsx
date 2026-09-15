"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateFinancialProfile } from "@/src/actions/profile";
import type { CashFlowBaseline } from "@/src/components/profile/types";
import {
  formatIndianNumber,
  sanitizeWholeRupeeInput,
} from "@/src/lib/currency-input";

export function CashFlowBaselineForm({ baseline }: { baseline: CashFlowBaseline }) {
  const router = useRouter();
  const [fields, setFields] = useState(baseline);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function saveBaseline(): void {
    startTransition(async () => {
      const result = await updateFinancialProfile({
        monthlyIncome: parseInt(fields.monthlyIncome || "0", 10),
        baselineMonthlyExpenses: parseInt(
          fields.baselineMonthlyExpenses || "0",
          10,
        ),
      });
      setMessage(result.success ? "Baselines updated." : result.error);
      if (result.success) router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <h2 className="text-lg font-semibold text-slate-800">Cash Flow Baselines</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Fixed Monthly Income</span>
          <input
            type="number"
            min={0}
            step={1}
            value={fields.monthlyIncome}
            onChange={(event) =>
              setFields({
                ...fields,
                monthlyIncome: sanitizeWholeRupeeInput(event.target.value),
              })
            }
            className="h-12 w-full rounded-xl border border-slate-200 px-3 text-base tabular-nums outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="57000"
          />
          <span className="text-xs text-slate-500">
            {formatIndianNumber(fields.monthlyIncome)}
          </span>
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Fixed Monthly Expenses</span>
          <input
            type="number"
            min={0}
            step={1}
            value={fields.baselineMonthlyExpenses}
            onChange={(event) =>
              setFields({
                ...fields,
                baselineMonthlyExpenses: sanitizeWholeRupeeInput(
                  event.target.value,
                ),
              })
            }
            className="h-12 w-full rounded-xl border border-slate-200 px-3 text-base tabular-nums outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="22000"
          />
          <span className="text-xs text-slate-500">
            {formatIndianNumber(fields.baselineMonthlyExpenses)}
          </span>
        </label>
      </div>
      <button
        type="button"
        onClick={saveBaseline}
        disabled={isPending}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save baselines
      </button>
      {message ? <p className="mt-3 text-sm text-slate-500">{message}</p> : null}
    </section>
  );
}
