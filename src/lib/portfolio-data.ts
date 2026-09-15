import { BalanceItemType, RiskTolerance, TransactionType } from "@prisma/client";
import Decimal from "decimal.js";

import { prisma } from "@/lib/prisma";

export type CuratedFund = Readonly<{
  amfiCode: string;
  name: string;
  category: string;
  riskLevel: RiskTolerance;
}>;

export async function getCuratedFundsForRisk(
  riskLevel: RiskTolerance,
): Promise<readonly CuratedFund[]> {
  return prisma.mutualFund.findMany({
    where: { riskLevel },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    take: 5,
    select: {
      amfiCode: true,
      name: true,
      category: true,
      riskLevel: true,
    },
  });
}

export async function getMonthlySurplusForUser(userId: string): Promise<Decimal> {
  const latestTransaction = await prisma.transaction.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });
  const anchorDate = latestTransaction?.date ?? new Date();
  const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const nextMonthStart = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth() + 1,
    1,
  );

  const [income, expense, profile] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.INCOME,
        date: { gte: monthStart, lt: nextMonthStart },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: { gte: monthStart, lt: nextMonthStart },
      },
      _sum: { amount: true },
    }),
    prisma.userProfile.findUnique({
      where: { userId },
      select: { monthlyIncome: true, baselineMonthlyExpenses: true },
    }),
  ]);

  const monthlyExpenses = new Decimal(expense._sum.amount?.toString() ?? 0);

  if (profile?.monthlyIncome && profile.baselineMonthlyExpenses) {
    return new Decimal(profile.monthlyIncome.toString())
      .minus(profile.baselineMonthlyExpenses.toString())
      .minus(monthlyExpenses);
  }

  return new Decimal(income._sum.amount?.toString() ?? 0).minus(monthlyExpenses);
}

export type BalanceSheetTotals = Readonly<{
  assets: Decimal;
  liabilities: Decimal;
  netWorth: Decimal;
}>;

export async function getBalanceSheetTotalsForUser(
  userId: string,
): Promise<BalanceSheetTotals> {
  const balanceGroups = await prisma.balanceItem.groupBy({
    by: ["type"],
    where: { userId },
    _sum: { valuation: true },
  });

  const assets = new Decimal(
    balanceGroups
      .find((group) => group.type === BalanceItemType.ASSET)
      ?._sum.valuation?.toString() ?? 0,
  );
  const liabilities = new Decimal(
    balanceGroups
      .find((group) => group.type === BalanceItemType.LIABILITY)
      ?._sum.valuation?.toString() ?? 0,
  );

  return {
    assets,
    liabilities,
    netWorth: assets.minus(liabilities),
  };
}
