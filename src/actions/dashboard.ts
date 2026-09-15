"use server";
import { BalanceItemType, TransactionType } from "@prisma/client";
import Decimal from "decimal.js";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import {
  addDays,
  buildWeeklyOverview,
  formatActivityWindow,
  startOfDay,
  toCurrencyString,
  toDecimal,
} from "@/src/lib/dashboard-math";
type ActionResult<TData> =
  | Readonly<{ success: true; data: TData }>
  | Readonly<{ success: false; error: string }>;
export type WeeklyOverviewItem = Readonly<{
  day: string;
  amount: string;
  date: string;
  isPeak: boolean;
}>;
export type DashboardSummary = Readonly<{
  currentMonthIncome: string;
  currentMonthExpense: string;
  netWorth: string;
  weeklyOverview: readonly WeeklyOverviewItem[];
  overDailyAverage: string;
  topCategory: string;
  topCategoryPct: number;
  weekendSpendRatio: number;
  dailyAverageSpend: string;
  peakSpendingDay: string;
  activityWindowLabel: string;
  leftToSpend: string;
  totalMonthlyBudget: string;
}>;

export async function getDashboardSummary(): Promise<ActionResult<DashboardSummary>> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, error: "You must be signed in." };
  }

  try {
    const latestTransaction = await prisma.transaction.findFirst({
      where: { userId: currentUser.id },
      orderBy: { date: "desc" },
      select: { date: true },
    });
    const anchorDate = latestTransaction?.date ?? new Date();
    const anchorStart = startOfDay(anchorDate);
    const nextAnchorDay = addDays(anchorStart, 1);
    const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const nextMonthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1);
    const weeklyStart = addDays(anchorStart, -6);
    const thirtyDayStart = addDays(anchorStart, -29);

    const [
      monthlyIncome,
      monthlyExpense,
      weeklyExpenseRows,
      thirtyDayExpenses,
      anchorDayExpenses,
      balanceGroups,
      categoryGroups,
      monthlyExpenseRows,
      profile,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: currentUser.id,
          type: TransactionType.INCOME,
          date: { gte: monthStart, lt: nextMonthStart },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: currentUser.id,
          type: TransactionType.EXPENSE,
          date: { gte: monthStart, lt: nextMonthStart },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where: {
          userId: currentUser.id,
          type: TransactionType.EXPENSE,
          date: { gte: weeklyStart, lt: nextAnchorDay },
        },
        select: { amount: true, date: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: currentUser.id,
          type: TransactionType.EXPENSE,
          date: { gte: thirtyDayStart, lt: nextAnchorDay },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: currentUser.id,
          type: TransactionType.EXPENSE,
          date: { gte: anchorStart, lt: nextAnchorDay },
        },
        _sum: { amount: true },
      }),
      prisma.balanceItem.groupBy({
        by: ["type"],
        where: { userId: currentUser.id },
        _sum: { valuation: true },
      }),
      prisma.transaction.groupBy({
        by: ["category"],
        where: {
          userId: currentUser.id,
          type: TransactionType.EXPENSE,
          date: { gte: monthStart, lt: nextMonthStart },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where: {
          userId: currentUser.id,
          type: TransactionType.EXPENSE,
          date: { gte: monthStart, lt: nextMonthStart },
        },
        select: { amount: true, date: true },
      }),
      prisma.userProfile.findUnique({
        where: { userId: currentUser.id },
        select: { monthlyIncome: true, baselineMonthlyExpenses: true },
      }),
    ]);

    const weeklyOverview = buildWeeklyOverview(anchorDate, weeklyExpenseRows);
    const totalIncome = toDecimal(monthlyIncome._sum.amount);
    const totalExpense = toDecimal(monthlyExpense._sum.amount);
    const baselineIncome = toDecimal(profile?.monthlyIncome);
    const baselineExpenses = toDecimal(profile?.baselineMonthlyExpenses);
    const totalMonthlyBudget = baselineIncome.minus(baselineExpenses);
    const leftToSpend = totalMonthlyBudget.minus(totalExpense);
    const dailyAverageSpend = toDecimal(thirtyDayExpenses._sum.amount).div(30);
    const topCategoryGroup = categoryGroups.reduce(
      (largest, group) =>
        toDecimal(group._sum.amount).gt(toDecimal(largest?._sum.amount))
          ? group
          : largest,
      categoryGroups[0],
    );
    const weekendSpend = monthlyExpenseRows.reduce((total, transaction) => {
      const dayOfWeek = transaction.date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6
        ? total.plus(transaction.amount.toString())
        : total;
    }, new Decimal(0));
    const netWorth = balanceGroups.reduce((total, group) => {
      const amount = toDecimal(group._sum.valuation);
      return group.type === BalanceItemType.ASSET
        ? total.plus(amount)
        : total.minus(amount);
    }, new Decimal(0));
    const peakDay = weeklyOverview.find((item) => item.isPeak)?.day ?? "No peak";

    return {
      success: true,
      data: {
        currentMonthIncome: toCurrencyString(totalIncome),
        currentMonthExpense: toCurrencyString(totalExpense),
        netWorth: toCurrencyString(netWorth),
        weeklyOverview,
        overDailyAverage: toCurrencyString(
          toDecimal(anchorDayExpenses._sum.amount).minus(dailyAverageSpend),
        ),
        topCategory: topCategoryGroup?.category ?? "OTHER",
        topCategoryPct: totalExpense.gt(0)
          ? toDecimal(topCategoryGroup?._sum.amount).div(totalExpense).mul(100).toNumber()
          : 0,
        weekendSpendRatio: totalExpense.gt(0)
          ? weekendSpend.div(totalExpense).toNumber()
          : 0,
        dailyAverageSpend: toCurrencyString(dailyAverageSpend),
        peakSpendingDay: peakDay,
        activityWindowLabel: formatActivityWindow(anchorDate),
        leftToSpend: toCurrencyString(leftToSpend),
        totalMonthlyBudget: toCurrencyString(totalMonthlyBudget),
      },
    };
  } catch {
    return { success: false, error: "Unable to load the dashboard summary." };
  }
}
