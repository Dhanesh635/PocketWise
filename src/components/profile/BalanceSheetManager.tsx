"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { addBalanceItem, deleteBalanceItem } from "@/src/actions/profile";
import { formatCurrency } from "@/src/lib/formatters";
import {
  formatIndianNumber,
  sanitizeWholeRupeeInput,
} from "@/src/lib/currency-input";
import type { BalanceKind, BalanceSheetItem } from "@/src/components/profile/types";

type BalanceSheetManagerProps = Readonly<{
  items: readonly BalanceSheetItem[];
  assetTotal: string;
  liabilityTotal: string;
  netWorth: string;
}>;

const initialItemForm = {
  name: "",
  type: "ASSET" as BalanceKind,
  valuation: "",
};

function ItemGroup({
  title,
  items,
  onDelete,
  isPending,
}: Readonly<{
  title: string;
  items: readonly BalanceSheetItem[];
  onDelete: (id: string) => void;
  isPending: boolean;
}>) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            No items yet.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">{formatCurrency(item.valuation)}</p>
              </div>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                disabled={isPending}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Delete {item.name}</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function BalanceSheetManager({
  items,
  assetTotal,
  liabilityTotal,
  netWorth,
}: BalanceSheetManagerProps) {
  const router = useRouter();
  const [fields, setFields] = useState(initialItemForm);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const assets = items.filter((item) => item.type === "ASSET");
  const liabilities = items.filter((item) => item.type === "LIABILITY");

  function handleAddItem(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    startTransition(async () => {
      const result = await addBalanceItem({
        ...fields,
        valuation: parseInt(fields.valuation || "0", 10),
      });
      setMessage(result.success ? "Balance item added." : result.error);
      if (result.success) {
        setFields(initialItemForm);
        router.refresh();
      }
    });
  }

  function handleDeleteItem(id: string): void {
    startTransition(async () => {
      const result = await deleteBalanceItem(id);
      setMessage(result.success ? "Balance item deleted." : result.error);
      if (result.success) router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Balance Sheet</h2>
          <p className="mt-1 text-sm text-slate-500">
            Current net worth:{" "}
            <span className="font-semibold text-brand-primary">
              {formatCurrency(netWorth)}
            </span>
          </p>
        </div>
        <div className="flex gap-2 text-xs font-semibold text-slate-500">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-brand-primary">
            Assets {formatCurrency(assetTotal)}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            Liabilities {formatCurrency(liabilityTotal)}
          </span>
        </div>
      </div>

      <form onSubmit={handleAddItem} className="mt-5 grid gap-3 sm:grid-cols-[1fr_140px_140px_auto]">
        <input
          required
          maxLength={100}
          value={fields.name}
          onChange={(event) => setFields({ ...fields, name: event.target.value })}
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          placeholder="Savings, gold, loan..."
        />
        <select
          value={fields.type}
          onChange={(event) =>
            setFields({ ...fields, type: event.target.value as BalanceKind })
          }
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        >
          <option value="ASSET">Asset</option>
          <option value="LIABILITY">Liability</option>
        </select>
        <input
          required
          type="number"
          min={0}
          step={1}
          value={fields.valuation}
          onChange={(event) =>
            setFields({
              ...fields,
              valuation: sanitizeWholeRupeeInput(event.target.value),
            })
          }
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm tabular-nums outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          placeholder="Amount"
        />
        <p className="text-xs text-slate-500 sm:hidden">
          {formatIndianNumber(fields.valuation)}
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </button>
      </form>

      {message ? <p className="mt-3 text-sm text-slate-500">{message}</p> : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ItemGroup title="Assets" items={assets} onDelete={handleDeleteItem} isPending={isPending} />
        <ItemGroup title="Liabilities" items={liabilities} onDelete={handleDeleteItem} isPending={isPending} />
      </div>
    </section>
  );
}
