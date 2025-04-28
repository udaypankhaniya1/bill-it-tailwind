
export function formatNumber(value: number): string {
  // Convert to Indian numbering format (e.g., 403000 -> 4,03,000)
  const formatter = new Intl.NumberFormat('en-IN');
  return formatter.format(value);
}

export function calculateGST(value: number, rate = 18): number {
  return (value * rate) / 100;
}

export function parseFormattedNumber(value: string): number {
  // Remove commas and convert to number
  return Number(value.replace(/,/g, ''));
}
