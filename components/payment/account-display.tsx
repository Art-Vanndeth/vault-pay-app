"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {useEffect, useState} from "react"
import { formatCurrency, formatAccountNumber } from "@/utils/format"
import toast from "react-hot-toast"
import { accountService} from "@/lib/api-client";
import {Account} from "@/types/account";
import { WebSocketService } from "@/lib/websocket"

export function AccountDisplay() {
    const [showBalance, setShowBalance] = useState(true)
    const [account, setAccount] = useState<Account>()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const firstAccountNumber = "001001001" // Replace with the actual logic to get the first account number
                if (firstAccountNumber) {
                    const response = await accountService.getAccountDetails(firstAccountNumber)
                    setAccount(response)
                }
            } catch (error) {
                toast.error("Failed to load account details")
            } finally {
                setLoading(false)
            }
        }
        void fetchAccount()
    }, [])

    // Real-time balance updates
    useEffect(() => {
        if (!account) return

        // WebSocket for real-time transaction updates
        const wsService = new WebSocketService()

        // Listen for successful payments from this account
        const handlePaymentSuccess = (paymentData: any) => {
            if (paymentData.fromAccountNumber === account.accountNumber) {
                // Deduct the payment amount from available balance
                setAccount(prevAccount => {
                    if (!prevAccount) return prevAccount

                    const deductedAmount = paymentData.amount
                    const newAvailableBalance = (prevAccount.availableBalance || 0) - deductedAmount

                    // Also update the main balance if it exists
                    const newBalance = (prevAccount.balance || 0) - deductedAmount

                    toast.success(`Payment of ${formatCurrency(deductedAmount, prevAccount.currency)} sent successfully`)

                    return {
                        ...prevAccount,
                        availableBalance: newAvailableBalance,
                        balance: newBalance,
                        updatedAt: new Date().toISOString()
                    }
                })
            }
        }

        // Listen for incoming payments to this account
        const handlePaymentReceived = (paymentData: any) => {
            if (paymentData.toAccountNumber === account.accountNumber) {
                // Add the received amount to available balance
                setAccount(prevAccount => {
                    if (!prevAccount) return prevAccount

                    const receivedAmount = paymentData.amount
                    const newAvailableBalance = (prevAccount.availableBalance || 0) + receivedAmount
                    const newBalance = (prevAccount.balance || 0) + receivedAmount

                    toast.success(`Payment of ${formatCurrency(receivedAmount, prevAccount.currency)} received`)

                    return {
                        ...prevAccount,
                        availableBalance: newAvailableBalance,
                        balance: newBalance,
                        updatedAt: new Date().toISOString()
                    }
                })
            }
        }

        // Set up WebSocket event listeners
        wsService.onPaymentSuccess(handlePaymentSuccess)
        wsService.onPaymentReceived(handlePaymentReceived)

        // Connect to WebSocket
        wsService.connect()

        // Listen for custom payment events from payment forms
        const handleCustomPaymentSuccess = (event: CustomEvent) => {
            const { amount, fromAccountNumber, currency } = event.detail

            if (fromAccountNumber === account.accountNumber) {
                setAccount(prevAccount => {
                    if (!prevAccount) return prevAccount

                    const newAvailableBalance = (prevAccount.availableBalance || 0) - amount
                    const newBalance = (prevAccount.balance || 0) - amount

                    return {
                        ...prevAccount,
                        availableBalance: Math.max(0, newAvailableBalance), // Prevent negative balance
                        balance: Math.max(0, newBalance),
                        updatedAt: new Date().toISOString()
                    }
                })
            }
        }

        // Add event listener for custom payment success events
        window.addEventListener('paymentSuccess', handleCustomPaymentSuccess as EventListener)

        // Cleanup
        return () => {
            wsService.disconnect()
            window.removeEventListener('paymentSuccess', handleCustomPaymentSuccess as EventListener)
        }
    }, [account?.accountNumber]) // Only re-run when account number changes

    // Function to manually update balance (can be called from payment components)
    const updateBalance = (amount: number, type: 'debit' | 'credit') => {
        setAccount(prevAccount => {
            if (!prevAccount) return prevAccount

            const balanceChange = type === 'debit' ? -amount : amount
            const newAvailableBalance = (prevAccount.availableBalance || 0) + balanceChange
            const newBalance = (prevAccount.balance || 0) + balanceChange

            return {
                ...prevAccount,
                availableBalance: Math.max(0, newAvailableBalance),
                balance: Math.max(0, newBalance),
                updatedAt: new Date().toISOString()
            }
        })
    }

    // Expose updateBalance function globally for other components to use
    useEffect(() => {
        if (account) {
            (window as any).updateAccountBalance = updateBalance
        }

        return () => {
            delete (window as any).updateAccountBalance
        }
    }, [account])

    const handleCopyAccount = async () => {
        if (!account) return
        try {
            await navigator.clipboard.writeText(account.accountNumber)
            toast.success("Account number copied to clipboard")
        } catch (error) {
            toast.error("Failed to copy account number")
        }
    }

    if (loading) {
        return (
            <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-0">
                <CardContent className="p-6">
                    <div className="animate-pulse">
                        <div className="h-4 bg-primary-foreground/20 rounded w-32 mb-2"></div>
                        <div className="h-8 bg-primary-foreground/20 rounded w-48 mb-4"></div>
                        <div className="h-4 bg-primary-foreground/20 rounded w-40"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!account) {
        return (
            <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-0">
                <CardContent className="p-6">No account found.</CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-0">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-primary-foreground/80 text-sm font-medium">Available Balance</p>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-2xl font-bold transition-all duration-300">
                                {showBalance ? (
                                    account.availableBalance !== undefined
                                        ? formatCurrency(account.availableBalance, account.currency)
                                        : "Balance not available"
                                ) : "••••••••"}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowBalance(!showBalance)}
                                className="text-primary-foreground hover:bg-primary-foreground/10"
                            >
                                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>

                        {/* Show last update time */}
                        {account.updatedAt && (
                            <p className="text-primary-foreground/60 text-xs mt-1">
                                Last updated: {new Date(account.updatedAt).toLocaleTimeString()}
                            </p>
                        )}
                    </div>

                    <div className="text-right">
                        <p className="text-primary-foreground/80 text-sm">
                            {account.type}
                        </p>
                        <p className="text-primary-foreground font-medium">
                            {account.accountHolderName.toUpperCase()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-primary-foreground/20">
                    <div>
                        <p className="text-primary-foreground/80 text-sm">Account Number</p>
                        <p className="text-primary-foreground font-mono text-lg">
                            {formatAccountNumber(account.accountNumber)}
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyAccount}
                        className="text-primary-foreground hover:bg-primary-foreground/10"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}