"use client"

import { StatsCard } from "@/components/common/stats-card"
import { VolumeChart } from "@/components/dashboard/volume-chart"
import { StatusPieChart } from "@/components/dashboard/status-pie-chart"
import { TransactionsTable } from "@/components/dashboard/transactions-table"
import { Users, CreditCard, DollarSign, Clock, Activity } from "lucide-react"

// Mock data - will be replaced with real API calls
const statsData = {
  totalAccounts: 1247,
  totalTransactions: 8934,
  totalVolume: 2847392.5,
  pendingTransactions: 23,
  activeAccounts: 1189,
}

export default function AdminDashboard() {
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
          value={`$${(statsData.totalVolume / 1000000).toFixed(1)}M`}
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
