"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { submitOnboarding } from "@/src/actions/onboarding";
import { OnboardingCurrencyInput } from "@/src/app/onboarding/OnboardingCurrencyInput";

type OnboardingFormFields = Readonly<{
  age: string;
  gender: string;
  monthlyIncome: string;
  baselineMonthlyExpenses: string;
  bankSavings: string;
  outstandingDebt: string;
}>;

const initialFields: OnboardingFormFields = {
  age: "",
  gender: "",
  monthlyIncome: "",
  baselineMonthlyExpenses: "",
  bankSavings: "",
  outstandingDebt: "",
};

export function OnboardingForm() {
  const router = useRouter();
  const [fields, setFields] = useState(initialFields);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField(field: keyof OnboardingFormFields, value: string): void {
    setFields((currentFields) => ({ ...currentFields, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(null);
    const payload = {
      ...fields,
      monthlyIncome: parseInt(fields.monthlyIncome || "0", 10),
      baselineMonthlyExpenses: parseInt(
        fields.baselineMonthlyExpenses || "0",
        10,
      ),
      bankSavings: parseInt(fields.bankSavings || "0", 10),
      outstandingDebt: parseInt(fields.outstandingDebt || "0", 10),
    };

    startTransition(async () => {
      const result = await submitOnboarding(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-800">
          <span>Age</span>
          <input
            type="number"
            min={16}
            max={100}
            required
            value={fields.age}
            onChange={(event) => updateField("age", event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="27"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-800">
          <span>Gender</span>
          <select
            required
            value={fields.gender}
            onChange={(event) => updateField("gender", event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="">Select</option>
            <option value="Woman">Woman</option>
            <option value="Man">Man</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </label>
      </div>

      <OnboardingCurrencyInput
        label="Average Monthly Income"
        value={fields.monthlyIncome}
        placeholder="57000"
        onChange={(value) => updateField("monthlyIncome", value)}
      />

      <OnboardingCurrencyInput
        label="Average Monthly Expenses"
        value={fields.baselineMonthlyExpenses}
        placeholder="22000"
        onChange={(value) => updateField("baselineMonthlyExpenses", value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <OnboardingCurrencyInput
          label="Bank Balance / Savings"
          value={fields.bankSavings}
          placeholder="65000"
          onChange={(value) => updateField("bankSavings", value)}
        />

        <OnboardingCurrencyInput
          label="Outstanding Debt"
          value={fields.outstandingDebt}
          placeholder="88000"
          onChange={(value) => updateField("outstandingDebt", value)}
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Saving baseline
          </>
        ) : (
          <>
            Open my dashboard
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
