"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatRelativeTime } from "@/utils/format"
import type { Transaction } from "@/types/transaction"
import { useTransactionsWS } from "@/hooks/use-transactions-ws"
import { Wifi, WifiOff } from "lucide-react"

// Mock initial data - would come from API
const mockInitialTransactions: Transaction[] = [
  {
    id: "txn_001",
    accountNumber: "1234567890123456",
    recipientAccountNumber: "9876543210987654",
    amount: 1250.0,
    currency: "USD",
    status: "completed",
    type: "debit",
    description: "Payment to vendor",
    reference: "REF-2024-001",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    paymentMethod: "digital_wallet",
  },
  {
    id: "txn_002",
    accountNumber: "2345678901234567",
    recipientAccountNumber: "1234567890123456",
    amount: 750.5,
    currency: "USD",
    status: "pending",
    type: "credit",
    description: "Salary deposit",
    reference: "REF-2024-002",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    paymentMethod: "bank_transfer",
  },
  {
    id: "txn_003",
    accountNumber: "3456789012345678",
    recipientAccountNumber: "8765432109876543",
    amount: 2100.0,
    currency: "USD",
    status: "failed",
    type: "debit",
    description: "Invoice payment",
    reference: "REF-2024-003",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    paymentMethod: "instant_transfer",
  },
  {
    id: "txn_004",
    accountNumber: "4567890123456789",
    recipientAccountNumber: "7654321098765432",
    amount: 500.0,
    currency: "USD",
    status: "completed",
    type: "debit",
    description: "Utility payment",
    reference: "REF-2024-004",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    paymentMethod: "digital_wallet",
  },
]

const statusColors = {
  completed: "bg-success/10 text-success border-success/20",
  pending: "bg-secondary/10 text-secondary border-secondary/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
}

export const TransactionsTable = React.memo(() => {
  const { transactions, isConnected } = useTransactionsWS(mockInitialTransactions)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Transactions</span>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-success text-sm">
                <Wifi className="h-4 w-4" />
                <span>Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <WifiOff className="h-4 w-4" />
                {/*<span>Offline</span>*/}
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Transaction</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Method</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/50 ${
                    index === 0 ? "animate-pulse bg-primary/5" : ""
                  }`}
                >
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-foreground">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground font-mono">{transaction.reference}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div
                      className={`font-medium ${transaction.type === "credit" ? "text-success" : "text-foreground"}`}
                    >
                      {transaction.type === "credit" ? "+" : "-"}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className={statusColors[transaction.status]}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground capitalize">
                      {transaction.paymentMethod.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{formatRelativeTime(transaction.timestamp)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No transactions available</div>
        )}
      </CardContent>
    </Card>
  )
})

TransactionsTable.displayName = "TransactionsTable"
