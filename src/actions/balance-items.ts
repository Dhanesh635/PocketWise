"use server";

import type { BalanceItem } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { balanceItemSchema } from "@/src/lib/validations/balance-item";

type ActionResult<TData> =
  | Readonly<{ success: true; data: TData }>
  | Readonly<{ success: false; error: string }>;

type SerializedBalanceItem = Readonly<{
  id: string;
  name: string;
  type: BalanceItem["type"];
  valuation: string;
  updatedAt: string;
}>;

function serializeBalanceItem(item: BalanceItem): SerializedBalanceItem {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    valuation: item.valuation.toFixed(2),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function parseActionError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid balance item data.";
  }

  return "Unable to save the balance item.";
}

export async function createBalanceItem(
  data: unknown,
): Promise<ActionResult<SerializedBalanceItem>> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, error: "You must be signed in." };
  }

  try {
    const validatedItem = balanceItemSchema.parse(data);
    const item = await prisma.balanceItem.create({
      data: {
        userId: currentUser.id,
        name: validatedItem.name,
        type: validatedItem.type,
        valuation: validatedItem.valuation,
      },
    });

    revalidatePath("/dashboard");

    return { success: true, data: serializeBalanceItem(item) };
  } catch (error) {
    return { success: false, error: parseActionError(error) };
  }
}
