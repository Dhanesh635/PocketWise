"use server";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import type { DashboardSummary } from "@/src/actions/dashboard";

export type FinancialInsight = Readonly<{
  headline: string;
  actionableTip: string;
}>;

const fallbackInsight: FinancialInsight = {
  headline: "Your spending is tracking normally.",
  actionableTip:
    "Keep logging your daily transactions to build a clearer financial picture.",
};

const insightSchema = z.object({
  headline: z.string().trim().min(1).max(140),
  actionableTip: z.string().trim().min(1).max(180),
});

function createInsightPrompt(metrics: DashboardSummary): string {
  return [
    "Return only valid JSON with keys headline and actionableTip.",
    `User's left-to-spend amount: Rs ${metrics.leftToSpend}`,
    `User's net worth: Rs ${metrics.netWorth}`,
    `Monthly income: Rs ${metrics.currentMonthIncome}`,
    `Monthly expenses: Rs ${metrics.currentMonthExpense}`,
    `Peak spending day: ${metrics.peakSpendingDay}`,
    `Top category: ${metrics.topCategory} (${metrics.topCategoryPct.toFixed(1)}%).`,
    `Weekend spending share: ${(metrics.weekendSpendRatio * 100).toFixed(1)}%.`,
    `Daily average spend: Rs ${metrics.dailyAverageSpend}`,
  ].join("\n");
}

function extractJsonObject(text: string): string {
  const trimmedText = text.trim();
  const fencedMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const startIndex = trimmedText.indexOf("{");
  const endIndex = trimmedText.lastIndexOf("}");

  if (startIndex >= 0 && endIndex > startIndex) {
    return trimmedText.slice(startIndex, endIndex + 1);
  }

  return trimmedText;
}

function parseInsightResponse(text: string | undefined): FinancialInsight {
  if (!text) {
    return fallbackInsight;
  }

  const parsedJson: unknown = JSON.parse(extractJsonObject(text));
  const parsedInsight = insightSchema.safeParse(parsedJson);

  return parsedInsight.success ? parsedInsight.data : fallbackInsight;
}

async function withTimeout<TValue>(
  promise: Promise<TValue>,
  timeoutMs: number,
): Promise<TValue> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Gemini request timed out.")), timeoutMs);
    }),
  ]);
}

export async function generateFinancialInsight(
  metrics: DashboardSummary,
): Promise<FinancialInsight> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallbackInsight;
  }

  try {
    const gemini = new GoogleGenAI({ apiKey });
    const response = await withTimeout(
      gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: createInsightPrompt(metrics),
        config: {
          responseMimeType: "application/json",
          systemInstruction:
            "Analyze this financial data and return a JSON object with a 1-sentence headline and a 1-sentence actionableTip. Keep the tone calm, non-judgmental, and free of financial jargon.",
          temperature: 0.4,
        },
      }),
      2500,
    );

    return parseInsightResponse(response.text);
  } catch {
    return fallbackInsight;
  }
}
