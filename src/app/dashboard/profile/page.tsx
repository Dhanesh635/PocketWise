import { redirect } from "next/navigation";
import Decimal from "decimal.js";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { BalanceSheetManager } from "@/src/components/profile/BalanceSheetManager";
import { CashFlowBaselineForm } from "@/src/components/profile/CashFlowBaselineForm";
import { PersonalDemographicsForm } from "@/src/components/profile/PersonalDemographicsForm";

function decimalToString(value: { toString(): string } | null | undefined): string {
  return value?.toString() ?? "";
}

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const [profile, portfolio, balanceItems] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId: currentUser.id },
      select: {
        age: true,
        monthlyIncome: true,
        baselineMonthlyExpenses: true,
      },
    }),
    prisma.userPortfolio.findUnique({
      where: { userId: currentUser.id },
      select: { riskLevel: true, goalHorizon: true },
    }),
    prisma.balanceItem.findMany({
      where: { userId: currentUser.id },
      orderBy: [{ type: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        name: true,
        type: true,
        valuation: true,
      },
    }),
  ]);

  const assetTotal = balanceItems.reduce(
    (total, item) =>
      item.type === "ASSET" ? total.plus(item.valuation.toString()) : total,
    new Decimal(0),
  );
  const liabilityTotal = balanceItems.reduce(
    (total, item) =>
      item.type === "LIABILITY" ? total.plus(item.valuation.toString()) : total,
    new Decimal(0),
  );

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase text-brand-primary">
          Profile
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-800">
          Financial settings
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage long-term assumptions separately from daily cash flow.
        </p>
      </section>

      <PersonalDemographicsForm
        settings={{
          age: profile?.age ? String(profile.age) : "",
          riskLevel: portfolio?.riskLevel ?? "MEDIUM",
          goalHorizon: portfolio?.goalHorizon ?? "MEDIUM_TERM",
        }}
      />

      <CashFlowBaselineForm
        baseline={{
          monthlyIncome: decimalToString(profile?.monthlyIncome),
          baselineMonthlyExpenses: decimalToString(
            profile?.baselineMonthlyExpenses,
          ),
        }}
      />

      <BalanceSheetManager
        items={balanceItems.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          valuation: item.valuation.toString(),
        }))}
        assetTotal={assetTotal.toFixed(2)}
        liabilityTotal={liabilityTotal.toFixed(2)}
        netWorth={assetTotal.minus(liabilityTotal).toFixed(2)}
      />
    </div>
  );
}
