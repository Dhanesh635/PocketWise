import { Loader2, LogIn } from "lucide-react";

import { signIn } from "@/src/auth";

type GoogleSignInProps = Readonly<{
  isEnabled: boolean;
}>;

export function GoogleSignIn({ isEnabled }: GoogleSignInProps) {
  async function signInWithGoogle(): Promise<void> {
    "use server";

    await signIn("google", { redirectTo: "/dashboard" });
  }

  return (
    <form action={isEnabled ? signInWithGoogle : undefined}>
      <button
        type="submit"
        disabled={!isEnabled}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-primary/40 hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        {isEnabled ? (
          <>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Continue with Google
          </>
        ) : (
          <>
            <Loader2 className="h-4 w-4" aria-hidden="true" />
            Google sign-in unavailable
          </>
        )}
      </button>
    </form>
  );
}
