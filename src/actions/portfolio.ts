"use server";
import { InvestmentGoal, RiskTolerance } from "@prisma/client";
import Decimal from "decimal.js";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { getLiveFundData, type LiveFundData } from "@/src/lib/mfapi";
import {
  getBalanceSheetTotalsForUser,
  getMonthlySurplusForUser,
  type CuratedFund,
} from "@/src/lib/portfolio-data";
import { getFallbackFunds, getFundBasket } from "@/src/lib/portfolio-basket";
import {
  generatePortfolioGemini,
  type GeminiSipRecommendation,
  type RecommendedFund,
} from "@/src/lib/portfolio-gemini";
type ActionResult<TData> =
  | Readonly<{ success: true; data: TData }>
  | Readonly<{ success: false; error: string }>;
export type SipRecommendedFund = Readonly<{
  name: string;
  amfiCode: string;
  currentNAV: string;
  allocatedSIP: string;
  rationale: string;
}>;
export type PortfolioRecommendation = Readonly<{
  riskLevel: RiskTolerance;
  goalHorizon: InvestmentGoal;
  monthlySurplus: string;
  source: "gemini" | "fallback";
  strategy: string;
  recommendedFunds: readonly SipRecommendedFund[];
}>;

const portfolioSchema = z.object({
  riskLevel: z.enum(RiskTolerance),
  goalHorizon: z.enum(InvestmentGoal),
});
function toSipAmount(value: Decimal): string {
  return value.isNegative() ? "0.00" : value.toFixed(2);
}

function splitSurplusExactly(
  monthlySurplus: Decimal,
  allocationCount: number,
): readonly string[] {
  const safeCount = Math.max(allocationCount, 1);
  const totalPaise = monthlySurplus.isNegative()
    ? new Decimal(0)
    : monthlySurplus.mul(100).toDecimalPlaces(0, Decimal.ROUND_DOWN);
  const basePaise = totalPaise.div(safeCount).floor();
  const remainderPaise = totalPaise.minus(basePaise.mul(safeCount)).toNumber();
  return Array.from({ length: safeCount }, (_, index) =>
    basePaise
      .plus(index < remainderPaise ? 1 : 0)
      .div(100)
      .toFixed(2),
  );
}

function createFallbackRecommendations(
  funds: readonly CuratedFund[],
  liveFunds: readonly LiveFundData[],
  monthlySurplus: Decimal,
  riskLevel: RiskTolerance,
): readonly SipRecommendedFund[] {
  const selectedFunds = getFallbackFunds(funds, riskLevel);
  const splitAmounts = splitSurplusExactly(monthlySurplus, selectedFunds.length);

  return selectedFunds.map((fund, index) => {
    const liveFund = liveFunds.find((item) => item.amfiCode === fund.amfiCode);
    return {
      name: liveFund?.name ?? fund.name,
      amfiCode: fund.amfiCode,
      currentNAV: liveFund?.latestNAV ?? "Unavailable",
      allocatedSIP: splitAmounts[index] ?? "0.00",
      rationale: `${fund.category} exposure fits a ${fund.riskLevel.toLowerCase()} risk profile while keeping the recommendation within Pocketwise's curated fund universe.`,
    };
  });
}

function createFallbackStrategy(riskLevel: RiskTolerance): string {
  return riskLevel === RiskTolerance.HIGH
    ? "Pocketwise used a Core & Satellite fallback: a steadier core holding paired with measured satellite exposure while preserving room for liquidity."
    : "Pocketwise used a conservative Core & Liquid fallback that favors diversified core exposure and keeps the recommendation simple.";
}

function normalizeAiRecommendations(
  recommendations: readonly RecommendedFund[],
  monthlySurplus: Decimal,
): readonly SipRecommendedFund[] {
  const totalAllocated = recommendations.reduce(
    (total, fund) => total.plus(fund.allocatedSIP.replace(/[^\d.]/g, "") || 0),
    new Decimal(0),
  );

  if (totalAllocated.equals(monthlySurplus)) {
    return recommendations;
  }

  const splitAmounts = splitSurplusExactly(monthlySurplus, recommendations.length);

  return recommendations.map((fund, index) => ({
    ...fund,
    allocatedSIP: splitAmounts[index] ?? "0.00",
  }));
}

export async function calculatePortfolio(
  riskLevel: string,
  goalHorizon: string,
): Promise<ActionResult<PortfolioRecommendation>> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, error: "You must be signed in." };
  }

  const parsedInput = portfolioSchema.safeParse({ riskLevel, goalHorizon });

  if (!parsedInput.success) {
    return { success: false, error: "Choose a valid risk level and horizon." };
  }

  const [fundBasket, monthlySurplus, balanceSheetTotals] = await Promise.all([
    getFundBasket(parsedInput.data.riskLevel),
    getMonthlySurplusForUser(currentUser.id),
    getBalanceSheetTotalsForUser(currentUser.id),
  ]);

  if (fundBasket.length === 0) {
    return {
      success: false,
      error: "No curated mutual funds are available for this risk profile.",
    };
  }

  const liveFunds = (
    await Promise.all(
      fundBasket.map((fund) => getLiveFundData(fund.amfiCode)),
    )
  ).filter((fund): fund is LiveFundData => fund !== null);

  let geminiRecommendation: GeminiSipRecommendation | null = null;

  try {
    geminiRecommendation = await generatePortfolioGemini({
      riskLevel: parsedInput.data.riskLevel,
      goalHorizon: parsedInput.data.goalHorizon,
      monthlySurplus,
      assets: balanceSheetTotals.assets,
      liabilities: balanceSheetTotals.liabilities,
      netWorth: balanceSheetTotals.netWorth,
      funds: liveFunds,
    });
  } catch (error) {
    console.error("[Gemini Portfolio Error]:", error);
  }

  const recommendedFunds = geminiRecommendation
    ? normalizeAiRecommendations(
        geminiRecommendation.recommendedFunds,
        monthlySurplus,
      )
    : createFallbackRecommendations(
        fundBasket,
        liveFunds,
        monthlySurplus,
        parsedInput.data.riskLevel,
      );

  return {
    success: true,
    data: {
      riskLevel: parsedInput.data.riskLevel,
      goalHorizon: parsedInput.data.goalHorizon,
      monthlySurplus: toSipAmount(monthlySurplus),
      source: geminiRecommendation ? "gemini" : "fallback",
      strategy:
        geminiRecommendation?.strategy ??
        createFallbackStrategy(parsedInput.data.riskLevel),
      recommendedFunds,
    },
  };
}
