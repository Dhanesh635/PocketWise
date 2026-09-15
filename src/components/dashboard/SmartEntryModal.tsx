"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { createTransaction } from "@/src/actions/transactions";
import { cn } from "@/lib/utils";
import { AutoDismissToast } from "@/src/components/ui/AutoDismissToast";
import {
  categoriesByMode,
  defaultCategoryByMode,
  entryModes,
  type EntryCategory,
  type EntryMode,
} from "@/src/components/dashboard/smart-entry-options";

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SmartEntryModal() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<EntryMode>("EXPENSE");
  const [category, setCategory] = useState<EntryCategory>("NUTRITION");
  const [toast, setToast] = useState<string | null>(null);

  const categories = categoriesByMode[mode];

  useEffect(() => {
    function openModal(): void {
      setIsOpen(true);
    }

    window.addEventListener("pocketwise:open-entry-modal", openModal);

    return () => {
      window.removeEventListener("pocketwise:open-entry-modal", openModal);
    };
  }, []);

  function handleModeChange(nextMode: EntryMode): void {
    setMode(nextMode);
    setCategory(defaultCategoryByMode[nextMode]);
  }

  function handleSubmit(formData: FormData): void {
    startTransition(async () => {
      const result = await createTransaction({
        amount: formData.get("amount"),
        type: mode,
        category,
        date: formData.get("date"),
        note: formData.get("note"),
        isRecurring: formData.get("isRecurring") === "on",
      });

      if (!result.success) {
        setToast(result.error);
        return;
      }

      setToast("Transaction added.");
      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-20 inline-flex h-14 items-center gap-2 rounded-2xl bg-brand-primary px-5 text-sm font-semibold text-white shadow-card-hover transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        Add Entry
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-30 flex items-end bg-slate-900/30 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
          <section className="w-full rounded-2xl border border-slate-100 bg-white p-5 text-slate-800 shadow-card-hover sm:max-w-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Add entry</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Log income and expenses for your daily cash flow.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <form action={handleSubmit} className="mt-5 space-y-5">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                {entryModes.map((entryMode) => (
                  <button
                    key={entryMode.value}
                    type="button"
                    onClick={() => handleModeChange(entryMode.value)}
                    className={cn(
                      "h-10 rounded-lg text-xs font-semibold transition",
                      mode === entryMode.value
                        ? "bg-white text-brand-primary shadow-sm"
                        : "text-slate-500 hover:text-slate-800",
                    )}
                  >
                    {entryMode.label}
                  </button>
                ))}
              </div>

              <label className="block space-y-2 text-sm font-medium">
                <span>Amount</span>
                <input
                  name="amount"
                  inputMode="decimal"
                  placeholder="0.00"
                  required
                  className="h-14 w-full rounded-xl border border-slate-200 px-4 font-mono text-2xl tabular-nums outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </label>

              <div className="space-y-2">
                <p className="text-sm font-medium">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCategory(option)}
                      className={cn(
                        "h-9 rounded-xl border px-3 text-xs font-semibold transition",
                        category === option
                          ? "border-brand-primary bg-brand-surface text-brand-primary"
                          : "border-slate-200 text-slate-500 hover:border-slate-300",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-sm font-medium">
                  <span>Date</span>
                  <input
                    name="date"
                    type="date"
                    defaultValue={todayInputValue()}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </label>
                <label className="flex items-end gap-2 pb-3 text-sm text-slate-600">
                  <input name="isRecurring" type="checkbox" />
                  Recurring
                </label>
              </div>

              <label className="block space-y-2 text-sm font-medium">
                <span>Note</span>
                <input
                  name="note"
                  maxLength={255}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  placeholder="Optional"
                />
              </label>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save entry
              </button>
            </form>
          </section>
        </div>
      ) : null}

      {toast ? (
        <AutoDismissToast key={toast} message={toast} />
      ) : null}
    </>
  );
}
