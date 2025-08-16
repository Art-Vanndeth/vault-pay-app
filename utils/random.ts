export const generateReference = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `REF-${timestamp}-${random}`.toUpperCase()
}

export const generateCardToken = (): string => {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16))
    .join("")
    .toUpperCase()
}

export const getRandomPaymentGateway = (): string => {
  const gateways = ["VISA", "MASTERCARD", "AMEX", "DISCOVER", "PAYPAL"]
  return gateways[Math.floor(Math.random() * gateways.length)]
}

export const generateMockAccountNumber = (): string => {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join("")
}
