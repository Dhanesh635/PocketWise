export function sanitizeWholeRupeeInput(value: string): string {
  if (value.trim().length === 0) {
    return "";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return "";
  }

  return String(Math.round(numericValue));
}

export function formatIndianNumber(value: string): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || value.trim().length === 0) {
    return "₹0";
  }

  return `₹${new Intl.NumberFormat("en-IN").format(Math.round(numericValue))}`;
}
