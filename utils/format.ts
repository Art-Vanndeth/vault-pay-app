export const formatCurrency = (amount: number, currency = "USD"): string => {
    if (currency === "KHR") {
        // KHR usually has no decimal, use "km-KH" locale, symbol ៛
        return new Intl.NumberFormat("km-KH", {
            style: "currency",
            currency: "KHR",
            currencyDisplay: "narrowSymbol",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }
    // Default to USD, symbol $
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits: 2,
    }).format(amount)
}

export const formatAccountNumber = (accountNumber: string): string => {
    // Format as XXX XXX XXX
    return accountNumber.replace(/(\d{3})(?=\d)/g, "$1 ")
}

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

export const formatDateTransaction = (dateArray: number[]): string => {
    // Convert [year, month, day, hour, minute, second, ms] to Date
    // Note: month is 1-based in input, but 0-based in JS Date
    const [year, month, day, hour, minute, second, ms] = dateArray
    const date = new Date(year, month - 1, day, hour, minute, second, ms)
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
}

export const formatRelativeTime = (dateString: string): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}
