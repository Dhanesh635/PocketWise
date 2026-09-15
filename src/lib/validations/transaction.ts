import { TransactionCategory, TransactionType } from "@prisma/client";
import Decimal from "decimal.js";
import { z } from "zod";

const maxCurrencyAmount = new Decimal("9999999999.99");

function toDecimal(value: string): Decimal | null {
  try {
    const decimal = new Decimal(value);
    return decimal.isFinite() ? decimal : null;
  } catch {
    return null;
  }
}

const amountSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).trim())
  .refine((value) => value.length > 0, "Amount is required.")
  .refine((value) => toDecimal(value) !== null, "Amount must be numeric.")
  .refine((value) => toDecimal(value)?.gt(0) ?? false, "Amount must be positive.")
  .refine(
    (value) => (toDecimal(value)?.decimalPlaces() ?? 3) <= 2,
    "Amount cannot have more than 2 decimal places.",
  )
  .refine(
    (value) => toDecimal(value)?.lte(maxCurrencyAmount) ?? false,
    "Amount exceeds the supported currency limit.",
  )
  .transform((value) => new Decimal(value).toFixed(2));

export const transactionSchema = z.object({
  amount: amountSchema,
  type: z.enum(TransactionType),
  category: z.enum(TransactionCategory),
  date: z.coerce.date(),
  note: z
    .string()
    .trim()
    .max(255, "Note cannot exceed 255 characters.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  isRecurring: z.coerce.boolean().default(false),
});

export const transactionIdSchema = z.string().uuid("Invalid transaction id.");

export const transactionLimitSchema = z
  .number()
  .int()
  .min(1)
  .max(100)
  .default(50);

export type TransactionInput = z.input<typeof transactionSchema>;
export type ValidatedTransactionInput = z.output<typeof transactionSchema>;
