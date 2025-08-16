export type Account = {
  id: string
  accountNumber: string
  accountName: string
  balance: number
  currency: string
  status: "active" | "frozen" | "closed"
  type: "savings" | "checking" | "business"
  createdAt: string
  lastActivity: string
}
