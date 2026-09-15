"use client";

import { ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";

import {
  calculatePortfolio,
  type PortfolioRecommendation,
} from "@/src/actions/portfolio";
import { ChoiceStep } from "@/src/components/advisory/ChoiceStep";
import { RecommendationStep } from "@/src/components/advisory/RecommendationStep";
import { WizardActions } from "@/src/components/advisory/WizardActions";
import { WizardLoadingStep } from "@/src/components/advisory/WizardLoadingStep";
import type {
  ChoiceOption,
  GoalHorizon,
  RiskLevel,
} from "@/src/components/advisory/types";

const risks: readonly ChoiceOption<RiskLevel>[] = [
  { value: "LOW", label: "Low", description: "Steady and protection-first." },
  {
    value: "MEDIUM",
    label: "Medium",
    description: "Balanced growth and stability.",
  },
  { value: "HIGH", label: "High", description: "Growth-focused with wider swings." },
];

const horizons: readonly ChoiceOption<GoalHorizon>[] = [
  { value: "SHORT_TERM", label: "Short-Term", description: "0-3 years" },
  { value: "MEDIUM_TERM", label: "Medium-Term", description: "3-5 years" },
  { value: "LONG_TERM", label: "Long-Term", description: "5+ years" },
];

const riskCopy: Record<RiskLevel, string> = {
  LOW: "Low risk keeps the foundation steady and limits exposure to market swings.",
  MEDIUM: "Medium risk balances dependable instruments with measured growth potential.",
  HIGH: "High risk prioritizes long-term growth and accepts more short-term movement.",
};

export function Wizard() {
  const [step, setStep] = useState(1);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("MEDIUM");
  const [goalHorizon, setGoalHorizon] = useState<GoalHorizon>("MEDIUM_TERM");
  const [recommendation, setRecommendation] =
    useState<PortfolioRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function requestRecommendation(): void {
    setStep(4);
    setError(null);
    startTransition(async () => {
      const result = await calculatePortfolio(riskLevel, goalHorizon);

      if (!result.success) {
        setError(result.error);
        setStep(3);
        return;
      }

      setRecommendation(result.data);
      setStep(5);
    });
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase text-brand-primary">
          Step {step} of 5
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-800">
          Robo-advisory wizard
        </h1>
      </div>

      {step === 1 ? (
        <ChoiceStep
          title="Choose your risk comfort"
          options={risks}
          value={riskLevel}
          onSelect={setRiskLevel}
          onNext={() => setStep(2)}
        />
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-100 bg-brand-surface p-5">
            <ShieldCheck className="h-6 w-6 text-brand-primary" />
            <h2 className="mt-4 text-lg font-semibold text-slate-800">
              {riskLevel.toLowerCase()} risk profile
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {riskCopy[riskLevel]}
            </p>
          </div>
          <WizardActions onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </div>
      ) : null}

      {step === 3 ? (
        <ChoiceStep
          title="Pick your investment horizon"
          options={horizons}
          value={goalHorizon}
          onSelect={setGoalHorizon}
          onBack={() => setStep(2)}
          onNext={requestRecommendation}
        />
      ) : null}

      {step === 4 ? (
        <WizardLoadingStep />
      ) : null}

      {step === 5 && recommendation ? (
        <RecommendationStep
          recommendation={recommendation}
          onBack={() => setStep(3)}
        />
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
