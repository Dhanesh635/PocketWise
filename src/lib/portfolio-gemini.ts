import { GoogleGenerativeAI } from "@google/generative-ai";
import Decimal from "decimal.js";
import { z } from "zod";

import type { LiveFundData } from "@/src/lib/mfapi";

const recommendedFundSchema = z.object({
  name: z.string().trim().min(1),
  amfiCode: z.string().trim().min(1),
  currentNAV: z.string().trim().min(1),
  allocatedSIP: z.string().trim().min(1),
  rationale: z.string().trim().min(1).max(240),
});

const recommendationResponseSchema = z.object({
  strategy: z.string().trim().min(1).max(420),
  recommendedFunds: z.array(recommendedFundSchema).length(3),
});

export type GeminiSipRecommendation = z.infer<
  typeof recommendationResponseSchema
>;
export type RecommendedFund = z.infer<typeof recommendedFundSchema>;

type GeminiRecommendationInput = Readonly<{
  riskLevel: string;
  goalHorizon: string;
  monthlySurplus: Decimal;
  assets: Decimal;
  liabilities: Decimal;
  netWorth: Decimal;
  funds: readonly LiveFundData[];
}>;

const systemInstruction =
  "You are a fiduciary. You must select exactly 3 funds from the provided list to build a balanced portfolio using Core & Satellite construction. If High Risk: Allocate about 50% to Satellite (Small/Mid Cap), about 40% to Core (Flexi/Large Cap), and about 10% to Buffer (Liquid). If Medium Risk: Allocate about 60% to Core, about 20% to Satellite, and about 20% to Buffer. If Low Risk: Allocate about 70% to Core and about 30% to Buffer. Do not allocate 100% of the user's surplus into a single risk category. Respect the user's existing balance sheet and prioritize high-interest debt clearing if liabilities are excessive. Output strictly as JSON matching the requested schema, with no markdown formatting.";

function getGeminiTimeoutMs(): number {
  const timeoutMs = Number(process.env.GEMINI_RECOMMENDATION_TIMEOUT_MS);
  return Number.isFinite(timeoutMs) && timeoutMs >= 5000 ? timeoutMs : 15000;
}

function buildPrompt(input: GeminiRecommendationInput): string {
  const userContext = {
    leftToSpend: input.monthlySurplus.toFixed(2),
    riskLevel: input.riskLevel,
    goalHorizon: input.goalHorizon,
    balanceSheet: {
      assets: input.assets.toFixed(2),
      liabilities: input.liabilities.toFixed(2),
      netWorth: input.netWorth.toFixed(2),
    },
  };

  return [
    systemInstruction,
    `User context: ${JSON.stringify(userContext)}.`,
    `Live market candidates: ${JSON.stringify(input.funds)}.`,
    "Select exactly 3 funds from the candidates.",
    "Calculate exact monthly SIP amount for each, totaling the user's left-to-spend amount.",
    "Explain why in 1 sentence per fund.",
    'Return this strict JSON schema only: {"strategy":"","recommendedFunds":[{"name":"","amfiCode":"","currentNAV":"","allocatedSIP":"","rationale":""},{"name":"","amfiCode":"","currentNAV":"","allocatedSIP":"","rationale":""},{"name":"","amfiCode":"","currentNAV":"","allocatedSIP":"","rationale":""}]}',
  ].join("\n");
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("Gemini portfolio request timed out.")),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function generatePortfolioGemini(
  input: GeminiRecommendationInput,
): Promise<GeminiSipRecommendation | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || input.funds.length === 0) {
    return null;
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await withTimeout(
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      getGeminiTimeoutMs(),
    );

    const content = result.response.text();
    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(content);
    } catch (error) {
      console.error("[Gemini JSON Parse Error]:", error);
      return null;
    }

    const parsedResponse = recommendationResponseSchema.safeParse(parsedJson);

    if (!parsedResponse.success) {
      console.error("[Gemini Portfolio Error]:", parsedResponse.error);
      return null;
    }

    return parsedResponse.data;
  } catch (error) {
    console.error("[Gemini Portfolio Error]:", error);
    return null;
  }
}
