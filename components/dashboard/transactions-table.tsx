"use client"

import React, {useEffect, useState} from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {formatCurrency, formatDateTransaction} from "@/utils/format"
import type { Transaction } from "@/types/transaction"
import {transactionService} from "@/lib/api-client";
import toast from "react-hot-toast";

const statusColors = {
    INITIATED: "bg-success/10 text-success border-success/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  PENDING: "bg-secondary/10 text-secondary border-secondary/20",
  FAILED: "bg-destructive/10 text-destructive border-destructive/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
}

export const TransactionsTable = React.memo(() => {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    // Fetch accounts from API on mount
    useEffect(() => {
        async function fetchTransactions() {
            try {
                const transactions = await transactionService.getAllTransactions()
                // Sort transactions by updatedAt in descending order (newest first)
                const sortedTransactions = transactions.sort((a: Transaction, b: Transaction) => {
                    // Convert array format [year, month, day, hour, minute, second, nanosecond] to timestamp
                    const dateA = new Date(a.updatedAt[0], a.updatedAt[1] - 1, a.updatedAt[2], a.updatedAt[3], a.updatedAt[4], a.updatedAt[5]).getTime()
                    const dateB = new Date(b.updatedAt[0], b.updatedAt[1] - 1, b.updatedAt[2], b.updatedAt[3], b.updatedAt[4], b.updatedAt[5]).getTime()
                    return dateB - dateA
                })
                setTransactions(sortedTransactions)
            } catch (error: any) {
                toast.error("Failed to load transactions")
            }
        }

        void fetchTransactions()
    }, [])


  return (
    <Card>
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
                  key={transaction.transactionId}
                  className={`border-b border-border last:border-0 hover:bg-muted/50 ${
                    index === 0 ? "animate-pulse bg-primary/5" : ""
                  }`}
                >
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-foreground">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground font-mono">{transaction.transactionReference}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div
                      className={`font-medium ${transaction.transactionType === "CREDIT" ? "text-success" : "text-foreground"}`}
                    >
                      {transaction.transactionType === "CREDIT" ? "+" : "-"}
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
                    <span className="text-sm text-muted-foreground">{formatDateTransaction(transaction.updatedAt)}</span>
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
