"use client";

const skeletonRows = ["core", "satellite", "buffer"] as const;

export function WizardLoadingStep() {
  return (
    <div className="min-h-72 rounded-2xl border border-slate-100 bg-brand-surface p-5">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold text-brand-primary">
          Fetching live AMFI Net Asset Values...
        </p>
        <p className="text-sm text-slate-500">
          Synthesizing Core & Satellite SIP allocation...
        </p>
      </div>

      <div className="mt-6 grid gap-3">
        {skeletonRows.map((row) => (
          <div
            key={row}
            className="animate-pulse rounded-2xl border border-white bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="h-3 w-24 rounded-full bg-slate-200" />
                <div className="h-4 w-44 rounded-full bg-slate-200" />
              </div>
              <div className="h-8 w-20 rounded-full bg-emerald-100" />
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div className="h-2 w-2/3 rounded-full bg-brand-primary/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
