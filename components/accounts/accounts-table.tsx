"use client"

import {useEffect, useState} from "react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {Search, Filter, SnowflakeIcon as Freeze, Play} from "lucide-react"
import {formatAccountNumber, formatCurrency, formatDate} from "@/utils/format"
import type {Account} from "@/types/account"
import {accountService} from "@/lib/api-client"
import toast from "react-hot-toast"

const statusColors: { ACTIVE: string; FROZEN: string; SUSPENDED: string; CLOSED: string } = {
    ACTIVE: "bg-success/10 text-success border-success/20",
    FROZEN: "bg-destructive/10 text-destructive border-destructive/20",
    SUSPENDED: "bg-warning/10 text-warning border-warning/20",
    CLOSED: "bg-muted text-muted-foreground border-border",
}

export function AccountsTable() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
    const [pendingAction, setPendingAction] = useState<"FREEZE" | "UNFREEZE" | null>(null)

    // Fetch accounts from API on mount
    useEffect(() => {
        async function fetchAccounts() {
            try {
                const accounts = await accountService.getAllAccounts()
                // Sort by updatedAt desc (newest first)
                const sorted = accounts.sort((a: Account, b: Account) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                )
                setAccounts(sorted)
            } catch (error: any) {
                toast.error("Failed to load accounts")
            }
        }

        void fetchAccounts()
    }, [])


    const filteredAccounts = accounts.filter((account) => {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
            account.accountNumber.toLowerCase().includes(searchLower) ||
            account.accountHolderName.toLowerCase().includes(searchLower) ||
            account.status.toLowerCase().includes(searchLower) ||
            account.type.toLowerCase().includes(searchLower)
        const matchesStatus = statusFilter === "all" || account.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const handleFreezeUnfreeze = async (accountNumber: string, currentStatus: Account["status"]) => {
        const account = accounts.find((acc) => acc.accountNumber === accountNumber)
        if (!account) return

        // If account is ACTIVE, freeze it. If it's any other status, activate it
        const action = currentStatus === "ACTIVE" ? "FREEZE" : "UNFREEZE"

        // Open confirmation dialog
        setSelectedAccount(account)
        setPendingAction(action)
        setConfirmDialogOpen(true)
    }

    const confirmAction = async () => {
        if (!selectedAccount || !pendingAction) return

        try {
            if (pendingAction === "FREEZE") {
                await accountService.freezeAccount(selectedAccount.accountNumber)
            } else {
                // For any non-ACTIVE status, use unfreeze to activate
                await accountService.unfreezeAccount(selectedAccount.accountNumber)
            }

            const newStatus: Account["status"] = pendingAction === "FREEZE" ? "FROZEN" : "ACTIVE"
            setAccounts((prev) => prev.map((acc) =>
                acc.accountNumber === selectedAccount.accountNumber
                    ? {...acc, status: newStatus}
                    : acc
            ))

            const actionText = pendingAction === "FREEZE" ? "frozen" : "activated"
            toast.success(`Account ${actionText} successfully`)
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error?.reason ||
                error.response?.data?.responseMessage ||
                `Failed to ${pendingAction === "FREEZE" ? "freeze" : "activate"} account`
            toast.error(errorMessage)
        } finally {
            setConfirmDialogOpen(false)
            setSelectedAccount(null)
            setPendingAction(null)
        }
    }

    const cancelAction = () => {
        setConfirmDialogOpen(false)
        setSelectedAccount(null)
        setPendingAction(null)
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>All Accounts</CardTitle>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder="Search by name or account number..."
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
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="FROZEN">Frozen</SelectItem>
                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                <SelectItem value="CLOSE">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-4 font-medium text-muted-foreground">Account</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Balance</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Last Activity</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAccounts.map((account) => (
                                <tr key={account.accountNumber} className="border-b border-border last:border-0 hover:bg-muted/50">
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium text-foreground">{account.accountHolderName}</div>
                                            <div className="text-sm text-muted-foreground font-mono">{formatAccountNumber(account.accountNumber)}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-foreground">
                                            {formatCurrency(account.balance, account.currency)}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-muted-foreground capitalize">{account.type}</span>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className={statusColors[account.status]}>
                                            {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-muted-foreground">{formatDate(account.updatedAt)}</span>
                                    </td>
                                    <td className="p-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleFreezeUnfreeze(account.accountNumber, account.status)}
                                            className={
                                                account.status !== "ACTIVE"
                                                    ? "text-success hover:text-success"
                                                    : "text-destructive hover:text-destructive"
                                            }
                                        >
                                            {account.status !== "ACTIVE" ? (
                                                <>
                                                    <Play className="mr-1 h-3 w-3" />
                                                    Activate
                                                </>
                                            ) : (
                                                <>
                                                    <Freeze className="mr-1 h-3 w-3" />
                                                    Freeze
                                                </>
                                            )}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredAccounts.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">No accounts found matching your
                            criteria</div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <AlertDialogContent className="sm:max-w-[500px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold">
                            {pendingAction === "FREEZE" ? "Freeze Account" : "Activate Account"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground">
                            {selectedAccount && (
                                <>
                                    Are you sure you want to {pendingAction === "FREEZE" ? "freeze" : "activate"} account{" "}
                                    <span className="font-medium text-foreground">
                                        {selectedAccount.accountNumber}
                                    </span>{" "}
                                    belonging to{" "}
                                    <span className="font-medium text-foreground">
                                        {selectedAccount.accountHolderName}
                                    </span>
                                    ?
                                    <br />
                                    <br />
                                    This will{" "}
                                    {pendingAction === "FREEZE"
                                        ? "prevent all transactions on this account"
                                        : "restore full access to this account"
                                    }.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel asChild>
                            <Button variant="outline" onClick={cancelAction}>
                                Cancel
                            </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button
                                variant={pendingAction === "FREEZE" ? "destructive" : "default"}
                                onClick={confirmAction}
                                className={
                                    pendingAction === "UNFREEZE"
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : ""
                                }
                            >
                                {pendingAction === "FREEZE" ? (
                                    <>
                                        <Freeze className="mr-2 h-4 w-4" />
                                        Freeze Account
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Activate Account
                                    </>
                                )}
                            </Button>
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
