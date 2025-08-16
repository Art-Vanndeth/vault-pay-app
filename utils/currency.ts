export const EXCHANGE_RATE = {
  USD_TO_KHR: 4000,
  KHR_TO_USD: 1 / 4000,
} as const

export const SUPPORTED_CURRENCIES = ["USD", "KHR"] as const
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
): number {
  if (fromCurrency === toCurrency) return amount

  if (fromCurrency === "USD" && toCurrency === "KHR") {
    return amount * EXCHANGE_RATE.USD_TO_KHR
  }

  if (fromCurrency === "KHR" && toCurrency === "USD") {
    return amount * EXCHANGE_RATE.KHR_TO_USD
  }

  return amount
}

export function formatCurrency(amount: number, currency: SupportedCurrency): string {
  if (currency === "USD") {
    return `$${amount.toFixed(2)}`
  }

  if (currency === "KHR") {
    return `${amount.toLocaleString()}៛`
  }

  return `${amount} ${currency}`
}

export function getCurrencySymbol(currency: SupportedCurrency): string {
  return currency === "USD" ? "$" : "៛"
}
