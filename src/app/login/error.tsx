"use client";

import { RotateCcw } from "lucide-react";

type LoginErrorProps = Readonly<{
  reset: () => void;
}>;

export default function LoginError({ reset }: LoginErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-surface px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-slate-800 shadow-card">
        <p className="text-sm font-semibold uppercase text-brand-primary">
          Pocketwise
        </p>
        <h1 className="mt-4 text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          The login screen could not finish loading. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      </section>
    </main>
  );
}
