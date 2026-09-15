import { TrendingUp } from "lucide-react";

import { generateFinancialInsight } from "@/src/actions/ai-insights";
import { getDashboardSummary } from "@/src/actions/dashboard";
import { getTransactions } from "@/src/actions/transactions";
import { InsightOwlCard } from "@/src/components/dashboard/InsightOwlCard";
import { LeftToSpendCard } from "@/src/components/dashboard/LeftToSpendCard";
import { SmartEntryModal } from "@/src/components/dashboard/SmartEntryModal";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { TransactionList } from "@/src/components/dashboard/TransactionList";
import { WeeklyChart } from "@/src/components/dashboard/WeeklyChart";
import { formatCurrency } from "@/src/lib/formatters";

const emptySummary = {
  currentMonthIncome: "0.00",
  currentMonthExpense: "0.00",
  netWorth: "0.00",
  overDailyAverage: "0.00",
  topCategory: "OTHER",
  topCategoryPct: 0,
  weekendSpendRatio: 0,
  dailyAverageSpend: "0.00",
  peakSpendingDay: "No peak",
  activityWindowLabel: "Today",
  leftToSpend: "0.00",
  totalMonthlyBudget: "0.00",
  weeklyOverview: [
    { day: "Mon", amount: "0.00", date: "empty-1", isPeak: false },
    { day: "Tue", amount: "0.00", date: "empty-2", isPeak: false },
    { day: "Wed", amount: "0.00", date: "empty-3", isPeak: false },
    { day: "Thu", amount: "0.00", date: "empty-4", isPeak: false },
    { day: "Fri", amount: "0.00", date: "empty-5", isPeak: false },
    { day: "Sat", amount: "0.00", date: "empty-6", isPeak: false },
    { day: "Sun", amount: "0.00", date: "empty-7", isPeak: false },
  ],
} as const;

function dailyAverageBadge(amount: string): string {
  const numericAmount = Number(amount);
  const direction = numericAmount >= 0 ? "over" : "under";

  return `You're ${formatCurrency(Math.abs(numericAmount))} ${direction} daily average`;
}

export default async function DashboardPage() {
  const [summaryResult, transactionsResult] = await Promise.all([
    getDashboardSummary(),
    getTransactions(5),
  ]);

  const summary = summaryResult.success ? summaryResult.data : emptySummary;
  const transactions = transactionsResult.success ? transactionsResult.data : [];
  const insight = await generateFinancialInsight(summary);
  const errorMessage = !summaryResult.success
    ? summaryResult.error
    : !transactionsResult.success
      ? transactionsResult.error
      : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-primary">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-800">
            Money overview
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Showing activity through {summary.activityWindowLabel}.
          </p>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-100 bg-white p-4 text-sm text-red-700 shadow-card">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid items-stretch gap-4 lg:grid-cols-3">
        <LeftToSpendCard
          leftToSpend={summary.leftToSpend}
          totalMonthlyBudget={summary.totalMonthlyBudget}
        />
        <StatCard
          title="Net Worth"
          amount={formatCurrency(summary.netWorth)}
          trend="Assets minus liabilities across your balance sheet."
          icon={TrendingUp}
        />
        <InsightOwlCard
          headline={insight.headline}
          actionableTip={insight.actionableTip}
        />
      </section>

      <section className="space-y-3">
        <div className="inline-flex rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-white shadow-sm">
          {dailyAverageBadge(summary.overDailyAverage)}
        </div>
        <WeeklyChart data={summary.weeklyOverview} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransactionList transactions={transactions} />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <p className="text-sm font-semibold text-brand-primary">Top category</p>
          <p className="mt-3 text-2xl font-semibold text-slate-800">
            {summary.topCategory}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {summary.topCategoryPct.toFixed(1)}% of monthly spending.
          </p>
        </div>
      </section>
      <SmartEntryModal />
    </div>
  );
}
