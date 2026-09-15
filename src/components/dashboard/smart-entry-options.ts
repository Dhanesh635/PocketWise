export type EntryMode = "EXPENSE" | "INCOME";

export type TransactionCategory =
  | "HOME"
  | "EDUCATION"
  | "SHOPPING"
  | "TRANSPORT"
  | "NUTRITION"
  | "FREELANCE"
  | "SALARY"
  | "OTHER";

export type EntryCategory = TransactionCategory;

export const entryModes: readonly { label: string; value: EntryMode }[] = [
  { label: "Expense", value: "EXPENSE" },
  { label: "Income", value: "INCOME" },
];

export const categoriesByMode: Record<EntryMode, readonly EntryCategory[]> = {
  EXPENSE: ["HOME", "EDUCATION", "SHOPPING", "TRANSPORT", "NUTRITION", "OTHER"],
  INCOME: ["SALARY", "FREELANCE", "OTHER"],
};

export const defaultCategoryByMode: Record<EntryMode, EntryCategory> = {
  EXPENSE: "NUTRITION",
  INCOME: "SALARY",
};
