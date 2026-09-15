import { redirect } from "next/navigation";
import Link from "next/link";

import { auth, isGoogleAuthConfigured } from "@/src/auth";
import { GoogleSignIn } from "@/src/components/auth/GoogleSignIn";
import { LoginForm } from "@/src/app/login/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const isGoogleEnabled = isGoogleAuthConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-surface px-5 py-10 text-slate-800">
      <section className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
        <div className="mb-8 space-y-2">
          <Link
            href="/"
            className="inline-flex text-sm font-semibold uppercase text-brand-primary transition hover:text-brand-dark"
          >
            Pocketwise
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800">
            Sign in to your account
          </h1>
          <p className="text-sm leading-6 text-slate-500">
            Track spending, net worth, and advisory insights from one calm
            dashboard.
          </p>
        </div>

        <div className="space-y-5">
          <GoogleSignIn isEnabled={isGoogleEnabled} />

          <div className="flex items-center gap-3 text-xs font-medium uppercase text-slate-400">
            <span className="h-px flex-1 bg-slate-100" />
            Or use email
            <span className="h-px flex-1 bg-slate-100" />
          </div>
        </div>

        <div className="mt-5">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to Pocketwise?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-primary transition hover:text-brand-dark"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
