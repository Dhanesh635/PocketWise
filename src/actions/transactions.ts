"use server";

import type { Transaction } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  transactionIdSchema,
  transactionLimitSchema,
  transactionSchema,
} from "@/src/lib/validations/transaction";

type ActionResult<TData> =
  | Readonly<{ success: true; data: TData }>
  | Readonly<{ success: false; error: string }>;

export type SerializedTransaction = Readonly<{
  id: string;
  amount: string;
  type: Transaction["type"];
  category: Transaction["category"];
  note: string | null;
  date: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}>;

function serializeTransaction(
  transaction: Transaction,
): SerializedTransaction {
  return {
    id: transaction.id,
    amount: transaction.amount.toFixed(2),
    type: transaction.type,
    category: transaction.category,
    note: transaction.note,
    date: transaction.date.toISOString(),
    isRecurring: transaction.isRecurring,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
}

function parseActionError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid transaction data.";
  }

  return "Unable to complete the transaction request.";
}

export async function createTransaction(
  data: unknown,
): Promise<ActionResult<SerializedTransaction>> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, error: "You must be signed in." };
  }

  try {
    const validatedTransaction = transactionSchema.parse(data);
    const transaction = await prisma.transaction.create({
      data: {
        userId: currentUser.id,
        amount: validatedTransaction.amount,
        type: validatedTransaction.type,
        category: validatedTransaction.category,
        date: validatedTransaction.date,
        note: validatedTransaction.note,
        isRecurring: validatedTransaction.isRecurring,
      },
    });

    revalidatePath("/dashboard");

    return { success: true, data: serializeTransaction(transaction) };
  } catch (error) {
    return { success: false, error: parseActionError(error) };
  }
}

export async function getTransactions(
  limit?: number,
): Promise<ActionResult<readonly SerializedTransaction[]>> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, error: "You must be signed in." };
  }

  try {
    const take = transactionLimitSchema.parse(limit);
    const transactions = await prisma.transaction.findMany({
      where: { userId: currentUser.id },
      orderBy: { date: "desc" },
      take,
    });

    return {
      success: true,
      data: transactions.map(serializeTransaction),
    };
  } catch (error) {
    return { success: false, error: parseActionError(error) };
  }
}

export async function deleteTransaction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, error: "You must be signed in." };
  }

  try {
    const transactionId = transactionIdSchema.parse(id);
    const deleteResult = await prisma.transaction.deleteMany({
      where: {
        id: transactionId,
        userId: currentUser.id,
      },
    });

    if (deleteResult.count === 0) {
      return { success: false, error: "Transaction not found." };
    }

    revalidatePath("/dashboard");

    return { success: true, data: { id: transactionId } };
  } catch (error) {
    return { success: false, error: parseActionError(error) };
  }
}
