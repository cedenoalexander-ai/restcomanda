/**
 * Utility functions to format prices in USD and Bolívares (Bs.) using BCV exchange rate
 */

export function formatUSD(amount: number, symbol = '$'): string {
  const safe = Number(amount) || 0;
  return `${symbol}${safe.toFixed(2)}`;
}

export function formatBs(amountInUSD: number, bcvRate: number): string {
  const rate = Number(bcvRate) > 0 ? Number(bcvRate) : 1;
  const bsAmount = (Number(amountInUSD) || 0) * rate;
  return `Bs. ${bsAmount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDual(amountInUSD: number, bcvRate: number, symbol = '$'): string {
  return `${formatUSD(amountInUSD, symbol)} • ${formatBs(amountInUSD, bcvRate)}`;
}

export function calculateBs(amountInUSD: number, bcvRate: number): number {
  const rate = Number(bcvRate) > 0 ? Number(bcvRate) : 1;
  return Number(((Number(amountInUSD) || 0) * rate).toFixed(2));
}
