"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

type WizardActionsProps = Readonly<{
  onBack?: () => void;
  onNext?: () => void;
}>;

export function WizardActions({ onBack, onNext }: WizardActionsProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={!onBack}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-0"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </button>
      {onNext ? (
        <button
          type="button"
          onClick={onNext}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Continue
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
