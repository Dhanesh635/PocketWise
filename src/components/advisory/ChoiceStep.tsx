"use client";

import { cn } from "@/lib/utils";
import { WizardActions } from "@/src/components/advisory/WizardActions";
import type { ChoiceOption } from "@/src/components/advisory/types";

type ChoiceStepProps<TValue extends string> = Readonly<{
  title: string;
  options: readonly ChoiceOption<TValue>[];
  value: TValue;
  onSelect: (value: TValue) => void;
  onBack?: () => void;
  onNext: () => void;
}>;

export function ChoiceStep<TValue extends string>({
  title,
  options,
  value,
  onSelect,
  onBack,
  onNext,
}: ChoiceStepProps<TValue>) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={cn(
              "rounded-2xl border p-4 text-left transition",
              value === option.value
                ? "border-brand-primary bg-brand-surface"
                : "border-slate-100 hover:border-slate-200",
            )}
          >
            <span className="text-sm font-semibold text-slate-800">
              {option.label}
            </span>
            <span className="mt-2 block text-sm leading-6 text-slate-500">
              {option.description}
            </span>
          </button>
        ))}
      </div>
      <WizardActions onBack={onBack} onNext={onNext} />
    </div>
  );
}
