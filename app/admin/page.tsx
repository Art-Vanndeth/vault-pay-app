"use client"

import { StatsCard } from "@/components/common/stats-card"
import { VolumeChart } from "@/components/dashboard/volume-chart"
import { StatusPieChart } from "@/components/dashboard/status-pie-chart"
import { TransactionsTable } from "@/components/dashboard/transactions-table"
import { Users, CreditCard, DollarSign, Clock, Activity } from "lucide-react"
import { useEffect, useState } from "react"
import { accountService, transactionService } from "@/lib/api-client"

// Normalize API values that may be number | string | { total: number | string }
const toNum = (v: unknown): number => {
  if (typeof v === "number") return v
  if (typeof v === "string") {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  if (v && typeof v === "object" && "total" in (v as Record<string, unknown>)) {
    return toNum((v as any).total)
  }
  return 0
}

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState({
    totalAccounts: 0,
    totalTransactions: 0,
    totalVolume: 0,
    pendingTransactions: 0,
    activeAccounts: 0,
  })

  useEffect(() => {
    let isMounted = true

    async function fetchStats() {
      try {
        const [totalAccountsRes, totalTxRes, totalVolumeRes, initiatedRes, activeAccountsRes] = await Promise.all([
          accountService.getTotalAccounts(),
          transactionService.getTotalTransactions(),
          accountService.getTotalVolume(),
          transactionService.getInitiateTransactions(),
          accountService.getActiveAccount(),
        ])

        const totalAccounts = toNum(totalAccountsRes)
        const totalTransactions = toNum(totalTxRes)
        const totalVolume = toNum(totalVolumeRes)
        const pendingTransactions = Array.isArray(initiatedRes) ? initiatedRes.length : toNum(initiatedRes)
        const activeAccounts = toNum(activeAccountsRes)

        if (isMounted) {
          setStatsData({
            totalAccounts,
            totalTransactions,
            totalVolume,
            pendingTransactions,
            activeAccounts,
          })
        }
      } catch (err) {
        // Silently fail for now; could add toast/alert if desired
        if (isMounted) {
          setStatsData((prev) => ({ ...prev }))
        }
      }
    }

    fetchStats()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Accounts"
          value={statsData.totalAccounts.toLocaleString()}
          change="+12% from last month"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Total Transactions"
          value={statsData.totalTransactions.toLocaleString()}
          change="+8% from last month"
          changeType="positive"
          icon={CreditCard}
        />
        <StatsCard
          title="Total Volume"
          value={`$${(statsData.totalVolume / 1000).toFixed(1)}K`}
          change="+15% from last month"
          changeType="positive"
          icon={DollarSign}
        />
        <StatsCard
          title="Pending Transactions"
          value={statsData.pendingTransactions}
          change="-5% from yesterday"
          changeType="positive"
          icon={Clock}
        />
        <StatsCard
          title="Active Accounts"
          value={statsData.activeAccounts.toLocaleString()}
          change="+3% from last month"
          changeType="positive"
          icon={Activity}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VolumeChart />
        <StatusPieChart />
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Transactions</h2>
        <TransactionsTable />
      </div>
    </div>
  )
}
