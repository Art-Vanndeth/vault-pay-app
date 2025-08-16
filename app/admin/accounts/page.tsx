"use client"

import { AccountsTable } from "@/components/accounts/accounts-table"

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Accounts Management</h1>
        <p className="text-muted-foreground">Manage user accounts, view balances, and control account status</p>
      </div>

      <AccountsTable />
    </div>
  )
}
