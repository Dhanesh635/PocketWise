"use client";

import { BadgeIndianRupee, Info, Sparkles } from "lucide-react";

import { WizardActions } from "@/src/components/advisory/WizardActions";
import type { Recommendation } from "@/src/components/advisory/types";

type RecommendationStepProps = Readonly<{
  recommendation: Recommendation;
  onBack: () => void;
}>;

function formatSipAmount(amount: string): string {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(parsedAmount);
}

export function RecommendationStep({
  recommendation,
  onBack,
}: RecommendationStepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Recommended SIPs
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Monthly surplus available:{" "}
              <span className="font-semibold text-brand-primary">
                {formatSipAmount(recommendation.monthlySurplus)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-brand-primary">
          Core & Satellite strategy
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {recommendation.strategy}
        </p>
      </div>

      <div className="grid gap-4">
        {recommendation.recommendedFunds.map((fund) => (
          <article
            key={fund.amfiCode}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  AMFI {fund.amfiCode}
                </p>
                <h3 className="mt-1 text-base font-semibold text-slate-800">
                  {fund.name}
                </h3>
              </div>
              <span className="rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-primary">
                NAV {fund.currentNAV}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl bg-brand-surface p-4">
              <BadgeIndianRupee className="h-5 w-5 text-brand-primary" />
              <div>
                <p className="text-xs text-slate-500">Monthly SIP</p>
                <p className="text-xl font-semibold tabular-nums text-slate-900">
                  {formatSipAmount(fund.allocatedSIP)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {fund.rationale}
            </p>
          </article>
        ))}
      </div>

      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        Disclaimer: This is a conceptual UI recommendation. No real financial advice is given.
      </p>

      {recommendation.source === "fallback" ? (
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          Live AI ranking was unavailable, so Pocketwise used the curated
          fallback allocation.
        </div>
      ) : null}

      <WizardActions onBack={onBack} />
    </div>
  );
}
