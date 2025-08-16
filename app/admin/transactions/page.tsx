"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Download, Filter, Search} from "lucide-react"
import {formatCurrency, formatDateTransaction} from "@/utils/format"
import type {Transaction} from "@/types/transaction"
import React, {useEffect, useState} from "react"
import {transactionService} from "@/lib/api-client";
import toast from "react-hot-toast";

const statusColors = {
    INITIATED: "bg-success/10 text-success border-success/20",
    COMPLETED: "bg-success/10 text-success border-success/20",
    PENDING: "bg-secondary/10 text-secondary border-secondary/20",
    FAILED: "bg-destructive/10 text-destructive border-destructive/20",
    CANCELLED: "bg-muted text-muted-foreground border-border",
}

const typeColors = {
    CREDIT: "bg-success/10 text-success border-success/20",
    DEBIT: "bg-secondary/10 text-secondary border-secondary/20",
}

export default function TransactionsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [dateRange, setDateRange] = useState("all")
    const [transactions, setTransactions] = useState<Transaction[]>([])

    // Fetch accounts from API on mount
    useEffect(() => {
        async function fetchTransactions() {
            try {
                const transactions = await transactionService.getAllTransactions()
                setTransactions(transactions)
                console.log("TRANSACTIONS", transactions)
            } catch (error: any) {
                toast.error("Failed to load transactions")
            }
        }

        void fetchTransactions()
    }, [])


    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch =
            transaction.transactionReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.fromAccountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.transactionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
                <p className="text-muted-foreground">View and manage all transaction records</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction Backup</CardTitle>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <Filter className="mr-2 h-4 w-4"/>
                                <SelectValue placeholder="Filter by status"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="INITIATED">Initiated</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4"/>
                            Export
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-4 font-medium text-muted-foreground">Transaction</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Account</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Method</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.transactionId}
                                    className="border-b border-border last:border-0 hover:bg-muted/50">
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium text-foreground">{transaction.description}</div>
                                            <div
                                                className="text-sm text-muted-foreground font-mono">{transaction.transactionReference}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div
                                            className="text-sm text-muted-foreground font-mono">{transaction.fromAccountNumber}</div>
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
                                        <span className="text-sm text-muted-foreground capitalize">
                                            {transaction.paymentMethod.replace("_", " ")}
                                        </span>
                                    </td>

                                    <td className="p-4">
                                        <Badge variant="outline" className={statusColors[transaction.status]}>
                                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                        </Badge>
                                    </td>

                                    <td className="p-4">
                                        <Badge variant="outline" className={typeColors[transaction.transactionType]}>
                                            {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                                        </Badge>
                                    </td>

                                    <td className="p-4">
                                        <span
                                            className="text-sm text-muted-foreground">{formatDateTransaction(transaction.updatedAt)}</span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
