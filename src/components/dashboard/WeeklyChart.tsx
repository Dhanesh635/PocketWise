"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { WeeklyOverviewItem } from "@/src/actions/dashboard";
import { formatCurrency } from "@/src/lib/formatters";

type WeeklyChartProps = Readonly<{
  data: readonly WeeklyOverviewItem[];
}>;

export function WeeklyChart({ data }: WeeklyChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    value: Number(item.amount),
  }));
  const hasSpending = chartData.some((item) => item.value > 0);

  function formatChartValue(value: unknown): string {
    return typeof value === "number" ? formatCurrency(value) : "";
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800">Weekly spending</h2>
        <p className="mt-1 text-sm text-slate-500">Last 7 days of expenses.</p>
      </div>

      {!hasSpending ? (
        <div className="flex h-56 min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-100 bg-emerald-50/50 px-6 text-center sm:h-64">
          <p className="text-sm font-semibold text-brand-primary">
            No expenses recorded this week
          </p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
            Your buffer is fully intact. Add an expense when spending happens.
          </p>
        </div>
      ) : (
      <div className="h-56 min-h-56 w-full sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: -24, right: 4, top: 24 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
            />
            <YAxis hide domain={[0, hasSpending ? "dataMax + 500" : 100]} />
            <Tooltip
              cursor={{ fill: "#F1F5F9" }}
              formatter={formatChartValue}
              labelClassName="text-xs text-slate-500"
              contentStyle={{
                border: "1px solid #F1F5F9",
                borderRadius: "12px",
                boxShadow: "0 10px 30px -15px rgb(15 23 42 / 0.25)",
              }}
            />
            <Bar dataKey="value" name="Spent" radius={[8, 8, 0, 0]}>
              <LabelList
                dataKey="value"
                position="top"
                formatter={formatChartValue}
                className="fill-slate-500 text-[11px] font-medium"
              />
              {chartData.map((item) => (
                <Cell
                  key={item.date}
                  fill={item.isPeak ? "#19664D" : "#D1E7DD"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}
    </section>
  );
}
