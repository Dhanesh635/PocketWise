"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateFinancialProfile } from "@/src/actions/profile";
import type { GoalHorizon, ProfileSettings, RiskLevel } from "@/src/components/profile/types";

const riskOptions: readonly { label: string; value: RiskLevel }[] = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
];

const horizonOptions: readonly { label: string; value: GoalHorizon }[] = [
  { label: "Short", value: "SHORT_TERM" },
  { label: "Medium", value: "MEDIUM_TERM" },
  { label: "Long", value: "LONG_TERM" },
];

export function PersonalDemographicsForm({ settings }: { settings: ProfileSettings }) {
  const router = useRouter();
  const [fields, setFields] = useState(settings);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function saveProfile(): void {
    startTransition(async () => {
      const result = await updateFinancialProfile({
        ...fields,
        age: parseInt(fields.age || "0", 10),
      });
      setMessage(result.success ? "Profile updated." : result.error);
      if (result.success) router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <h2 className="text-lg font-semibold text-slate-800">Personal Demographics</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Age</span>
          <input
            type="number"
            min={16}
            max={100}
            step={1}
            value={fields.age}
            onChange={(event) => setFields({ ...fields, age: event.target.value })}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Risk Comfort</span>
          <select
            value={fields.riskLevel}
            onChange={(event) =>
              setFields({ ...fields, riskLevel: event.target.value as RiskLevel })
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          >
            {riskOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Investment Horizon</span>
          <select
            value={fields.goalHorizon}
            onChange={(event) =>
              setFields({ ...fields, goalHorizon: event.target.value as GoalHorizon })
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          >
            {horizonOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="button"
        onClick={saveProfile}
        disabled={isPending}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save profile
      </button>
      {message ? <p className="mt-3 text-sm text-slate-500">{message}</p> : null}
    </section>
  );
}
