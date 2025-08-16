"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {useEffect, useState} from "react"
import { formatCurrency, formatAccountNumber } from "@/utils/format"
import toast from "react-hot-toast"
import { accountService} from "@/lib/api-client";
import {Account} from "@/types/account";

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
    }, []) // Remove 'account' from dependency array to prevent infinite loop


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
                <CardContent className="p-6">Loading...</CardContent>
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
                            <span className="text-2xl font-bold">
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
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}