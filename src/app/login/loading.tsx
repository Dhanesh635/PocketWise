export default function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-surface px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
        <div className="h-4 w-24 rounded bg-slate-100" />
        <div className="mt-5 h-7 w-64 rounded bg-slate-100" />
        <div className="mt-3 h-4 w-full rounded bg-slate-100" />
        <div className="mt-8 space-y-5">
          <div className="h-11 rounded-xl bg-slate-100" />
          <div className="h-11 rounded-xl bg-slate-100" />
          <div className="h-11 rounded-xl bg-brand-primary/20" />
        </div>
      </div>
    </main>
  );
}
