"use client"

import { useEffect, useState, useRef } from "react"
import { WebSocketService } from "@/lib/websocket-service"
import type { Transaction } from "@/types/transaction"

type UseTransactionsWSReturn = {
  transactions: Transaction[]
  connectionStatus: string
  isConnected: boolean
}

export function useTransactionsWS(initialTransactions: Transaction[] = []): UseTransactionsWSReturn {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected")
  const wsServiceRef = useRef<WebSocketService | null>(null)

  useEffect(() => {
    const wsService = WebSocketService.getInstance()
    wsServiceRef.current = wsService

    const loadTransactions = async () => {
      try {
        const data = await wsService.fetchInitialTransactions()
        const transformedTransactions = data.map((item: any) => ({
          id: item.transactionId,
          accountNumber: item.fromAccountNumber,
          recipientAccountNumber: item.toAccountNumber,
          amount: item.amount,
          currency: item.currency,
          status: item.status.toLowerCase(),
          type: item.transactionType.toLowerCase(),
          description: item.description,
          reference: item.paymentId,
          timestamp: new Date(
            item.updatedAt[0],
            item.updatedAt[1] - 1,
            item.updatedAt[2],
            item.updatedAt[3],
            item.updatedAt[4],
            item.updatedAt[5],
          ).toISOString(),
          paymentMethod: "digital_wallet",
        }))
        setTransactions(transformedTransactions)
      } catch (error) {
        console.warn("[v0] Failed to load transactions from API, using demo mode")
      }
    }

    // Set up WebSocket listeners
    const unsubscribeTransaction = wsService.onTransaction((transaction) => {
      const newTransaction: Transaction = {
        id: transaction.id || `ws_${Date.now()}`,
        accountNumber: transaction.accountNumber || "",
        recipientAccountNumber: transaction.recipientAccountNumber || "",
        amount: transaction.amount || 0,
        currency: transaction.currency || "USD",
        status: (transaction.status || "pending").toLowerCase(),
        type: (transaction.type || "debit").toLowerCase(),
        description: transaction.description || "",
        reference: transaction.reference || "",
        timestamp: new Date().toISOString(),
        paymentMethod: "digital_wallet",
      }
      setTransactions((prev) => [newTransaction, ...prev.slice(0, 49)]) // Keep only latest 50
    })

    const unsubscribeStatus = wsService.onStatusChange((status) => {
      setConnectionStatus(status)
    })

    // Connect and load data
    wsService.connect()
    loadTransactions()

    return () => {
      unsubscribeTransaction()
      unsubscribeStatus()
    }
  }, [])

  const isConnected = connectionStatus === "connected"

  return {
    transactions,
    connectionStatus,
    isConnected,
  }
}
