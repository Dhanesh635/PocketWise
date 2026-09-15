import { RiskTolerance } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CuratedFund } from "@/src/lib/portfolio-data";

type FundCategory =
  | "Liquid"
  | "Large Cap / Index"
  | "Flexi Cap"
  | "Mid Cap"
  | "Small Cap";

const basketPlan: Record<RiskTolerance, readonly [FundCategory, number][]> = {
  LOW: [["Large Cap / Index", 2], ["Liquid", 2]],
  MEDIUM: [["Mid Cap", 1], ["Flexi Cap", 1], ["Large Cap / Index", 1], ["Liquid", 1]],
  HIGH: [["Small Cap", 1], ["Mid Cap", 1], ["Flexi Cap", 1], ["Liquid", 1]],
};

const fallbackPlan: Record<RiskTolerance, readonly FundCategory[]> = {
  LOW: ["Large Cap / Index", "Large Cap / Index", "Liquid"],
  MEDIUM: ["Flexi Cap", "Mid Cap", "Liquid"],
  HIGH: ["Small Cap", "Flexi Cap", "Liquid"],
};

async function getFundsByCategory(
  category: FundCategory,
  take: number,
): Promise<readonly CuratedFund[]> {
  return prisma.mutualFund.findMany({
    where: { category },
    orderBy: { name: "asc" },
    take,
    select: { amfiCode: true, name: true, category: true, riskLevel: true },
  });
}

export async function getFundBasket(
  riskProfile: RiskTolerance,
): Promise<readonly CuratedFund[]> {
  const categoryGroups = await Promise.all(
    basketPlan[riskProfile].map(([category, take]) =>
      getFundsByCategory(category, take),
    ),
  );

  return categoryGroups.flat();
}

export function getFallbackFunds(
  funds: readonly CuratedFund[],
  riskLevel: RiskTolerance,
): readonly CuratedFund[] {
  const remainingFunds = [...funds];

  return fallbackPlan[riskLevel]
    .map((category) => {
      const index = remainingFunds.findIndex((fund) => fund.category === category);
      return index >= 0 ? remainingFunds.splice(index, 1)[0] : undefined;
    })
    .filter((fund): fund is CuratedFund => fund !== undefined)
    .concat(remainingFunds)
    .slice(0, 3);
}
