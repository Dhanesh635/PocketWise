import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, isGoogleAuthConfigured } from "@/src/auth";
import { RegisterForm } from "@/src/app/register/register-form";
import { GoogleSignIn } from "@/src/components/auth/GoogleSignIn";

export default async function RegisterPage() {
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
            Create your account
          </h1>
          <p className="text-sm leading-6 text-slate-500">
            Start with secure sign-in, then build your transaction history at
            your own pace.
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
          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-primary transition hover:text-brand-dark"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
