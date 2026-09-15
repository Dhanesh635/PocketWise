const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compactDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
});

export function formatCurrency(amount: string | number): string {
  return currencyFormatter.format(Number(amount));
}

export function formatCompactDate(date: string): string {
  return compactDateFormatter.format(new Date(date));
}
