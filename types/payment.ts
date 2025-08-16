export type PaymentRequest = {
  accountNumber: string
  recipientAccountNumber: string
  amount: number
  currency: string
  paymentMethod: string
  description: string
  reference: string
  cardToken: string
  paymentGateway: string
}

export type PaymentSuccessResponse = {
  success: true
  transactionId: string
  reference: string
  amount: number
  currency: string
  timestamp: string
  message: string
}

export type PaymentErrorResponse = {
  success: false
  error: string
  responseMessage: string
  code?: string
}

export type PaymentResponse = PaymentSuccessResponse | PaymentErrorResponse
