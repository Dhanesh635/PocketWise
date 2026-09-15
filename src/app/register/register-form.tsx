"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";
import { registerWithCredentials } from "@/src/app/register/actions";
import type { RegisterActionState } from "@/src/app/register/actions";

const initialRegisterActionState: RegisterActionState = {
  status: "idle",
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Creating account
        </>
      ) : (
        <>
          Create account
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </>
      )}
    </button>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(
    registerWithCredentials,
    initialRegisterActionState,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.replace("/dashboard");
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="space-y-5">
      <label className="block space-y-2 text-sm font-medium text-slate-800">
        <span>Name</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          placeholder="Your name"
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-slate-800">
        <span>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          placeholder="you@example.com"
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-slate-800">
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          placeholder="At least 8 characters"
        />
      </label>

      <SubmitButton />

      <div
        role={state.status === "error" ? "alert" : "status"}
        aria-live="polite"
        className={cn(
          "fixed bottom-5 left-1/2 min-h-11 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border px-4 py-3 text-sm shadow-card transition",
          state.status === "idle" && "pointer-events-none translate-y-3 opacity-0",
          state.status === "error" && "border-red-100 bg-white text-red-700",
          state.status === "success" &&
            "border-brand-primary/40 bg-white text-brand-primary",
        )}
      >
        {state.message}
      </div>
    </form>
  );
}
