import { BalanceItemType } from "@prisma/client";
import Decimal from "decimal.js";
import { z } from "zod";

const maxCurrencyAmount = new Decimal("9999999999.99");

function parseDecimal(value: string): Decimal | null {
  try {
    const decimal = new Decimal(value);
    return decimal.isFinite() ? decimal : null;
  } catch {
    return null;
  }
}

const valuationSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).trim())
  .refine((value) => value.length > 0, "Valuation is required.")
  .refine((value) => parseDecimal(value) !== null, "Valuation must be numeric.")
  .refine(
    (value) => parseDecimal(value)?.gt(0) ?? false,
    "Valuation must be positive.",
  )
  .refine(
    (value) => (parseDecimal(value)?.decimalPlaces() ?? 3) <= 2,
    "Valuation cannot have more than 2 decimal places.",
  )
  .refine(
    (value) => parseDecimal(value)?.lte(maxCurrencyAmount) ?? false,
    "Valuation exceeds the supported currency limit.",
  )
  .transform((value) => new Decimal(value).toFixed(2));

export const balanceItemSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.enum(BalanceItemType),
  valuation: valuationSchema,
});
