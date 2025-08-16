"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, SnowflakeIcon as Freeze, Play } from "lucide-react"
import { formatCurrency, formatDate } from "@/utils/format"
import type { Account } from "@/types/account"
import { accountService } from "@/lib/api-client"
import toast from "react-hot-toast"

// Mock data
const mockAccounts: Account[] = [
  {
    id: "acc_001",
    accountNumber: "1234567890123456",
    accountName: "John Doe",
    balance: 15750.5,
    currency: "USD",
    status: "active",
    type: "checking",
    createdAt: "2024-01-15T10:30:00Z",
    lastActivity: "2024-01-20T14:22:00Z",
  },
  {
    id: "acc_002",
    accountNumber: "2345678901234567",
    accountName: "Jane Smith",
    balance: 8920.0,
    currency: "USD",
    status: "frozen",
    type: "savings",
    createdAt: "2024-01-10T09:15:00Z",
    lastActivity: "2024-01-18T11:45:00Z",
  },
  {
    id: "acc_003",
    accountNumber: "3456789012345678",
    accountName: "Business Corp",
    balance: 125000.75,
    currency: "USD",
    status: "active",
    type: "business",
    createdAt: "2024-01-05T16:20:00Z",
    lastActivity: "2024-01-20T09:30:00Z",
  },
]

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  frozen: "bg-destructive/10 text-destructive border-destructive/20",
  closed: "bg-muted text-muted-foreground border-border",
}

export function AccountsTable() {
  const [accounts, setAccounts] = useState(mockAccounts)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) || account.accountNumber.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || account.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleFreezeUnfreeze = async (accountId: string, currentStatus: string) => {
    const account = accounts.find((acc) => acc.id === accountId)
    if (!account) return

    const newStatus = currentStatus === "active" ? "frozen" : "active"
    const action = newStatus === "frozen" ? "freeze" : "unfreeze"

    const confirmed = window.confirm(
      `Are you sure you want to ${action} account ${account.accountNumber} (${account.accountName})? This will ${action === "freeze" ? "prevent all transactions" : "restore full access"}.`,
    )
    if (!confirmed) return

    try {
      if (action === "freeze") {
        const response = await accountService.freezeAccount(account.accountNumber)
        console.log("Freeze response:", response)
      } else {
        const response = await accountService.unfreezeAccount(account.accountNumber)
        console.log("Unfreeze response:", response)
      }

      // Update local state on success
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === accountId ? { ...acc, status: newStatus as Account["status"] } : acc)),
      )
      toast.success(`Account ${action}d successfully`)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.reason || error.response?.data?.responseMessage || `Failed to ${action} account`
      toast.error(errorMessage)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Accounts</CardTitle>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="frozen">Frozen</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
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
                <tr key={account.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-foreground">{account.accountName}</div>
                      <div className="text-sm text-muted-foreground font-mono">{account.accountNumber}</div>
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
                    <span className="text-sm text-muted-foreground">{formatDate(account.lastActivity)}</span>
                  </td>
                  <td className="p-4">
                    {account.status !== "closed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFreezeUnfreeze(account.id, account.status)}
                        className={
                          account.status === "frozen"
                            ? "text-success hover:text-success"
                            : "text-destructive hover:text-destructive"
                        }
                      >
                        {account.status === "frozen" ? (
                          <>
                            <Play className="mr-1 h-3 w-3" />
                            Unfreeze
                          </>
                        ) : (
                          <>
                            <Freeze className="mr-1 h-3 w-3" />
                            Freeze
                          </>
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No accounts found matching your criteria</div>
        )}
      </CardContent>
    </Card>
  )
}
