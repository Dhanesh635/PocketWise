"use server";

import { InvestmentGoal, RiskTolerance } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { balanceItemSchema } from "@/src/lib/validations/balance-item";

type ActionResult<TData = null> =
  | Readonly<{ success: true; data: TData }>
  | Readonly<{ success: false; error: string }>;

const optionalMoneySchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => (value === null || value === undefined ? "" : String(value).trim()))
  .transform((value) => (value.length === 0 ? null : value))
  .pipe(
    z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Use a valid rupee amount.")
      .nullable(),
  );

const profileSchema = z.object({
  age: z.coerce.number().int().min(16).max(100).optional(),
  monthlyIncome: optionalMoneySchema.optional(),
  baselineMonthlyExpenses: optionalMoneySchema.optional(),
  riskLevel: z.enum(RiskTolerance).optional(),
  goalHorizon: z.enum(InvestmentGoal).optional(),
});

function revalidateProfileSurfaces(): void {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
}

export async function updateFinancialProfile(
  data: unknown,
): Promise<ActionResult> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, error: "You must be signed in." };
  }

  const parsedData = profileSchema.safeParse(data);

  if (!parsedData.success) {
    return {
      success: false,
      error: parsedData.error.issues[0]?.message ?? "Check your profile details.",
    };
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.userProfile.upsert({
      where: { userId: currentUser.id },
      update: {
        age: parsedData.data.age,
        monthlyIncome: parsedData.data.monthlyIncome,
        baselineMonthlyExpenses: parsedData.data.baselineMonthlyExpenses,
      },
      create: {
        userId: currentUser.id,
        age: parsedData.data.age,
        monthlyIncome: parsedData.data.monthlyIncome,
        baselineMonthlyExpenses: parsedData.data.baselineMonthlyExpenses,
        isOnboarded: true,
      },
    });

    if (parsedData.data.riskLevel || parsedData.data.goalHorizon) {
      await transaction.userPortfolio.upsert({
        where: { userId: currentUser.id },
        update: {
          riskLevel: parsedData.data.riskLevel,
          goalHorizon: parsedData.data.goalHorizon,
        },
        create: {
          userId: currentUser.id,
          riskLevel: parsedData.data.riskLevel ?? RiskTolerance.MEDIUM,
          goalHorizon: parsedData.data.goalHorizon ?? InvestmentGoal.MEDIUM_TERM,
          fdAllocation: 40,
          mfAllocation: 40,
          bondAllocation: 20,
        },
      });
    }
  });

  revalidateProfileSurfaces();

  return { success: true, data: null };
}

export async function addBalanceItem(data: unknown): Promise<ActionResult> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, error: "You must be signed in." };
  }

  const parsedData = balanceItemSchema.safeParse(data);

  if (!parsedData.success) {
    return {
      success: false,
      error: parsedData.error.issues[0]?.message ?? "Check the balance item.",
    };
  }

  await prisma.balanceItem.create({
    data: {
      userId: currentUser.id,
      name: parsedData.data.name,
      type: parsedData.data.type,
      valuation: parsedData.data.valuation,
    },
  });

  revalidateProfileSurfaces();

  return { success: true, data: null };
}

export async function deleteBalanceItem(id: string): Promise<ActionResult> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, error: "You must be signed in." };
  }

  const deletedItems = await prisma.balanceItem.deleteMany({
    where: { id, userId: currentUser.id },
  });

  if (deletedItems.count === 0) {
    return { success: false, error: "Balance item not found." };
  }

  revalidateProfileSurfaces();

  return { success: true, data: null };
}
