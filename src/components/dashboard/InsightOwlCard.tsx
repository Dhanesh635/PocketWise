import { Bird } from "lucide-react";

type InsightOwlCardProps = Readonly<{
  headline: string;
  actionableTip: string;
}>;

export function InsightOwlCard({
  headline,
  actionableTip,
}: InsightOwlCardProps) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-sm">
          <Bird className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-brand-primary">Insight Owl</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-800">
            {headline}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {actionableTip}
          </p>
        </div>
      </div>
    </section>
  );
}
