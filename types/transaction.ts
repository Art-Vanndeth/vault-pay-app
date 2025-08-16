export type Transaction = {
  id: string
  accountNumber: string
  recipientAccountNumber: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "cancelled"
  type: "debit" | "credit"
  description: string
  reference: string
  timestamp: string
  paymentMethod: string
  paymentGateway?: string
}
