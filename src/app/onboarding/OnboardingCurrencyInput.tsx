"use client";

import {
  formatIndianNumber,
  sanitizeWholeRupeeInput,
} from "@/src/lib/currency-input";

type OnboardingCurrencyInputProps = Readonly<{
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}>;

export function OnboardingCurrencyInput({
  label,
  value,
  placeholder,
  onChange,
}: OnboardingCurrencyInputProps) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-800">
      <span>{label}</span>
      <input
        type="number"
        min={0}
        step={1}
        required
        value={value}
        onChange={(event) => onChange(sanitizeWholeRupeeInput(event.target.value))}
        className="h-12 w-full rounded-xl border border-slate-200 px-3 text-base tabular-nums outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        placeholder={placeholder}
      />
      <span className="text-xs text-slate-500">{formatIndianNumber(value)}</span>
    </label>
  );
}
