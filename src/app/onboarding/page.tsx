import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/src/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/src/app/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { isOnboarded: true },
  });

  if (profile?.isOnboarded) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-brand-surface px-5 py-10 text-slate-800">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex text-sm font-semibold uppercase text-brand-primary transition hover:text-brand-dark"
          >
            Pocketwise
          </Link>
          <h1 className="mt-5 text-2xl font-semibold text-slate-900">
            Let&apos;s set your financial baseline
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            These starting numbers help Pocketwise calculate net worth, savings
            behavior, and useful advisory insights from day one.
          </p>
        </div>

        <OnboardingForm />
      </section>
    </main>
  );
}
