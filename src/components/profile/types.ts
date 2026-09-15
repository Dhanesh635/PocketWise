export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type GoalHorizon = "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM";
export type BalanceKind = "ASSET" | "LIABILITY";

export type ProfileSettings = Readonly<{
  age: string;
  riskLevel: RiskLevel;
  goalHorizon: GoalHorizon;
}>;

export type CashFlowBaseline = Readonly<{
  monthlyIncome: string;
  baselineMonthlyExpenses: string;
}>;

export type BalanceSheetItem = Readonly<{
  id: string;
  name: string;
  type: BalanceKind;
  valuation: string;
}>;
