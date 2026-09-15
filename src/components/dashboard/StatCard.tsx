import type { LucideIcon } from "lucide-react";

type StatCardProps = Readonly<{
  title: string;
  amount: string;
  trend: string;
  icon: LucideIcon;
}>;

export function StatCard({ title, amount, trend, icon: Icon }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-slate-800">
            {amount}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-surface text-brand-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{trend}</p>
    </article>
  );
}
