"use server";

import { BalanceItemType } from "@prisma/client";
import Decimal from "decimal.js";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type OnboardingActionResult =
  | Readonly<{ success: true }>
  | Readonly<{ success: false; error: string }>;

const moneySchema = z
  .union([z.string(), z.number()])
  .transform((value, context) => {
    try {
      const decimal = new Decimal(value);

      if (!decimal.isFinite() || decimal.isNegative()) {
        context.addIssue({
          code: "custom",
          message: "Enter a valid non-negative rupee amount.",
        });
        return z.NEVER;
      }

      return decimal.toDecimalPlaces(2).toFixed(2);
    } catch {
      context.addIssue({
        code: "custom",
        message: "Enter a valid rupee amount.",
      });
      return z.NEVER;
    }
  });

const onboardingSchema = z.object({
  age: z.coerce.number().int().min(16, "Age must be at least 16.").max(100),
  gender: z
    .string()
    .trim()
    .min(1, "Select a gender option.")
    .max(80, "Gender must be 80 characters or fewer."),
  monthlyIncome: moneySchema,
  baselineMonthlyExpenses: moneySchema,
  bankSavings: moneySchema,
  outstandingDebt: moneySchema,
});

export async function submitOnboarding(
  data: unknown,
): Promise<OnboardingActionResult> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, error: "You must be signed in." };
  }

  const parsedData = onboardingSchema.safeParse(data);

  if (!parsedData.success) {
    return {
      success: false,
      error: parsedData.error.issues[0]?.message ?? "Check your baseline details.",
    };
  }

  const baselineBalanceNames = [
    "Baseline Bank Savings",
    "Baseline Outstanding Debt",
  ];
  const bankSavings = new Decimal(parsedData.data.bankSavings);
  const outstandingDebt = new Decimal(parsedData.data.outstandingDebt);
  const balanceItems = [
    ...(bankSavings.gt(0)
      ? [
          {
            userId: currentUser.id,
            name: "Baseline Bank Savings",
            type: BalanceItemType.ASSET,
            valuation: parsedData.data.bankSavings,
          },
        ]
      : []),
    ...(outstandingDebt.gt(0)
      ? [
          {
            userId: currentUser.id,
            name: "Baseline Outstanding Debt",
            type: BalanceItemType.LIABILITY,
            valuation: parsedData.data.outstandingDebt,
          },
        ]
      : []),
  ];

  await prisma.$transaction(async (transaction) => {
    await transaction.userProfile.upsert({
      where: { userId: currentUser.id },
      update: {
        age: parsedData.data.age,
        gender: parsedData.data.gender,
        monthlyIncome: parsedData.data.monthlyIncome,
        baselineMonthlyExpenses: parsedData.data.baselineMonthlyExpenses,
        isOnboarded: true,
      },
      create: {
        userId: currentUser.id,
        age: parsedData.data.age,
        gender: parsedData.data.gender,
        monthlyIncome: parsedData.data.monthlyIncome,
        baselineMonthlyExpenses: parsedData.data.baselineMonthlyExpenses,
        isOnboarded: true,
      },
    });

    await transaction.balanceItem.deleteMany({
      where: {
        userId: currentUser.id,
        name: { in: baselineBalanceNames },
      },
    });

    if (balanceItems.length > 0) {
      await transaction.balanceItem.createMany({ data: balanceItems });
    }
  });

  revalidatePath("/dashboard");

  return { success: true };
}
