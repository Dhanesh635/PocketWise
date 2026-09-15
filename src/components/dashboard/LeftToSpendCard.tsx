import { WalletMinimal } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/src/lib/formatters";

type LeftToSpendCardProps = Readonly<{
  leftToSpend: string;
  totalMonthlyBudget: string;
}>;

function getBudgetState(totalBudget: number, leftToSpend: number) {
  if (leftToSpend < 0) {
    return {
      label: "Over budget",
      bar: "bg-red-500",
      text: "text-red-700",
      track: "bg-red-50",
      pct: 100,
    };
  }

  const percentage = totalBudget > 0 ? (leftToSpend / totalBudget) * 100 : 0;

  if (percentage > 30) {
    return {
      label: "Safe to spend",
      bar: "bg-brand-primary",
      text: "text-brand-primary",
      track: "bg-emerald-50",
      pct: Math.min(percentage, 100),
    };
  }

  return {
    label: "Getting low",
    bar: "bg-amber-500",
    text: "text-amber-700",
    track: "bg-amber-50",
    pct: Math.max(percentage, 0),
  };
}

export function LeftToSpendCard({
  leftToSpend,
  totalMonthlyBudget,
}: LeftToSpendCardProps) {
  const state = getBudgetState(Number(totalMonthlyBudget), Number(leftToSpend));

  return (
    <section className="h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Left to Spend</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Your remaining budget for daily expenses.
          </p>
          <p className="mt-4 text-4xl font-semibold tabular-nums text-slate-900">
            {formatCurrency(leftToSpend)}
          </p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-surface text-brand-primary">
          <WalletMinimal className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div className={cn("mt-6 h-3 rounded-full", state.track)}>
        <div
          className={cn("h-3 rounded-full transition-all", state.bar)}
          style={{ width: `${state.pct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <span className={cn("font-semibold", state.text)}>{state.label}</span>
        <span className="text-slate-500">
          Monthly budget {formatCurrency(totalMonthlyBudget)}
        </span>
      </div>
    </section>
  );
}
