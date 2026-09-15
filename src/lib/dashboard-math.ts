import Decimal from "decimal.js";
import type { WeeklyOverviewItem } from "@/src/actions/dashboard";

export type DecimalLike = Readonly<{
  toString(): string;
}>;

const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function dayLabel(date: Date): string {
  return dayFormatter.format(date);
}

export function toCurrencyString(value: Decimal): string {
  return value.toDecimalPlaces(2).toFixed(2);
}

export function toDecimal(value: DecimalLike | null | undefined): Decimal {
  return value ? new Decimal(value.toString()) : new Decimal(0);
}

type ExpensePoint = Readonly<{
  amount: DecimalLike;
  date: Date;
}>;

export function buildWeeklyOverview(
  anchorDate: Date,
  expenses: readonly ExpensePoint[],
): readonly WeeklyOverviewItem[] {
  const weekStart = addDays(startOfDay(anchorDate), -6);
  const totals = new Map<string, Decimal>();

  for (const expense of expenses) {
    const key = dateKey(expense.date);
    totals.set(key, (totals.get(key) ?? new Decimal(0)).plus(expense.amount.toString()));
  }

  const peakAmount = [...totals.values()].reduce(
    (largest, amount) => Decimal.max(largest, amount),
    new Decimal(0),
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const amount = totals.get(dateKey(date)) ?? new Decimal(0);

    return {
      day: dayLabel(date),
      amount: toCurrencyString(amount),
      date: dateKey(date),
      isPeak: peakAmount.gt(0) && amount.eq(peakAmount),
    };
  });
}

export function formatActivityWindow(anchorDate: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(anchorDate);
}
