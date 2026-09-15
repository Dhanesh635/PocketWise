import { WalletCards } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/src/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { UserMenu } from "@/src/components/dashboard/UserMenu";

type DashboardLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: currentUser.id },
    select: { isOnboarded: true },
  });

  if (!profile?.isOnboarded) {
    redirect("/onboarding");
  }

  async function logoutAction(): Promise<void> {
    "use server";

    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen bg-brand-surface text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-brand-surface/95 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-brand-primary transition hover:text-brand-dark"
            aria-label="Go to Pocketwise home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white shadow-sm">
              <WalletCards className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold">Pocketwise</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/invest"
              className="hidden h-10 items-center rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-brand-primary sm:inline-flex"
            >
              Invest
            </Link>
            <Link
              href="/dashboard/profile"
              className="hidden h-10 items-center rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-brand-primary sm:inline-flex"
            >
              Profile
            </Link>
            <UserMenu
              name={currentUser.name}
              email={currentUser.email}
              logoutAction={logoutAction}
            />
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
