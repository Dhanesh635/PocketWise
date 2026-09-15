import type { PortfolioRecommendation } from "@/src/actions/portfolio";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type GoalHorizon = "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM";

export type ChoiceOption<TValue extends string> = Readonly<{
  value: TValue;
  label: string;
  description: string;
}>;

export type Recommendation = PortfolioRecommendation;
