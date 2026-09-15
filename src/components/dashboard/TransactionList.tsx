"use client";

import {
  BookOpen,
  BriefcaseBusiness,
  Bus,
  GraduationCap,
  Home,
  MoreHorizontal,
  Plus,
  ShoppingBag,
  Trash2,
  Utensils,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteTransaction,
  type SerializedTransaction,
} from "@/src/actions/transactions";
import { formatCompactDate, formatCurrency } from "@/src/lib/formatters";
import { AutoDismissToast } from "@/src/components/ui/AutoDismissToast";

type TransactionListProps = Readonly<{
  transactions: readonly SerializedTransaction[];
}>;

const categoryIcons = {
  HOME: Home,
  EDUCATION: GraduationCap,
  SHOPPING: ShoppingBag,
  TRANSPORT: Bus,
  NUTRITION: Utensils,
  FREELANCE: BriefcaseBusiness,
  SALARY: BriefcaseBusiness,
  OTHER: MoreHorizontal,
} as const;

function openSmartEntryModal(): void {
  window.dispatchEvent(new Event("pocketwise:open-entry-modal"));
}

export function TransactionList({ transactions }: TransactionListProps) {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string): void {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteTransaction(id);

      setDeletingId(null);

      if (!result.success) {
        setToast(result.error);
        return;
      }

      setToast("Transaction deleted.");
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Latest entries</h2>
          <p className="mt-1 text-sm text-slate-500">Your most recent activity.</p>
        </div>
        <BookOpen className="h-5 w-5 text-brand-primary" aria-hidden="true" />
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-100 bg-emerald-50/50 p-5 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-primary shadow-sm">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-800">
            Start your ledger
          </p>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
            Add your first income or expense to unlock trends, buffer tracking,
            and smarter insights.
          </p>
          <button
            type="button"
            onClick={openSmartEntryModal}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add entry
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {transactions.map((transaction) => {
            const Icon = categoryIcons[transaction.category];
            const isIncome = transaction.type === "INCOME";
            const isDeleting = isPending && deletingId === transaction.id;

            return (
              <li key={transaction.id} className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface text-brand-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {transaction.note ?? transaction.category.toLowerCase()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {transaction.category} · {formatCompactDate(transaction.date)}
                  </p>
                </div>
                <p
                  className={
                    isIncome
                      ? "font-mono text-sm font-semibold tabular-nums text-brand-primary"
                      : "font-mono text-sm font-semibold tabular-nums text-slate-800"
                  }
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(transaction.id)}
                  disabled={isPending}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2
                    className={isDeleting ? "h-4 w-4 animate-pulse" : "h-4 w-4"}
                    aria-hidden="true"
                  />
                  <span className="sr-only">Delete transaction</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {toast ? <AutoDismissToast key={toast} message={toast} /> : null}
    </section>
  );
}
